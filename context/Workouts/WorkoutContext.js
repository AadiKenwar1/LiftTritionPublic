import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listWorkouts, listUserExercises } from '../../database/graphql/queries';
import exerciseList from '../Exercises/exerciseList';
import { useSettings } from '../SettingsContext';
import { useAuthContext } from '../Auth/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Import your functions
import {
    addWorkoutRoot,
    addExerciseToWorkoutRoot,
    addLogToExerciseRoot,
} from './WorkoutFunction/addFunctions';
import {
    renameWorkoutRoot,
    renameExerciseRoot,
} from './WorkoutFunction/renameFunctions';
import {
    deleteWorkoutRoot,
    deleteExerciseRoot,
    deleteLogRoot,
} from './WorkoutFunction/deleteFunctions';
import {
    archiveWorkoutRoot,
    archiveExerciseRoot,
    unarchiveWorkoutRoot,
    unarchiveExerciseRoot,
} from './WorkoutFunction/archiveFunctions';
import {
    reorderWorkoutsRoot,
    reorderExercisesRoot,
} from './WorkoutFunction/reorderingFunctions';
import {
    addNoteToExerciseRoot,
    addNoteToWorkoutRoot,
} from './WorkoutFunction/noteFunctions';
import { formatForChartRoot } from './WorkoutFunction/chartFunctions';
import { getLiftLogsRoot } from './WorkoutFunction/logBuilderFunctions';
import { arrangeLogsByDateRoot } from './WorkoutFunction/logBuilderFunctions';
import { getFatigueForLastXDaysRoot } from './WorkoutFunction/fatigueFunctions';
import { fatigueChartRoot } from './WorkoutFunction/fatigueFunctions';
import { volumeChartRoot, setChartRoot } from './WorkoutFunction/volumeFunctions';
import {
    recomputeUserMaxesRoot,
    updateUserMaxRoot,
} from './WorkoutFunction/oneRepMaxFunctions';

const client = generateClient();
const WorkoutContext = createContext();
const PENDING_WORKOUT_KEY = 'pendingWorkoutSyncs';

