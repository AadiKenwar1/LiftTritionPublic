/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createWorkout = /* GraphQL */ `
  mutation CreateWorkout(
    $input: CreateWorkoutInput!
    $condition: ModelWorkoutConditionInput
  ) {
    createWorkout(input: $input, condition: $condition) {
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
export const updateWorkout = /* GraphQL */ `
  mutation UpdateWorkout(
    $input: UpdateWorkoutInput!
    $condition: ModelWorkoutConditionInput
  ) {
    updateWorkout(input: $input, condition: $condition) {
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
export const deleteWorkout = /* GraphQL */ `
  mutation DeleteWorkout(
    $input: DeleteWorkoutInput!
    $condition: ModelWorkoutConditionInput
  ) {
    deleteWorkout(input: $input, condition: $condition) {
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
export const createUserExercise = /* GraphQL */ `
  mutation CreateUserExercise(
    $input: CreateUserExerciseInput!
    $condition: ModelUserExerciseConditionInput
  ) {
    createUserExercise(input: $input, condition: $condition) {
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
export const updateUserExercise = /* GraphQL */ `
  mutation UpdateUserExercise(
    $input: UpdateUserExerciseInput!
    $condition: ModelUserExerciseConditionInput
  ) {
    updateUserExercise(input: $input, condition: $condition) {
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
export const deleteUserExercise = /* GraphQL */ `
  mutation DeleteUserExercise(
    $input: DeleteUserExerciseInput!
    $condition: ModelUserExerciseConditionInput
  ) {
    deleteUserExercise(input: $input, condition: $condition) {
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
export const createNutrition = /* GraphQL */ `
  mutation CreateNutrition(
    $input: CreateNutritionInput!
    $condition: ModelNutritionConditionInput
  ) {
    createNutrition(input: $input, condition: $condition) {
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
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateNutrition = /* GraphQL */ `
  mutation UpdateNutrition(
    $input: UpdateNutritionInput!
    $condition: ModelNutritionConditionInput
  ) {
    updateNutrition(input: $input, condition: $condition) {
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
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteNutrition = /* GraphQL */ `
  mutation DeleteNutrition(
    $input: DeleteNutritionInput!
    $condition: ModelNutritionConditionInput
  ) {
    deleteNutrition(input: $input, condition: $condition) {
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
      synced
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createSettings = /* GraphQL */ `
  mutation CreateSettings(
    $input: CreateSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    createSettings(input: $input, condition: $condition) {
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
export const updateSettings = /* GraphQL */ `
  mutation UpdateSettings(
    $input: UpdateSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    updateSettings(input: $input, condition: $condition) {
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
export const deleteSettings = /* GraphQL */ `
  mutation DeleteSettings(
    $input: DeleteSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    deleteSettings(input: $input, condition: $condition) {
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
