import { generateClient } from '@aws-amplify/api';
import { 
  createWorkout, 
  updateWorkout,
  deleteWorkout,
  createExercise, 
  updateExercise,
  deleteExercise,
  createExerciseLog, 
  updateExerciseLog,
  deleteExerciseLog,
  createUserExercise,
  updateUserExercise,
  deleteUserExercise
} from '../../../graphql/mutations';

export async function syncWorkouts(userId, workouts, exercises, logs, userExercises, setters) {
  try {
    const { setWorkouts, setExercises, setLogs, setUserExercises } = setters;
    const client = generateClient();

  // Helper function to sync deletions
  const syncDeletions = async (items, deleteMutation, setter, itemType) => {
    const deletedItems = items.filter(item => item.deleted);
    if (deletedItems.length === 0) return;

    console.log(`🗑️ [${itemType}] Starting deletion sync for ${deletedItems.length} items`);
    console.log(`🗑️ [${itemType}] Items to delete:`, deletedItems.map(item => ({ id: item.id, name: item.name || item.date || 'N/A' })));

    const startTime = Date.now();
    const deleteResults = await Promise.allSettled(
      deletedItems.map(item =>
        client.graphql({
          query: deleteMutation,
          variables: { input: { id: item.id } }
        })
      )
    );
    const duration = Date.now() - startTime;
    console.log(`🗑️ [${itemType}] Deletion requests completed in ${duration}ms`);

    const deletedIds = deleteResults
      .map((result, index) => {
        const item = deletedItems[index];
        if (result.status === 'fulfilled' && !result.value.errors) {
          console.log(`✅ [${itemType}] Successfully deleted from DB:`, item.id, item.name || item.date || 'N/A');
          return item.id;
        }
        if (result.status === 'rejected' && 
            (result.reason?.message?.includes('not found') || 
             result.reason?.errors?.[0]?.errorType === 'NotFound')) {
          console.log(`✅ [${itemType}] Item never existed in DB (safe to remove):`, item.id, item.name || item.date || 'N/A');
          return item.id;
        }
        // Log failures
        if (result.status === 'rejected') {
          console.error(`❌ [${itemType}] Deletion failed:`, item.id, item.name || item.date || 'N/A', result.reason);
        } else if (result.status === 'fulfilled' && result.value.errors) {
          console.error(`❌ [${itemType}] Deletion returned errors:`, item.id, item.name || item.date || 'N/A', result.value.errors);
        }
        return null;
      })
      .filter(Boolean);

    console.log(`🗑️ [${itemType}] Removing ${deletedIds.length} successfully deleted items from AsyncStorage`);
    if (deletedIds.length > 0) {
      const beforeCount = items.length;
      setter(prev => {
        const filtered = prev.filter(item => !deletedIds.includes(item.id));
        console.log(`🗑️ [${itemType}] State updated: ${beforeCount} → ${filtered.length} items`);
        return filtered;
      });
    } else {
      console.log(`⚠️ [${itemType}] No items were successfully deleted, none removed from AsyncStorage`);
    }
  };

  // Sync deletions first (in dependency order: logs, exercises, workouts, user exercises)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️ [syncWorkouts] Starting deletion sync phase');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await syncDeletions(logs, deleteExerciseLog, setLogs, 'Logs');
  await syncDeletions(exercises, deleteExercise, setExercises, 'Exercises');
  await syncDeletions(workouts, deleteWorkout, setWorkouts, 'Workouts');
  await syncDeletions(userExercises, deleteUserExercise, setUserExercises, 'UserExercises');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ [syncWorkouts] Deletion sync phase complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Sync workouts (exclude deleted items)
  console.log('🔄 [syncWorkouts] Starting create/update sync phase');
  const unsyncedWorkouts = workouts.filter(w => !w.synced && !w.deleted);
  if (unsyncedWorkouts.length > 0) {
    console.log(`📤 [Workouts] Syncing ${unsyncedWorkouts.length} unsynced workouts`);
    const startTime = Date.now();
    const results = await Promise.allSettled(
      unsyncedWorkouts.map(async (w) => {
        const input = {
          id: w.id,
          userId,
          name: w.name,
          order: w.order,
          archived: w.archived || false,
          note: w.note || null,
          synced: true,
        };

        // Try update first (for edited items that exist in DB)
        try {
          const updateResult = await client.graphql({
            query: updateWorkout,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (updateResult.errors) {
            throw new Error('Update failed');
          }
          
          return { success: true, id: w.id };
        } catch (error) {
          // If update fails (item doesn't exist), try create
          const createResult = await client.graphql({
            query: createWorkout,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (createResult.errors) {
            throw new Error('Create failed');
          }
          
          return { success: true, id: w.id };
        }
      })
    );
    const duration = Date.now() - startTime;
    const syncedIds = results
      .map((r) => {
        if (r.status === 'fulfilled' && r.value?.success) {
          return r.value.id;
        }
        if (r.status === 'fulfilled' && !r.value?.success) {
          console.error(`❌ [Workouts] Sync failed for item:`, r.value);
        } else if (r.status === 'rejected') {
          console.error(`❌ [Workouts] Sync rejected:`, r.reason);
        }
        return null;
      })
      .filter(Boolean);
    console.log(`✅ [Workouts] Synced ${syncedIds.length}/${unsyncedWorkouts.length} workouts in ${duration}ms`);
    // Only update state if items were actually synced
    if (syncedIds.length > 0) {
      const syncedSet = new Set(syncedIds);
      setWorkouts(prev => prev.map(w => syncedSet.has(w.id) ? { ...w, synced: true } : w));
    }
  } else {
    console.log(`✅ [Workouts] All workouts already synced`);
  }

  // Sync exercises (exclude deleted items)
  const unsyncedExercises = exercises.filter(e => !e.synced && !e.deleted);
  if (unsyncedExercises.length > 0) {
    console.log(`📤 [Exercises] Syncing ${unsyncedExercises.length} unsynced exercises`);
    const startTime = Date.now();
    const results = await Promise.allSettled(
      unsyncedExercises.map(async (e) => {
        const input = {
          id: e.id,
          workoutId: e.workoutId,
          userId,
          name: e.name,
          order: e.order,
          archived: e.archived || false,
          note: e.note || null,
          synced: true,
        };

        // Try update first (for edited items that exist in DB)
        try {
          const updateResult = await client.graphql({
            query: updateExercise,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (updateResult.errors) {
            throw new Error('Update failed');
          }
          
          return { success: true, id: e.id };
        } catch (error) {
          // If update fails (item doesn't exist), try create
          const createResult = await client.graphql({
            query: createExercise,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (createResult.errors) {
            throw new Error('Create failed');
          }
          
          return { success: true, id: e.id };
        }
      })
    );
    const duration = Date.now() - startTime;
    const syncedIds = results
      .map((r) => {
        if (r.status === 'fulfilled' && r.value?.success) {
          return r.value.id;
        }
        if (r.status === 'fulfilled' && !r.value?.success) {
          console.error(`❌ [Exercises] Sync failed for item:`, r.value);
        } else if (r.status === 'rejected') {
          console.error(`❌ [Exercises] Sync rejected:`, r.reason);
        }
        return null;
      })
      .filter(Boolean);
    console.log(`✅ [Exercises] Synced ${syncedIds.length}/${unsyncedExercises.length} exercises in ${duration}ms`);
    // Only update state if items were actually synced
    if (syncedIds.length > 0) {
      const syncedSet = new Set(syncedIds);
      setExercises(prev => prev.map(e => syncedSet.has(e.id) ? { ...e, synced: true } : e));
    }
  } else {
    console.log(`✅ [Exercises] All exercises already synced`);
  }

  // Sync logs (exclude deleted items)
  const unsyncedLogs = logs.filter(l => !l.synced && !l.deleted);
  if (unsyncedLogs.length > 0) {
    console.log(`📤 [Logs] Syncing ${unsyncedLogs.length} unsynced logs`);
    const startTime = Date.now();
    const results = await Promise.allSettled(
      unsyncedLogs.map(async (l) => {
        const input = {
          id: l.id,
          exerciseId: l.exerciseId,
          workoutId: l.workoutId,
          userId,
          date: l.date,
          weight: l.weight,
          reps: l.reps,
          rpe: l.rpe,
          synced: true,
        };

        // Try update first (for edited items that exist in DB)
        try {
          const updateResult = await client.graphql({
            query: updateExerciseLog,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (updateResult.errors) {
            throw new Error('Update failed');
          }
          
          return { success: true, id: l.id };
        } catch (error) {
          // If update fails (item doesn't exist), try create
          const createResult = await client.graphql({
            query: createExerciseLog,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (createResult.errors) {
            throw new Error('Create failed');
          }
          
          return { success: true, id: l.id };
        }
      })
    );
    const duration = Date.now() - startTime;
    const syncedIds = results
      .map((r) => {
        if (r.status === 'fulfilled' && r.value?.success) {
          return r.value.id;
        }
        if (r.status === 'fulfilled' && !r.value?.success) {
          console.error(`❌ [Logs] Sync failed for item:`, r.value);
        } else if (r.status === 'rejected') {
          console.error(`❌ [Logs] Sync rejected:`, r.reason);
        }
        return null;
      })
      .filter(Boolean);
    console.log(`✅ [Logs] Synced ${syncedIds.length}/${unsyncedLogs.length} logs in ${duration}ms`);
    // Only update state if items were actually synced
    if (syncedIds.length > 0) {
      const syncedSet = new Set(syncedIds);
      setLogs(prev => prev.map(l => syncedSet.has(l.id) ? { ...l, synced: true } : l));
    }
  } else {
    console.log(`✅ [Logs] All logs already synced`);
  }

  // Sync user exercises (exclude deleted items)
  const unsyncedUserExercises = userExercises.filter(ue => !ue.synced && !ue.deleted);
  if (unsyncedUserExercises.length > 0) {
    console.log(`📤 [UserExercises] Syncing ${unsyncedUserExercises.length} unsynced user exercises`);
    const startTime = Date.now();
    const results = await Promise.allSettled(
      unsyncedUserExercises.map(async (ue) => {
        const input = {
          id: ue.id,
          userId,
          name: ue.name,
          isCompound: ue.isCompound,
          fatigueFactor: ue.fatigueFactor,
          mainMuscle: ue.mainMuscle,
          accessoryMuscles: ue.accessoryMuscles || [],
          synced: true,
        };

        // Try update first (for edited items that exist in DB)
        try {
          const updateResult = await client.graphql({
            query: updateUserExercise,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (updateResult.errors) {
            throw new Error('Update failed');
          }
          
          return { success: true, id: ue.id };
        } catch (error) {
          // If update fails (item doesn't exist), try create
          const createResult = await client.graphql({
            query: createUserExercise,
            variables: { input }
          });
          
          // Check for GraphQL errors
          if (createResult.errors) {
            throw new Error('Create failed');
          }
          
          return { success: true, id: ue.id };
        }
      })
    );
    const duration = Date.now() - startTime;
    const syncedIds = results
      .map((r) => {
        if (r.status === 'fulfilled' && r.value?.success) {
          return r.value.id;
        }
        if (r.status === 'fulfilled' && !r.value?.success) {
          console.error(`❌ [UserExercises] Sync failed for item:`, r.value);
        } else if (r.status === 'rejected') {
          console.error(`❌ [UserExercises] Sync rejected:`, r.reason);
        }
        return null;
      })
      .filter(Boolean);
    console.log(`✅ [UserExercises] Synced ${syncedIds.length}/${unsyncedUserExercises.length} user exercises in ${duration}ms`);
    // Only update state if items were actually synced
    if (syncedIds.length > 0) {
      const syncedSet = new Set(syncedIds);
      setUserExercises(prev => prev.map(ue => syncedSet.has(ue.id) ? { ...ue, synced: true } : ue));
    }
  } else {
    console.log(`✅ [UserExercises] All user exercises already synced`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ [syncWorkouts] Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return { success: true };
  } catch (error) {
    console.error('❌ [syncWorkouts] Fatal error:', error);
    console.error('❌ [syncWorkouts] Error message:', error.message);
    console.error('❌ [syncWorkouts] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

