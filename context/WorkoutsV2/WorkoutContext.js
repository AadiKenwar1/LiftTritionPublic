import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from '../Auth/AuthContext';
import { useSettings } from '../Settings/SettingsContext';
import exerciseList from '../Exercises/exerciseList';
import { STORAGE_KEYS } from '../storageKeys';
// Import function modules
import {addWorkout, deleteWorkout, renameWorkout, reorderWorkouts, archiveWorkout, unarchiveWorkout, addNoteToWorkout} from './Functions/workoutFunctions';
import {addExercise, deleteExercise, renameExercise, reorderExercises, archiveExercise, unarchiveExercise, addNoteToExercise} from './Functions/exerciseFunctions';
import {addLog, deleteLog} from './Functions/logFunctions';
import {getVolumeChartV2, getSetsChartV2, getLiftLogsV2, formatForChartV2, getLogsByDateV2} from './Functions/chartFunctions';
import {getFatigueForLastXDaysV2, fatigueFeedback} from './Functions/fatigueFunctions';
import {addUserExercise, updateUserExercise, deleteUserExercise} from './Functions/userExerciseFunctions';


const WorkoutContext = createContext();
export function WorkoutProvider({ children }) {
  const { user } = useAuthContext();
  const { activityFactor } = useSettings();
  
  // Flat state structures for workouts, exercises, logs, and user exercises
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [logs, setLogs] = useState([]);
  const [userExercises, setUserExercises] = useState([]);

  // Exercise library for global exercise definitions
  const [exerciseLibrary, setExerciseLibrary] = useState(exerciseList);

  //Fast access logs by date in format {date: [logs]}
  const logsByDateObj = getLogsByDateV2(logs);

  // Loaded flag to track if data has been loaded from AsyncStorage
  const [loaded, setLoaded] = useState(false);

  // Create lookup map for O(1) access to logs by exercise
  const [logsByExercise, setLogsByExercise] = useState(new Map());

  // Update logsByExercise map when logs change
  useEffect(() => {
    const newLogsByExercise = new Map();
    logs.forEach(log => {
      if (log.deleted) return;
      if (!newLogsByExercise.has(log.exerciseId)) {
        newLogsByExercise.set(log.exerciseId, []);
      }
      newLogsByExercise.get(log.exerciseId).push(log);
    });
    
    setLogsByExercise(newLogsByExercise);
  }, [logs]);

  // Load from AsyncStorage on mount AND when user changes (reloads after sign-in)
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.multiGet([
          STORAGE_KEYS.workouts,
          STORAGE_KEYS.exercises,
          STORAGE_KEYS.exerciseLogs,
          STORAGE_KEYS.userExercises,
        ]);
        setWorkouts(data[0][1] ? JSON.parse(data[0][1]) : []);
        setExercises(data[1][1] ? JSON.parse(data[1][1]) : []);
        setLogs(data[2][1] ? JSON.parse(data[2][1]) : []);
        setUserExercises(data[3][1] ? JSON.parse(data[3][1]) : []);
        setLoaded(true);
      } catch (error) {
        console.error('Error loading workout data from AsyncStorage:', error);
        setWorkouts([]);
        setExercises([]);
        setLogs([]);
        setUserExercises([]);
        setLoaded(true);
      }
    }
    
    if (user) {
        loadData(); 
      } else {
      setWorkouts([]);
      setExercises([]);
      setLogs([]);
      setUserExercises([]);
      setLoaded(false);
    }
  }, [user]);

  // Save to AsyncStorage whenever state changes (after initial load)
  useEffect(() => {
    if (loaded && user) {
      AsyncStorage.multiSet([
        [STORAGE_KEYS.workouts, JSON.stringify(workouts)],
        [STORAGE_KEYS.exercises, JSON.stringify(exercises)],
        [STORAGE_KEYS.exerciseLogs, JSON.stringify(logs)],
        [STORAGE_KEYS.userExercises, JSON.stringify(userExercises)],
      ]);
    }
  }, [workouts, exercises, logs, userExercises, loaded, user]);

  // Clear state when user signs out
  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setExercises([]);
      setLogs([]);
      setUserExercises([]);
      setLogsByExercise(new Map());
    }
  }, [user]);

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

  /**WRAPPER FUNCTIONS */

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

  const handleAddLog = (exerciseId, logData) => {
    return addLog(exerciseId, logData, user.userId, setLogs);
  };

  const handleDeleteLog = (logId) => {
    return deleteLog(logId, setLogs);
  };

  const handleAddUserExercise = (exerciseData) => {
    return addUserExercise(exerciseData, user.userId, setUserExercises, setExerciseLibrary);
  };

  const handleUpdateUserExercise = (exerciseId, updateData) => {
    return updateUserExercise(exerciseId, updateData, setUserExercises, setExerciseLibrary);
  };

  const handleDeleteUserExercise = (exerciseId, exerciseName) => {
    return deleteUserExercise(exerciseId, exerciseName, setUserExercises, setExerciseLibrary);
  };

  const getExercisesForWorkout = (workoutId) => {
    return exercises
      .filter(exercise => exercise.workoutId === workoutId)
      .sort((a, b) => (b.order || 0) - (a.order || 0)); // Higher order first
  };

  const getLogsForExercise = (exerciseId) => {
    return logsByExercise.get(exerciseId) || [];
  };

  const getLogsForDate = (date) => {
    return logs.filter(log => log.date === date && !log.deleted);
  };

  const volumeChart = useMemo(() => {
    return getVolumeChartV2(logs);
  }, [logs]); 

  const setChart = useMemo(() => {
    return getSetsChartV2(logs);
  }, [logs]);

  const getLiftLogs = (exerciseName) => getLiftLogsV2(exerciseName, exercises, logs);

  const formatForChart = (logData) => formatForChartV2(logData);

  const getFatigueForLastXDays = (numDays) => {
    return getFatigueForLastXDaysV2(numDays, logs, exercises, exerciseLibrary, activityFactor);
  };

  //Sorry about naming, I didnt want to have to refactor everything
  const value = {
    workouts,
    exercises,
    logs,
    loaded,
    exerciseLibrary,
    setExerciseLibrary,
    userExercises,
    setUserExercises,
    setWorkouts,
    setExercises,
    setLogs,
    logsByExercise,
    addWorkout: handleAddWorkout,
    deleteWorkout: handleDeleteWorkout,
    renameWorkout: handleRenameWorkout,
    reorderWorkouts: handleReorderWorkouts,
    archiveWorkout: handleArchiveWorkout,
    unarchiveWorkout: handleUnarchiveWorkout,
    addNoteToWorkout: handleAddNoteToWorkout,
    addExercise: handleAddExercise,
    deleteExercise: handleDeleteExercise,
    renameExercise: handleRenameExercise,
    reorderExercises: handleReorderExercises,
    archiveExercise: handleArchiveExercise,
    unarchiveExercise: handleUnarchiveExercise,
    addNoteToExercise: handleAddNoteToExercise,
    addLog: handleAddLog,
    deleteLog: handleDeleteLog,
    addUserExercise: handleAddUserExercise,
    updateUserExercise: handleUpdateUserExercise,
    deleteUserExercise: handleDeleteUserExercise,
    getExercisesForWorkout,
    getLogsForExercise,
    getLogsForDate,
    volumeChart,
    setChart,
    getLiftLogs,
    formatForChart,
    logsByDateObj,
    getFatigueForLastXDays,
    fatigueFeedback,
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
