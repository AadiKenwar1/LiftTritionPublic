import { graphql } from '../../../utils/graphqlClient';
import { createNutrition, updateNutrition, deleteNutrition } from '../../../graphql/mutations';

export async function syncNutrition(userId, nutritionData, setNutritionData) {
  try {
  // Sync deletions first
  const deletedItems = nutritionData.filter(item => item.deleted);
  if (deletedItems.length > 0) {
    
    const startTime = Date.now();
    const deleteResults = await Promise.allSettled(
      deletedItems.map(item =>
        graphql({
          query: deleteNutrition,
          variables: { input: { id: item.id } }
        }, { userId, authToken: null })
      )
    );
    const duration = Date.now() - startTime;
    
    // Remove successfully deleted items from array
    const deletedIds = deleteResults
      .map((result, index) => {
        const item = deletedItems[index];
        // Success: item deleted from database
        if (result.status === 'fulfilled' && !result.value.errors) {
          return item.id;
        }
        // "Not found": item never existed in DB, safe to remove
        if (result.status === 'rejected' && 
            (result.reason?.message?.includes('not found') || 
             result.reason?.errors?.[0]?.errorType === 'NotFound')) {
          return item.id;
        }
        // Log failures
        if (result.status === 'rejected') {
          console.error(`❌ [Nutrition] Deletion failed:`, item.id, item.name, result.reason);
        } else if (result.status === 'fulfilled' && result.value.errors) {
          console.error(`❌ [Nutrition] Deletion returned errors:`, item.id, item.name, result.value.errors);
        }
        return null;
      })
      .filter(Boolean);
    
    // Remove successfully deleted items from array
    if (deletedIds.length > 0) {
      setNutritionData(prev => {
        const filtered = prev.filter(item => !deletedIds.includes(item.id));
        return filtered;
      });
    }
  }
  
  // Then sync creates/updates
  const unsynced = nutritionData.filter(item => !item.synced && !item.deleted);
  if (unsynced.length === 0) {
    return { success: true, synced: 0 };
  }
  
  const startTime = Date.now();
  const results = await Promise.allSettled(
    unsynced.map(async (item) => {
      const input = {
        id: item.id,
        userId,
        name: item.name,
        date: item.date,
        time: item.time,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        calories: item.calories,
        isPhoto: item.isPhoto || false,
        ingredients: item.ingredients || [],
        saved: item.saved || false,
        isPlaceholder: item.isPlaceholder || false,
        synced: true,
      };

      // Helper function to check if error message indicates a conditional failure
      const isConditionalFailure = (errorMessage) => {
        return errorMessage?.includes('conditional request failed') || 
               errorMessage?.includes('ConditionalCheckFailedException');
      };

      // Try update first (for edited items that exist in DB)
      try {
        const updateResult = await graphql({
          query: updateNutrition,
          variables: { input }
        }, { userId, authToken: null });
        
        // If we get here, update succeeded
        return { success: true, id: item.id };
      } catch (updateError) {
        const updateErrorMessage = updateError?.message || '';
        
        // Check if it's a conditional failure (item doesn't exist)
        if (isConditionalFailure(updateErrorMessage)) {
          // Item doesn't exist, try create
          try {
            const createResult = await graphql({
              query: createNutrition,
              variables: { input }
            }, { userId, authToken: null });
            
            // If we get here, create succeeded
            return { success: true, id: item.id };
          } catch (createError) {
            const createErrorMessage = createError?.message || '';
            
            // If create also fails with conditional error, item was created between attempts (race condition)
            if (isConditionalFailure(createErrorMessage)) {
              // Retry update (item now exists)
              try {
                const retryUpdateResult = await graphql({
                  query: updateNutrition,
                  variables: { input }
                }, { userId, authToken: null });
                
                // If we get here, retry update succeeded
                return { success: true, id: item.id };
              } catch (retryError) {
                console.error(`❌ [Nutrition] Both create and update failed for item ${item.id}:`, retryError.message);
                throw retryError;
              }
            } else {
              // Create failed for a different reason
              throw createError;
            }
          }
        } else {
          // Update failed for a different reason (not conditional failure)
          throw updateError;
        }
      }
    })
  );

  const duration = Date.now() - startTime;
  const syncedIds = results
    .map((result) => {
      if (result.status === 'fulfilled' && result.value?.success) {
        return result.value.id;
      }
      if (result.status === 'fulfilled' && !result.value?.success) {
        console.error(`❌ [Nutrition] Sync failed for item:`, result.value);
      } else if (result.status === 'rejected') {
        console.error(`❌ [Nutrition] Sync rejected:`, result.reason);
      }
      return null;
    })
    .filter(Boolean);

  // Only update state if items were actually synced
  if (syncedIds.length > 0) {
    const syncedSet = new Set(syncedIds);
    setNutritionData(prev =>
      prev.map(item => syncedSet.has(item.id) ? { ...item, synced: true } : item)
    );
  }

  return { success: true, synced: syncedIds.length, failed: unsynced.length - syncedIds.length };
  } catch (error) {
    console.error('❌ [syncNutrition] Fatal error:', error);
    console.error('❌ [syncNutrition] Error message:', error.message);
    console.error('❌ [syncNutrition] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

