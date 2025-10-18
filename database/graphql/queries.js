/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getWorkout = /* GraphQL */ `
  query GetWorkout($id: ID!) {
    getWorkout(id: $id) {
      id
      userId
      name
      exercises
      order
      archived
      note
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listWorkouts = /* GraphQL */ `
  query ListWorkouts(
    $filter: ModelWorkoutFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkouts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        name
        exercises
        order
        archived
        note
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserExercise = /* GraphQL */ `
  query GetUserExercise($id: ID!) {
    getUserExercise(id: $id) {
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
export const listUserExercises = /* GraphQL */ `
  query ListUserExercises(
    $filter: ModelUserExerciseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserExercises(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getNutrition = /* GraphQL */ `
  query GetNutrition($id: ID!) {
    getNutrition(id: $id) {
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
export const listNutritions = /* GraphQL */ `
  query ListNutritions(
    $filter: ModelNutritionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNutritions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getSettings = /* GraphQL */ `
  query GetSettings($id: ID!) {
    getSettings(id: $id) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSettings = /* GraphQL */ `
  query ListSettings(
    $filter: ModelSettingsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSettings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
