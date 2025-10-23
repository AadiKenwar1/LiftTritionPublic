/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateWorkout = /* GraphQL */ `
  subscription OnCreateWorkout($filter: ModelSubscriptionWorkoutFilterInput) {
    onCreateWorkout(filter: $filter) {
      id
      userId
      name
      exercises
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateWorkout = /* GraphQL */ `
  subscription OnUpdateWorkout($filter: ModelSubscriptionWorkoutFilterInput) {
    onUpdateWorkout(filter: $filter) {
      id
      userId
      name
      exercises
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteWorkout = /* GraphQL */ `
  subscription OnDeleteWorkout($filter: ModelSubscriptionWorkoutFilterInput) {
    onDeleteWorkout(filter: $filter) {
      id
      userId
      name
      exercises
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateUserExercise = /* GraphQL */ `
  subscription OnCreateUserExercise(
    $filter: ModelSubscriptionUserExerciseFilterInput
  ) {
    onCreateUserExercise(filter: $filter) {
      id
      userId
      name
      isCompound
      fatigueFactor
      userMax
      mainMuscle
      accessoryMuscles
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateUserExercise = /* GraphQL */ `
  subscription OnUpdateUserExercise(
    $filter: ModelSubscriptionUserExerciseFilterInput
  ) {
    onUpdateUserExercise(filter: $filter) {
      id
      userId
      name
      isCompound
      fatigueFactor
      userMax
      mainMuscle
      accessoryMuscles
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteUserExercise = /* GraphQL */ `
  subscription OnDeleteUserExercise(
    $filter: ModelSubscriptionUserExerciseFilterInput
  ) {
    onDeleteUserExercise(filter: $filter) {
      id
      userId
      name
      isCompound
      fatigueFactor
      userMax
      mainMuscle
      accessoryMuscles
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateWorkoutV2 = /* GraphQL */ `
  subscription OnCreateWorkoutV2(
    $filter: ModelSubscriptionWorkoutV2FilterInput
  ) {
    onCreateWorkoutV2(filter: $filter) {
      id
      userId
      name
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateWorkoutV2 = /* GraphQL */ `
  subscription OnUpdateWorkoutV2(
    $filter: ModelSubscriptionWorkoutV2FilterInput
  ) {
    onUpdateWorkoutV2(filter: $filter) {
      id
      userId
      name
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteWorkoutV2 = /* GraphQL */ `
  subscription OnDeleteWorkoutV2(
    $filter: ModelSubscriptionWorkoutV2FilterInput
  ) {
    onDeleteWorkoutV2(filter: $filter) {
      id
      userId
      name
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateExercise = /* GraphQL */ `
  subscription OnCreateExercise($filter: ModelSubscriptionExerciseFilterInput) {
    onCreateExercise(filter: $filter) {
      id
      workoutId
      userId
      name
      userMax
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateExercise = /* GraphQL */ `
  subscription OnUpdateExercise($filter: ModelSubscriptionExerciseFilterInput) {
    onUpdateExercise(filter: $filter) {
      id
      workoutId
      userId
      name
      userMax
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteExercise = /* GraphQL */ `
  subscription OnDeleteExercise($filter: ModelSubscriptionExerciseFilterInput) {
    onDeleteExercise(filter: $filter) {
      id
      workoutId
      userId
      name
      userMax
      order
      archived
      note
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateExerciseLog = /* GraphQL */ `
  subscription OnCreateExerciseLog(
    $filter: ModelSubscriptionExerciseLogFilterInput
  ) {
    onCreateExerciseLog(filter: $filter) {
      id
      exerciseId
      workoutId
      userId
      date
      weight
      reps
      rpe
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateExerciseLog = /* GraphQL */ `
  subscription OnUpdateExerciseLog(
    $filter: ModelSubscriptionExerciseLogFilterInput
  ) {
    onUpdateExerciseLog(filter: $filter) {
      id
      exerciseId
      workoutId
      userId
      date
      weight
      reps
      rpe
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteExerciseLog = /* GraphQL */ `
  subscription OnDeleteExerciseLog(
    $filter: ModelSubscriptionExerciseLogFilterInput
  ) {
    onDeleteExerciseLog(filter: $filter) {
      id
      exerciseId
      workoutId
      userId
      date
      weight
      reps
      rpe
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateNutrition = /* GraphQL */ `
  subscription OnCreateNutrition(
    $filter: ModelSubscriptionNutritionFilterInput
  ) {
    onCreateNutrition(filter: $filter) {
      id
      userId
      name
      date
      time
      protein
      carbs
      fats
      calories
      isPhoto
      ingredients
      saved
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateNutrition = /* GraphQL */ `
  subscription OnUpdateNutrition(
    $filter: ModelSubscriptionNutritionFilterInput
  ) {
    onUpdateNutrition(filter: $filter) {
      id
      userId
      name
      date
      time
      protein
      carbs
      fats
      calories
      isPhoto
      ingredients
      saved
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteNutrition = /* GraphQL */ `
  subscription OnDeleteNutrition(
    $filter: ModelSubscriptionNutritionFilterInput
  ) {
    onDeleteNutrition(filter: $filter) {
      id
      userId
      name
      date
      time
      protein
      carbs
      fats
      calories
      isPhoto
      ingredients
      saved
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateSettings = /* GraphQL */ `
  subscription OnCreateSettings($filter: ModelSubscriptionSettingsFilterInput) {
    onCreateSettings(filter: $filter) {
      id
      mode
      unit
      birthDate
      age
      gender
      bodyWeight
      weightProgress
      height
      activityFactor
      goalType
      goalWeight
      goalPace
      calorieGoal
      proteinGoal
      carbsGoal
      fatsGoal
      onboardingCompleted
      lastExercise
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateSettings = /* GraphQL */ `
  subscription OnUpdateSettings($filter: ModelSubscriptionSettingsFilterInput) {
    onUpdateSettings(filter: $filter) {
      id
      mode
      unit
      birthDate
      age
      gender
      bodyWeight
      weightProgress
      height
      activityFactor
      goalType
      goalWeight
      goalPace
      calorieGoal
      proteinGoal
      carbsGoal
      fatsGoal
      onboardingCompleted
      lastExercise
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteSettings = /* GraphQL */ `
  subscription OnDeleteSettings($filter: ModelSubscriptionSettingsFilterInput) {
    onDeleteSettings(filter: $filter) {
      id
      mode
      unit
      birthDate
      age
      gender
      bodyWeight
      weightProgress
      height
      activityFactor
      goalType
      goalWeight
      goalPace
      calorieGoal
      proteinGoal
      carbsGoal
      fatsGoal
      onboardingCompleted
      lastExercise
      createdAt
      updatedAt
      __typename
    }
  }
`;
