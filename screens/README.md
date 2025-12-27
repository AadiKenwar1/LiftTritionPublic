# Screens Directory Structure

## TODO

- Move `settings` folder into `main` folder
- Move `camera` into `nutritionScreens` (and maybe give a better name)
- Rename onboarding screens where name indexes are incremental, and condense name to just `onboarding` instead of `onboardingScreen`
- Folders that need documentation cleanup: `adjustMacros`, `userExercises`, `settings`, `main`, `onboarding`
- Move `addedFoods` component to its own folder with `searchFoodDBPopup` in the `NutritionScreens` folder

## Directory Structure

### Root Level

- **`app.jsx`** - Main app component
- **`loadingScreen.jsx`** - Initial load and when we need to give something time

### `main/` Folder

#### `logScreen.jsx`
Dynamic screen that switches between `workoutScreen` and `nutritionScreen`

**`workoutScreens/` subfolder:**
- **`workoutsScreen.jsx`** - User creates, edits, archives, adds notes, or views workouts
  - **`exercisesScreen.jsx`** - User creates, edits, archives, adds notes, or views exercises for a workout
    - **`logScreen.jsx`** - User adds and edits logs for an exercise in a workout

**`nutritionScreens/` subfolder:**
- **`nutritionScreen.jsx`** - User can update body weight as well as add, edit, save, and create nutrition entries
  - **`addNutritionPopup.jsx`** - Users can manually add or AI generate nutrition values based on input
  - **`searchFoodDBPopup.jsx`** - Users can search our FatSecret API database for branded food
  - **`savedFoodsPopup.jsx`** - Users can add foods they have saved
  - **`camera.jsx`** - Users can take pictures or scan barcodes of food and receive AI-generated nutritional info

- **`progressScreen.jsx`** - Users can view progress wheels and graphs of fatigue, macro intake, macronutrient progress, calorie progress, bodyweight progress, strength progress, total set and volume progress, and more

### `settings/` Folder

- **`settings.jsx`** - Settings screen

  **`adjustMacros/` subfolder:**
  - **`adjustMacros.jsx`** - User can adjust macros based on goals
  - **`setMacros.jsx`** - User can set the adjusted macros

  **`userExercises/` subfolder:**
  - **`userExercises.jsx`** - User can manage, edit, or add their custom exercises
    - **`addUserExercise1.jsx`** - Ask user to add exercise name and if it's a compound exercise
    - **`addUserExercise2.jsx`** - Ask user for the type of equipment the exercise will use
    - **`addUserExercise3.jsx`** - Ask user for the primary muscle group the exercise will target
    - **`addUserExercise4.jsx`** - Ask user for the accessory muscles the exercise will target

  **Other settings screens:**
  - **`trainingFrequency.jsx`** - Adjust training frequency
  - **`profile.jsx`** - View personal details, sign out, or delete account
  - **`support.jsx`** - Contact support or suggest app improvements
  - **`subscription.jsx`** - Upgrade, restore, or cancel your plan
  - **`privacy.jsx`** - Manage your data and privacy
  - **`about.jsx`** - App information and version

### `onboarding/` Folder

- **`onboardingScreen1.jsx`**
- **`onboardingScreen2.jsx`** - Ask user for their gender, age, and height
- **`onboardingScreen3.jsx`**
- **`onboardingScreen4.jsx`**
- **`onboardingScreen6.jsx`**
- **`onboardingScreen8.jsx`**
- **`onboardingScreen10.jsx`**
- **`onboardingScreen11.jsx`**
- **`onboardingScreen12.jsx`**
