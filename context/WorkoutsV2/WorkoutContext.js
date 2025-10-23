import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useAuthContext } from '../Auth/AuthContext';
import { useSettings } from '../SettingsContext';
import exerciseList from '../Exercises/exerciseList';

// Import function modules
import {
  addWorkout,
  deleteWorkout,
  renameWorkout,
  reorderWorkouts,
  archiveWorkout,
  unarchiveWorkout,
  addNoteToWorkout,
} from './Functions/workoutFunctions';

import {
  addExercise,
  deleteExercise,
  renameExercise,
  reorderExercises,
  archiveExercise,
  unarchiveExercise,
  addNoteToExercise,
} from './Functions/exerciseFunctions';

import {
  addLog,
  deleteLog,
} from './Functions/logFunctions';

import {
  getVolumeChartV2,
  getSetsChartV2,
  getLiftLogsV2,
  formatForChartV2,
  getLogsByDateV2,
  getExerciseNamesV2,
} from './Functions/chartFunctions';

import {
  getFatigueForLastXDaysV2,
} from './Functions/fatigueFunctions';

import {
  addUserExercise,
  updateUserExercise,
  deleteUserExercise,
  getUserExercise,
  getUserExerciseByName,
} from './Functions/userExerciseFunctions';


const client = generateClient();
const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const { user } = useAuthContext();
  const { activityFactor } = useSettings();
  
  // Flat state structure - no nesting!
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Exercise library for global exercise definitions
  const [exerciseLibrary, setExerciseLibrary] = useState(exerciseList);
  
  // User exercises (custom exercises beyond the library)
  const [userExercises, setUserExercises] = useState([]);

  // Create lookup maps for O(1) access
  const [workoutMap, setWorkoutMap] = useState(new Map());
  const [exerciseMap, setExerciseMap] = useState(new Map());
  const [logsByExercise, setLogsByExercise] = useState(new Map());

  // Update lookup maps when data changes
  useEffect(() => {
    const newWorkoutMap = new Map();
    workouts.forEach(workout => {
      newWorkoutMap.set(workout.id, workout);
    });
    setWorkoutMap(newWorkoutMap);
  }, [workouts]);

  useEffect(() => {
    const newExerciseMap = new Map();
    const newLogsByExercise = new Map();
    
    exercises.forEach(exercise => {
      newExerciseMap.set(exercise.id, exercise);
    });
    
    logs.forEach(log => {
      if (!newLogsByExercise.has(log.exerciseId)) {
        newLogsByExercise.set(log.exerciseId, []);
      }
      newLogsByExercise.get(log.exerciseId).push(log);
    });
    
    setExerciseMap(newExerciseMap);
    setLogsByExercise(newLogsByExercise);
  }, [exercises, logs]);


  // Load workout data from AuthContext user object (following Settings/Nutrition pattern)
  useEffect(() => {
    if (user?.workouts && user?.exercises && user?.exerciseLogs) {
      console.log('🔄 Loading workout data from AuthContext user object');
      console.log('📊 Workout data counts:', {
        workouts: user.workouts.length,
        exercises: user.exercises.length,
        logs: user.exerciseLogs.length,
        userExercises: user.userExercises?.length || 0
      });
      
      setWorkouts(user.workouts || []);
      setExercises(user.exercises || []);
      setLogs(user.exerciseLogs || []);
      setUserExercises(user.userExercises || []);
      setLoading(false);
    } else if (user?.userId) {
      // User exists but no workout data yet
      console.log('📝 User exists but no workout data found yet');
      setWorkouts([]);
      setExercises([]);
      setLogs([]);
      setUserExercises([]);
      setLoading(false);
    }
  }, [user?.workouts, user?.exercises, user?.exerciseLogs, user?.userId]);

  // Merge userExercises into exerciseLibrary when userExercises changes
  useEffect(() => {
    if (userExercises.length > 0) {
      console.log('🔄 Merging user exercises into exercise library');
      setExerciseLibrary(prev => {
        const updatedLibrary = { ...prev };
        userExercises.forEach(userExercise => {
          updatedLibrary[userExercise.name] = userExercise;
        });
        return updatedLibrary;
      });
    }
  }, [userExercises]);

  // Workout Functions
  const handleAddWorkout = (name) => {
    return addWorkout(name, user.userId, setWorkouts);
  };

  const handleDeleteWorkout = (workoutId) => {
    return deleteWorkout(workoutId, setWorkouts, setExercises, setLogs);
  };

  const handleRenameWorkout = (workoutId, newName) => {
    return renameWorkout(workoutId, newName, setWorkouts);
  };

  const handleReorderWorkouts = (newOrder) => {
    return reorderWorkouts(newOrder, setWorkouts);
  };

  const handleArchiveWorkout = (workoutId) => {
    return archiveWorkout(workoutId, setWorkouts);
  };

  const handleUnarchiveWorkout = (workoutId) => {
    return unarchiveWorkout(workoutId, setWorkouts);
  };

  const handleAddNoteToWorkout = (workoutId, note) => {
    return addNoteToWorkout(workoutId, note, setWorkouts);
  };

  // Exercise Functions
  const handleAddExercise = (workoutId, exerciseName) => {
    return addExercise(workoutId, exerciseName, user.userId, setExercises);
  };

  const handleDeleteExercise = (exerciseId) => {
    return deleteExercise(exerciseId, setExercises, setLogs);
  };

  const handleRenameExercise = (exerciseId, newName) => {
    return renameExercise(exerciseId, newName, setExercises);
  };

  const handleReorderExercises = (workoutId, newOrder) => {
    return reorderExercises(workoutId, newOrder, setExercises);
  };

  const handleArchiveExercise = (exerciseId) => {
    return archiveExercise(exerciseId, setExercises);
  };

  const handleUnarchiveExercise = (exerciseId) => {
    return unarchiveExercise(exerciseId, setExercises);
  };

  const handleAddNoteToExercise = (exerciseId, note) => {
    return addNoteToExercise(exerciseId, note, setExercises);
  };

  // Log Functions
  const handleAddLog = (exerciseId, logData) => {
    return addLog(exerciseId, logData, user.userId, setLogs);
  };

  const handleDeleteLog = (logId) => {
    return deleteLog(logId, setLogs);
  };

  // User Exercise Functions
  const handleAddUserExercise = (exerciseData) => {
    return addUserExercise(exerciseData, user.userId, setUserExercises, setExerciseLibrary);
  };

  const handleUpdateUserExercise = (exerciseId, updateData) => {
    return updateUserExercise(exerciseId, updateData, setUserExercises, setExerciseLibrary);
  };

  const handleDeleteUserExercise = (exerciseId, exerciseName) => {
    return deleteUserExercise(exerciseId, exerciseName, setUserExercises, setExerciseLibrary);
  };

  const handleGetUserExercise = (exerciseId) => {
    return getUserExercise(exerciseId, userExercises);
  };

  const handleGetUserExerciseByName = (exerciseName) => {
    return getUserExerciseByName(exerciseName, userExercises);
  };

  // Helper functions for getting related data
  const getExercisesForWorkout = (workoutId) => {
    return exercises
      .filter(exercise => exercise.workoutId === workoutId)
      .sort((a, b) => (b.order || 0) - (a.order || 0)); // Higher order first
  };

  const getLogsForExercise = (exerciseId) => {
    return logsByExercise.get(exerciseId) || [];
  };

  const getLogsForDate = (date) => {
    return logs.filter(log => log.date === date);
  };

  // Chart functions for V2 structure
  const volumeChart = () => getVolumeChartV2(logs);
  const setChart = () => getSetsChartV2(logs);
  const getLiftLogs = (exerciseName) => getLiftLogsV2(exerciseName, exercises, logs);
  const formatForChart = (logData) => formatForChartV2(logData);
  const logsByDateObj = getLogsByDateV2(logs);
  const getExerciseNames = () => getExerciseNamesV2(exercises);

  // Fatigue functions for V2 structure
  const getFatigueForLastXDays = (numDays) => {
    return getFatigueForLastXDaysV2(numDays, logs, exercises, exerciseLibrary, activityFactor);
  };

  // Reset function
  const resetWorkoutContext = () => {
    setWorkouts([]);
    setExercises([]);
    setLogs([]);
    setUserExercises([]);
    setWorkoutMap(new Map());
    setExerciseMap(new Map());
    setLogsByExercise(new Map());
  };

  const value = {
    // State
    workouts,
    exercises,
    logs,
    loading,
    
    // Exercise library
    exerciseLibrary,
    setExerciseLibrary,
    
    // User exercises
    userExercises,
    setUserExercises,
    
    // Lookup maps
    workoutMap,
    exerciseMap,
    logsByExercise,
    
    // Workout functions
    addWorkout: handleAddWorkout,
    deleteWorkout: handleDeleteWorkout,
    renameWorkout: handleRenameWorkout,
    reorderWorkouts: handleReorderWorkouts,
    archiveWorkout: handleArchiveWorkout,
    unarchiveWorkout: handleUnarchiveWorkout,
    addNoteToWorkout: handleAddNoteToWorkout,
    
    // Exercise functions
    addExercise: handleAddExercise,
    deleteExercise: handleDeleteExercise,
    renameExercise: handleRenameExercise,
    reorderExercises: handleReorderExercises,
    archiveExercise: handleArchiveExercise,
    unarchiveExercise: handleUnarchiveExercise,
    addNoteToExercise: handleAddNoteToExercise,
    
    // Log functions
    addLog: handleAddLog,
    deleteLog: handleDeleteLog,
    
    // User exercise functions
    addUserExercise: handleAddUserExercise,
    updateUserExercise: handleUpdateUserExercise,
    deleteUserExercise: handleDeleteUserExercise,
    getUserExercise: handleGetUserExercise,
    getUserExerciseByName: handleGetUserExerciseByName,
    
    // Helper functions
    getExercisesForWorkout,
    getLogsForExercise,
    getLogsForDate,
    resetWorkoutContext,
    
    // Chart functions
    volumeChart,
    setChart,
    getLiftLogs,
    formatForChart,
    logsByDateObj,
    getExerciseNames,
    
    // Fatigue functions
    getFatigueForLastXDays,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutContext() {
  return useContext(WorkoutContext);
}
