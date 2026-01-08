import { graphql } from '../../../utils/graphqlClient';
import { createNutrition, updateNutrition, deleteNutrition } from '../../../graphql/mutations';

export async function syncNutrition(userId, nutritionData, setNutritionData) {
  try {
  // Sync deletions first
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️ [syncNutrition] Starting deletion sync phase');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const deletedItems = nutritionData.filter(item => item.deleted);
  if (deletedItems.length > 0) {
    console.log(`🗑️ [Nutrition] Starting deletion sync for ${deletedItems.length} items`);
    console.log(`🗑️ [Nutrition] Items to delete:`, deletedItems.map(item => ({ id: item.id, name: item.name })));
    
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
    console.log(`🗑️ [Nutrition] Deletion requests completed in ${duration}ms`);
    
    // Remove successfully deleted items from array
    const deletedIds = deleteResults
      .map((result, index) => {
        const item = deletedItems[index];
        // Success: item deleted from database
        if (result.status === 'fulfilled' && !result.value.errors) {
          console.log(`✅ [Nutrition] Successfully deleted from DB:`, item.id, item.name);
          return item.id;
        }
        // "Not found": item never existed in DB, safe to remove
        if (result.status === 'rejected' && 
            (result.reason?.message?.includes('not found') || 
             result.reason?.errors?.[0]?.errorType === 'NotFound')) {
          console.log(`✅ [Nutrition] Item never existed in DB (safe to remove):`, item.id, item.name);
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
    
    console.log(`🗑️ [Nutrition] Removing ${deletedIds.length} successfully deleted items from AsyncStorage`);
    // Remove successfully deleted items from array
    if (deletedIds.length > 0) {
      const beforeCount = nutritionData.length;
      setNutritionData(prev => {
        const filtered = prev.filter(item => !deletedIds.includes(item.id));
        console.log(`🗑️ [Nutrition] State updated: ${beforeCount} → ${filtered.length} items`);
        return filtered;
      });
    } else {
      console.log(`⚠️ [Nutrition] No items were successfully deleted, none removed from AsyncStorage`);
    }
  } else {
    console.log(`🗑️ [Nutrition] No deleted items to sync`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ [syncNutrition] Deletion sync phase complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Then sync creates/updates
  console.log('🔄 [syncNutrition] Starting create/update sync phase');
  const unsynced = nutritionData.filter(item => !item.synced && !item.deleted);
  if (unsynced.length === 0) {
    console.log(`✅ [Nutrition] All items already synced`);
    return { success: true, synced: 0 };
  }
  
  console.log(`📤 [Nutrition] Syncing ${unsynced.length} unsynced items`);
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
          console.log(`ℹ️ [Nutrition] Update failed (item doesn't exist), now creating: ${item.id}`);
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

  console.log(`✅ [Nutrition] Synced ${syncedIds.length}/${unsynced.length} items in ${duration}ms`);
  // Only update state if items were actually synced
  if (syncedIds.length > 0) {
    const syncedSet = new Set(syncedIds);
    setNutritionData(prev =>
      prev.map(item => syncedSet.has(item.id) ? { ...item, synced: true } : item)
    );
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ [syncNutrition] Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return { success: true, synced: syncedIds.length, failed: unsynced.length - syncedIds.length };
  } catch (error) {
    console.error('❌ [syncNutrition] Fatal error:', error);
    console.error('❌ [syncNutrition] Error message:', error.message);
    console.error('❌ [syncNutrition] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

