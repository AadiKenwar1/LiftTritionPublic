import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuthContext } from '../../Auth/AuthContext';
import { useNutritionContext } from '../../Nutrition/NutritionContext';
import { useWorkoutContext } from '../../WorkoutsV2/WorkoutContext';
import { useSettings } from '../../Settings/SettingsContext';
import { syncNutrition } from './syncNutrition';
import { syncWorkouts } from './syncWorkouts';
import { syncSettings } from './syncSettings';

export function useSyncManager() {
  const { user } = useAuthContext();
  const { nutritionData, setNutritionData, loaded: nutritionLoaded } = useNutritionContext();
  const { workouts, exercises, logs, userExercises, loaded: workoutLoaded, setWorkouts, setExercises, setLogs, setUserExercises } = useWorkoutContext();
  const { 
    loaded: settingsLoaded,
    mode,
    unit,
    birthDate,
    age,
    gender,
    bodyWeight,
    weightProgress,
    height,
    goalType,
    goalWeight,
    goalPace,
    activityFactor,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
    lastExercise,
  } = useSettings();

  // Refs to access current values without triggering re-renders
  const nutritionDataRef = useRef(nutritionData);
  const workoutsRef = useRef(workouts);
  const exercisesRef = useRef(exercises);
  const logsRef = useRef(logs);
  const userExercisesRef = useRef(userExercises);
  
  // Guard flags to prevent concurrent syncs
  const isSyncingNutrition = useRef(false);
  const isSyncingWorkouts = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    nutritionDataRef.current = nutritionData;
  }, [nutritionData]);

  useEffect(() => {
    workoutsRef.current = workouts;
    exercisesRef.current = exercises;
    logsRef.current = logs;
    userExercisesRef.current = userExercises;
  }, [workouts, exercises, logs, userExercises]);

  // Sync nutrition when nutritionData changes
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 [SyncManager] Nutrition useEffect RUNNING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!user || !nutritionLoaded || isSyncingNutrition.current) {
      console.log('❌ Skipped - missing user, not loaded, or sync in progress');
      return;
    }
    
    const synced = nutritionData.filter(item => item.synced);
    const unsynced = nutritionData.filter(item => !item.synced);
    const deleted = nutritionData.filter(item => item.deleted);
    
    console.log('📊 AsyncStorage (Local) State:');
    console.log(`   Total items: ${nutritionData.length}`);
    console.log(`   ✅ Synced: ${synced.length}`);
    console.log(`   ⏳ Unsynced: ${unsynced.length}`);
    console.log(`   🗑️ Deleted: ${deleted.length}`);
    
    if (unsynced.length > 0 || deleted.length > 0) {
      if (unsynced.length > 0) {
        console.log('📤 Unsynced items:', unsynced.map(item => ({
          id: item.id,
          name: item.name,
          date: item.date
        })));
      }
      if (deleted.length > 0) {
        console.log('🗑️ Deleted items:', deleted.map(item => ({
          id: item.id,
          name: item.name,
          date: item.date
        })));
      }
      console.log('🚀 Starting sync to database...');
      isSyncingNutrition.current = true;
      syncNutrition(user.userId, nutritionData, setNutritionData)
        .then(result => {
          console.log('✅ Nutrition sync complete:', result);
          if (!result.success) {
            console.error('❌ [SyncManager] Nutrition sync failed:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ [SyncManager] Nutrition sync error:', error);
          console.error('❌ [SyncManager] Error stack:', error.stack);
        })
        .finally(() => {
          isSyncingNutrition.current = false;
        });
    } else {
      console.log('✅ All nutrition items already synced');
    }
  }, [nutritionData, user, nutritionLoaded]);

  // Sync workouts when workout data changes
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 [SyncManager] Workouts useEffect RUNNING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!user || !workoutLoaded || isSyncingWorkouts.current) {
      console.log('❌ Skipped - missing user, not loaded, or sync in progress');
      return;
    }
    
    const unsyncedWorkouts = workouts.filter(w => !w.synced);
    const unsyncedExercises = exercises.filter(e => !e.synced);
    const unsyncedLogs = logs.filter(l => !l.synced);
    const unsyncedUserExercises = userExercises.filter(ue => !ue.synced);
    
    const deletedWorkouts = workouts.filter(w => w.deleted);
    const deletedExercises = exercises.filter(e => e.deleted);
    const deletedLogs = logs.filter(l => l.deleted);
    const deletedUserExercises = userExercises.filter(ue => ue.deleted);
    
    console.log('📊 AsyncStorage (Local) State:');
    console.log(`   Workouts: ${workouts.length} total (${workouts.length - unsyncedWorkouts.length} synced, ${unsyncedWorkouts.length} unsynced, ${deletedWorkouts.length} deleted)`);
    console.log(`   Exercises: ${exercises.length} total (${exercises.length - unsyncedExercises.length} synced, ${unsyncedExercises.length} unsynced, ${deletedExercises.length} deleted)`);
    console.log(`   Logs: ${logs.length} total (${logs.length - unsyncedLogs.length} synced, ${unsyncedLogs.length} unsynced, ${deletedLogs.length} deleted)`);
    console.log(`   User Exercises: ${userExercises.length} total (${userExercises.length - unsyncedUserExercises.length} synced, ${unsyncedUserExercises.length} unsynced, ${deletedUserExercises.length} deleted)`);
    
    const totalUnsynced = unsyncedWorkouts.length + unsyncedExercises.length + unsyncedLogs.length + unsyncedUserExercises.length;
    const totalDeleted = deletedWorkouts.length + deletedExercises.length + deletedLogs.length + deletedUserExercises.length;
    
    if (totalUnsynced > 0 || totalDeleted > 0) {
      console.log('📤 Unsynced items breakdown:', {
        workouts: unsyncedWorkouts.map(w => ({ id: w.id, name: w.name })),
        exercises: unsyncedExercises.map(e => ({ id: e.id, name: e.name })),
        logs: unsyncedLogs.map(l => ({ id: l.id, date: l.date })),
        userExercises: unsyncedUserExercises.map(ue => ({ id: ue.id, name: ue.name }))
      });
      console.log('🚀 Starting sync to database...');
      isSyncingWorkouts.current = true;
      syncWorkouts(user.userId, workouts, exercises, logs, userExercises, {
        setWorkouts, setExercises, setLogs, setUserExercises
      })
        .then(result => {
          console.log('✅ Workouts sync complete:', result);
          if (!result.success) {
            console.error('❌ [SyncManager] Workouts sync failed:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ [SyncManager] Workouts sync error:', error);
          console.error('❌ [SyncManager] Error stack:', error.stack);
        })
        .finally(() => {
          isSyncingWorkouts.current = false;
        });
    } else {
      console.log('✅ All workout items already synced');
    }
  }, [workouts, exercises, logs, userExercises, user, workoutLoaded]);

  // Sync settings when any setting changes
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 [SyncManager] Settings useEffect RUNNING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!user || !settingsLoaded) {
      console.log('❌ Skipped - missing user or not loaded');
      return;
    }
    
    console.log('📊 Settings to sync:');
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Weight Progress entries: ${weightProgress?.length || 0}`);
    console.log('🚀 Starting sync to database...');
    syncSettings(user.userId).then(result => {
      console.log('✅ Settings sync complete:', result);
    });
  }, [
    user, 
    settingsLoaded,
    mode,
    unit,
    birthDate,
    age,
    gender,
    bodyWeight,
    weightProgress,
    height,
    goalType,
    goalWeight,
    goalPace,
    activityFactor,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatsGoal,
    lastExercise,
  ]);

  // Network listener - sync all on reconnect (uses refs to avoid restarting on state changes)
  useEffect(() => {
    if (!user || !nutritionLoaded || !workoutLoaded || !settingsLoaded) {
      console.log('📡 [SyncManager] Network listener not started - contexts not ready', {
        hasUser: !!user,
        nutritionLoaded,
        workoutLoaded,
        settingsLoaded
      });
      return;
    }

    console.log('📡 [SyncManager] Network listener STARTED - all contexts ready', {
      hasUser: !!user,
      nutritionLoaded,
      workoutLoaded,
      settingsLoaded
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🌐 [SyncManager] Network state changed:', state.isConnected ? 'CONNECTED' : 'DISCONNECTED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (state.isConnected) {
        console.log('🔄 Checking AsyncStorage for unsynced items...');
        
        // Use refs to get current values without triggering re-renders
        const currentNutrition = nutritionDataRef.current;
        const currentWorkouts = workoutsRef.current;
        const currentExercises = exercisesRef.current;
        const currentLogs = logsRef.current;
        const currentUserExercises = userExercisesRef.current;
        
        const unsyncedNutrition = currentNutrition.filter(item => !item.synced);
        const unsyncedWorkouts = currentWorkouts.filter(w => !w.synced);
        const unsyncedExercises = currentExercises.filter(e => !e.synced);
        const unsyncedLogs = currentLogs.filter(l => !l.synced);
        const unsyncedUserExercises = currentUserExercises.filter(ue => !ue.synced);
        
        const deletedNutrition = currentNutrition.filter(item => item.deleted);
        const deletedWorkouts = currentWorkouts.filter(w => w.deleted);
        const deletedExercises = currentExercises.filter(e => e.deleted);
        const deletedLogs = currentLogs.filter(l => l.deleted);
        const deletedUserExercises = currentUserExercises.filter(ue => ue.deleted);
        
        console.log('📊 AsyncStorage vs Database comparison:');
        console.log(`   Nutrition: ${currentNutrition.length} total, ${unsyncedNutrition.length} unsynced, ${deletedNutrition.length} deleted`);
        console.log(`   Workouts: ${currentWorkouts.length} total, ${unsyncedWorkouts.length} unsynced, ${deletedWorkouts.length} deleted`);
        console.log(`   Exercises: ${currentExercises.length} total, ${unsyncedExercises.length} unsynced, ${deletedExercises.length} deleted`);
        console.log(`   Logs: ${currentLogs.length} total, ${unsyncedLogs.length} unsynced, ${deletedLogs.length} deleted`);
        console.log(`   User Exercises: ${currentUserExercises.length} total, ${unsyncedUserExercises.length} unsynced, ${deletedUserExercises.length} deleted`);

        if ((unsyncedNutrition.length > 0 || deletedNutrition.length > 0) && !isSyncingNutrition.current) {
          console.log('🚀 Syncing nutrition on reconnect...');
          isSyncingNutrition.current = true;
          syncNutrition(user.userId, currentNutrition, setNutritionData)
            .catch(error => {
              console.error('❌ [SyncManager] Nutrition sync error on reconnect:', error);
              console.error('❌ [SyncManager] Error stack:', error.stack);
            })
            .finally(() => {
              isSyncingNutrition.current = false;
            });
        }
        const totalUnsyncedWorkouts = unsyncedWorkouts.length + unsyncedExercises.length + unsyncedLogs.length + unsyncedUserExercises.length;
        const totalDeletedWorkouts = deletedWorkouts.length + deletedExercises.length + deletedLogs.length + deletedUserExercises.length;
        
        if ((totalUnsyncedWorkouts > 0 || totalDeletedWorkouts > 0) && !isSyncingWorkouts.current) {
          console.log('🚀 Syncing workouts on reconnect...');
          isSyncingWorkouts.current = true;
          syncWorkouts(user.userId, currentWorkouts, currentExercises, currentLogs, currentUserExercises, {
            setWorkouts, setExercises, setLogs, setUserExercises
          })
            .catch(error => {
              console.error('❌ [SyncManager] Workouts sync error on reconnect:', error);
              console.error('❌ [SyncManager] Error stack:', error.stack);
            })
            .finally(() => {
              isSyncingWorkouts.current = false;
            });
        }
        console.log('🚀 Syncing settings on reconnect...');
        syncSettings(user.userId);
      }
    });

    return () => {
      console.log('📡 [SyncManager] Network listener STOPPED');
      unsubscribe();
    };
  }, [user, nutritionLoaded, workoutLoaded, settingsLoaded]); // Removed state arrays from dependencies
}

