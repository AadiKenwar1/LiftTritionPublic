# Data Flow Explanation: Adding, Deleting, and Editing Items

## Overview
This document explains how items flow through the system when they are added, deleted, or edited, and how they sync to the database.

## Adding Items (Workout/Exercise/Log/Nutrition)

### Flow:
1. **User Action**: User creates a new item (e.g., adds a workout)
2. **Function Call**: `addWorkout(name, userId, setWorkouts)` is called
3. **Item Creation**: 
   - New item is created with `synced: false` (marks it as needing sync)
   - Item is added to state via `setWorkouts(prev => [{ ...newWorkout, synced: false }, ...prev])`
4. **State Update Triggers**:
   - **WorkoutContext Save useEffect**: Saves updated array to AsyncStorage
   - **SyncManager useEffect**: Detects unsynced item (`!w.synced`) and triggers sync
5. **Sync Process**:
   - `syncWorkouts()` is called
   - For new items: Tries `updateWorkout` first (fails), then `createWorkout` (succeeds)
   - If successful: Item is marked `synced: true` in state
   - State update triggers save useEffect → updates AsyncStorage
6. **Result**: Item exists in both AsyncStorage (with `synced: true`) and Database

---

## Deleting Items

### Flow:
1. **User Action**: User deletes an item (e.g., deletes a workout)
2. **Function Call**: `deleteWorkout(workoutId, setWorkouts, setExercises, setLogs)` is called
3. **Soft Delete**:
   - Item is NOT removed from array
   - Item is marked with `deleted: true`: `setWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, deleted: true } : w))`
   - Related items are also marked deleted (e.g., exercises and logs when workout is deleted)
4. **State Update Triggers**:
   - **WorkoutContext Save useEffect**: Saves updated array (with deleted items) to AsyncStorage
   - **SyncManager useEffect**: Detects deleted items (`w.deleted`) and triggers sync
5. **Sync Process**:
   - `syncWorkouts()` is called
   - Deletion sync phase runs first: Attempts to delete from database
   - If successful (or item never existed in DB): Item is REMOVED from AsyncStorage
   - `setWorkouts(prev => prev.filter(item => !deletedIds.includes(item.id)))`
6. **Result**: Item is removed from both AsyncStorage and Database

---

## Editing Items

### Flow:
1. **User Action**: User edits an item (e.g., renames a workout)
2. **Function Call**: `renameWorkout(workoutId, newName, setWorkouts)` is called
3. **Item Update**:
   - Item is updated with new data AND `synced: false` (marks it as needing sync)
   - `setWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, name: newName, synced: false } : w))`
4. **State Update Triggers**:
   - **WorkoutContext Save useEffect**: Saves updated array to AsyncStorage
   - **SyncManager useEffect**: Detects unsynced item (`!w.synced`) and triggers sync
5. **Sync Process**:
   - `syncWorkouts()` is called
   - For edited items: Tries `updateWorkout` first (should succeed for existing items)
   - If successful: Item is marked `synced: true` in state
   - State update triggers save useEffect → updates AsyncStorage
6. **Result**: Item is updated in both AsyncStorage (with `synced: true`) and Database

---

## Key Points

### Sync Manager Trigger Conditions:
- Sync triggers when arrays change (`useEffect` dependencies: `workouts`, `exercises`, `logs`, `userExercises`)
- Sync runs if there are:
  - **Unsynced items**: `!item.synced && !item.deleted`
  - **Deleted items**: `item.deleted`

### State Management:
- **AsyncStorage**: Always contains the current state (including deleted items until sync completes)
- **Database**: Contains only active, synced items
- **Sync Process**: Keeps AsyncStorage and Database in sync

### Deletion Strategy (Soft Delete):
- Items are marked `deleted: true` locally
- Sync process handles actual deletion from database
- Items are removed from AsyncStorage only after successful database deletion
- This allows offline deletions to sync when connection is restored

### Potential Issues to Watch:
1. **Sync not triggering**: If state updates don't trigger useEffect (e.g., reference equality issues)
2. **Sync failing silently**: Errors in sync functions might not be caught
3. **State update race conditions**: Multiple rapid changes might cause sync issues
4. **Deletion sync not completing**: If deletion fails, items remain in AsyncStorage with `deleted: true`

---

## Testing the Flow

### To verify adding works:
1. Add an item → Should see `synced: false` in logs
2. Check sync manager logs → Should show sync starting
3. Check sync function logs → Should show create/update attempt
4. Verify item has `synced: true` after sync completes

### To verify deleting works:
1. Delete an item → Should see `deleted: true` in logs
2. Check sync manager logs → Should show deleted items count
3. Check sync function logs → Should show deletion sync phase
4. Verify item is removed from AsyncStorage after successful deletion

### To verify editing works:
1. Edit an item → Should see `synced: false` in logs
2. Check sync manager logs → Should show unsynced item
3. Check sync function logs → Should show update attempt (should succeed)
4. Verify item has `synced: true` after sync completes