export function WorkoutProvider({ children }) {
    const { activityFactor } = useSettings();
    const { user } = useAuthContext();
    // Get workout data from AuthContext user object
    const workoutsData = user?.workouts || [];
    const userExercisesData = user?.userExercises || [];
    
    const [workouts, setWorkouts] = useState(workoutsData);
    const [pendingSyncs, setPendingSyncs] = useState([]); // HYBRID SYNC: queue for failed mutations
    const [exerciseLibrary, setExerciseLibrary] = useState(exerciseList);
    const [userExercises, setUserExercises] = useState(userExercisesData);
    const [logsByDateObj, setLogsByDateObj] = useState({});
    const [loading, setLoading] = useState(true);


    //HYBRID SYNC: LOAD pending syncs from AsyncStorage on mount
    useEffect(() => {
      AsyncStorage.getItem(PENDING_WORKOUT_KEY).then(data => {
        if (data) {
          console.log('[HYBRID SYNC][Workout] Loaded pendingSyncs from storage:', data);
          setPendingSyncs(JSON.parse(data));
        } else {
          console.log('[HYBRID SYNC][Workout] No pendingSyncs found in storage.');
        }
      });
    }, []);

    //HYBRID SYNC: PERSIST pendingSyncs to AsyncStorage whenever it changes
    useEffect(() => {
      console.log('[HYBRID SYNC][Workout] Saving pendingSyncs to storage:', pendingSyncs);
      AsyncStorage.setItem(PENDING_WORKOUT_KEY, JSON.stringify(pendingSyncs));
    }, [pendingSyncs]);

    //HYBRID SYNC: Background retry loop for pending syncs
    useEffect(() => {
      const interval = setInterval(() => {
        if (!user || !user.userId) return;
        if (pendingSyncs.length === 0) return;
        // Assume isOnline is always true for simplicity; replace with real check if available
        const { type, data } = pendingSyncs[0];
        console.log(`[HYBRID SYNC][Workout] Attempting to sync pending mutation:`, pendingSyncs[0]);
        let mutationPromise;
        if (type === 'add') {
          mutationPromise = addWorkoutRoot(...data, setWorkouts, user.userId, workouts, { skipOptimistic: true });
        } else if (type === 'edit') {
          mutationPromise = renameWorkoutRoot(...data, workouts, setWorkouts, user.userId, { skipOptimistic: true });
        } else if (type === 'delete') {
          mutationPromise = deleteWorkoutRoot(...data, setWorkouts, { skipOptimistic: true });
        } else {
          mutationPromise = Promise.resolve();
        }
        mutationPromise
          .then(() => {
            console.log('[HYBRID SYNC][Workout] Mutation synced successfully, removing from queue:', pendingSyncs[0]);
            setPendingSyncs(prev => prev.slice(1));
          })
          .catch(error => {
            console.error('[HYBRID SYNC][Workout] Error syncing mutation:', error, pendingSyncs[0]);
            // Permanent error detection (example: validation, schema)
            if (error && error.message && (error.message.includes('validation') || error.message.includes('schema'))) {
              console.warn('[HYBRID SYNC][Workout] Permanent error, removing from queue:', pendingSyncs[0]);
              setPendingSyncs(prev => prev.slice(1));
              // Optionally: alert user
            }
            // Otherwise, leave in queue for next retry
          });
      }, 1000);
      return () => clearInterval(interval);
    }, [pendingSyncs, user, workouts]);

    // Add Functions 
    const addWorkout = (name) => {
      if (!user || !user.userId) return null;
      // HYBRID SYNC: Optimistic update
      addWorkoutRoot(name, setWorkouts, user.userId, workouts)
        .catch(error => {
          console.warn('[HYBRID SYNC][Workout] addWorkout failed, queueing mutation:', name, error);
          setPendingSyncs(prev => [...prev, { type: 'add', data: [name] }]);
        });
    };
    const addExerciseToWorkout = (workoutId, newExercise) =>
        addExerciseToWorkoutRoot(workoutId, newExercise, workouts, setWorkouts, user?.userId);
    const addLogToExercise = (workoutId, exerciseId, newLog) =>
        addLogToExerciseRoot(workoutId, exerciseId, newLog, workouts, setWorkouts, user?.userId);

    //Archive Functions
    const archiveWorkout = (id) => archiveWorkoutRoot(id, workouts, setWorkouts, user?.userId);
    const archiveExercise = (wid, eid) =>
        archiveExerciseRoot(wid, eid, workouts, setWorkouts, user?.userId);
    const unarchiveWorkout = (id) => unarchiveWorkoutRoot(id, workouts, setWorkouts, user?.userId);
    const unarchiveExercise = (wid, eid) =>
        unarchiveExerciseRoot(wid, eid, workouts, setWorkouts, user?.userId);

    //Delete Functions
    const deleteWorkout = (id) => {
      deleteWorkoutRoot(id, setWorkouts)
        .catch(error => {
          console.warn('[HYBRID SYNC][Workout] deleteWorkout failed, queueing mutation:', id, error);
          setPendingSyncs(prev => [...prev, { type: 'delete', data: [id] }]);
        });
    };
    const deleteExercise = (wid, eid) =>
        deleteExerciseRoot(wid, eid, workouts, setWorkouts, user?.userId);
    const deleteLog = (wid, eid, date, index) =>
        deleteLogRoot(wid, eid, date, index, setWorkouts);

    //Rename Functions
    const renameWorkout = (id, name) => {
      renameWorkoutRoot(id, name, workouts, setWorkouts, user.userId)
        .catch(error => {
          console.warn('[HYBRID SYNC][Workout] renameWorkout failed, queueing mutation:', [id, name], error);
          setPendingSyncs(prev => [...prev, { type: 'edit', data: [id, name] }]);
        });
    };
    const renameExercise = (wid, eid, name) =>
        renameExerciseRoot(wid, eid, name, workouts, setWorkouts, user?.userId);

    //Reorder Functions
    const reorderWorkouts = (newOrder) =>
        reorderWorkoutsRoot(newOrder, setWorkouts, user?.userId);
    const reorderExercises = (workoutId, newExerciseOrder) =>
        reorderExercisesRoot(workoutId, newExerciseOrder, workouts, setWorkouts, user?.userId);

    //Notes functions
    const addNoteToWorkout = (wid, note) =>
        addNoteToWorkoutRoot(wid, note, workouts, setWorkouts, user?.userId);
    const addNoteToExercise = (wid, id, note) =>
        addNoteToExerciseRoot(wid, id, note, workouts, setWorkouts, user?.userId);

    //Recomputes Estimated userMax based on logs
    const updateUserMax = (exerciseName, newMax) => updateUserMaxRoot(setExerciseLibrary, exerciseName, newMax);
    const recomputeUserMaxes = () => {
        setExerciseLibrary((prev) =>
            recomputeUserMaxesRoot(workouts, getLiftLogs, prev)
        )
    }
    useEffect(() => {
        recomputeUserMaxes();
    }, [workouts]);

    //Creates a map with key date and values being an array of logs
    const arrangeLogsByDate = () => arrangeLogsByDateRoot(workouts);
    useEffect(() => {
        const newLogs = arrangeLogsByDate(workouts);
        setLogsByDateObj(newLogs);
    }, [workouts]);

    //Chart Functions
    const getLiftLogs = (selectedExercise) =>
        getLiftLogsRoot(selectedExercise, workouts);
    const formatForChart = (logData) => formatForChartRoot(logData);

    const volumeChart = () => volumeChartRoot(logsByDateObj);
    const fatigueChart = () => fatigueChartRoot(logsByDateObj, exerciseLibrary, activityFactor);
    const setChart = () => setChartRoot(logsByDateObj);

    //Fatigue percentages
    const getFatigueForLastXDays = (numOfDays) =>
        getFatigueForLastXDaysRoot(
            logsByDateObj,
            exerciseLibrary,
            updateUserMax,
            numOfDays,
            activityFactor
        )
    const fatigueTodayPercent = useMemo(() => {
        return getFatigueForLastXDays(1);
    }, [logsByDateObj, exerciseLibrary, activityFactor]);

    const fatigueLast3DaysPercent = useMemo(() => {
        return getFatigueForLastXDays(3);
    }, [logsByDateObj, exerciseLibrary, activityFactor]);

    const fatigueLast6DaysPercent = useMemo(() => {
        return getFatigueForLastXDays(6);
    }, [logsByDateObj, exerciseLibrary, activityFactor]);

    const fatigueLast9DaysPercent = useMemo(() => {
        return getFatigueForLastXDays(9);
    }, [logsByDateObj, exerciseLibrary, activityFactor]);

    function resetWorkoutContext(){
        setWorkouts([]);
        setUserExercises([]);
        setLogsByDateObj({});
    }

    
    // Update local state when AuthContext user changes (only on initial load)
    useEffect(() => {
        if (user?.workouts && workouts.length === 0) {
            setWorkouts(user.workouts);
            setLoading(false);
        }
        if (user?.userExercises && userExercises.length === 0) {
            setUserExercises(user.userExercises);
        }
    }, [user?.workouts, user?.userExercises]);

    return (
        <WorkoutContext.Provider
            value={{
                workouts,
                exerciseLibrary,
                setExerciseLibrary,
                updateUserMax,
                userExercises,
                setUserExercises,
                addWorkout,
                addExerciseToWorkout,
                addLogToExercise,
                reorderWorkouts,
                reorderExercises,
                deleteWorkout,
                deleteExercise,
                deleteLog,
                archiveWorkout,
                archiveExercise,
                unarchiveWorkout,
                unarchiveExercise,
                renameWorkout,
                renameExercise,
                addNoteToWorkout,
                addNoteToExercise,
                getLiftLogs,
                logsByDateObj,
                fatigueTodayPercent,
                fatigueLast3DaysPercent,
                fatigueLast6DaysPercent,
                fatigueLast9DaysPercent,
                formatForChart,
                volumeChart,
                fatigueChart,
                setChart,
                resetWorkoutContext,
                loading,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkoutContext() {
    return useContext(WorkoutContext);
}
