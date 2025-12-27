import { generateClient } from '@aws-amplify/api';
import { createNutrition, updateNutrition, deleteNutrition } from '../../../graphql/mutations';

export async function syncNutrition(userId, nutritionData, setNutritionData) {
  try {
    const client = generateClient();
  
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
        client.graphql({
          query: deleteNutrition,
          variables: { input: { id: item.id } }
        })
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
        synced: true,
      };

      // Try update first (for edited items that exist in DB)
      try {
        const updateResult = await client.graphql({
          query: updateNutrition,
          variables: { input }
        });
        
        // Check for GraphQL errors
        if (updateResult.errors) {
          throw new Error('Update failed');
        }
        
        return { success: true, id: item.id };
      } catch (error) {
        // If update fails (item doesn't exist), try create
        const createResult = await client.graphql({
          query: createNutrition,
          variables: { input }
        });
        
        // Check for GraphQL errors
        if (createResult.errors) {
          throw new Error('Create failed');
        }
        
        return { success: true, id: item.id };
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

