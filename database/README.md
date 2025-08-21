# Database Migration Guide

This folder contains all AWS/DynamoDB related files for LiftLyzer. Currently, the app uses **local storage (AsyncStorage)** for development and testing.

## 📁 Folder Structure

```
database/
├── README.md                    # This file
├── amplify.js                   # AWS Amplify configuration
├── aws-exports.js              # AWS exports (auto-generated)
├── amplifyconfiguration.json   # Amplify configuration (auto-generated)
└── graphql/
    ├── mutations.js            # GraphQL mutations (auto-generated)
    ├── queries.js              # GraphQL queries (auto-generated)
    ├── subscriptions.js        # GraphQL subscriptions (auto-generated)
    └── schema.json             # GraphQL schema (auto-generated)
```

## 🚀 Current Status

### ✅ What's Ready:
- **AWS Backend**: DynamoDB tables and AppSync API are deployed
- **GraphQL Schema**: All data models are defined
- **Configuration**: Amplify is configured with API key authentication
- **Migration Service**: Ready to migrate data from AsyncStorage to DynamoDB

### 🔄 Current Mode:
- **Storage**: Local (AsyncStorage)
- **Authentication**: Mock (no real users)
- **Sync**: Offline only

## 📋 Migration Checklist

### Phase 1: Preparation (Before Migration)
- [ ] **User Base**: Have real users who want cloud features
- [ ] **Data Backup**: Export current AsyncStorage data
- [ ] **Testing**: Test migration on development environment
- [ ] **User Communication**: Inform users about the migration

### Phase 2: Technical Setup
- [ ] **Fix NetInfo**: Resolve `@react-native-community/netinfo` linking issues
- [ ] **Update Contexts**: Convert WorkoutContext, NutritionContext, SettingsContext to use GraphQL
- [ ] **Test GraphQL Operations**: Ensure all CRUD operations work
- [ ] **Add Error Handling**: Handle network failures and offline scenarios

### Phase 3: Migration Process
- [ ] **Switch Config**: Change `STORAGE_MODE` from 'local' to 'dynamodb'
- [ ] **Run Migration**: Use MigrationService to upload existing data
- [ ] **Verify Data**: Check that all data migrated correctly
- [ ] **Test Features**: Ensure all app features work with cloud data

## 🔧 Technical Migration Steps

### Step 1: Fix NetInfo Issues
```bash
# Remove problematic netinfo
npm uninstall @react-native-community/netinfo

# Install Expo-compatible version
npx expo install @react-native-community/netinfo

# Or use Expo's network module instead
npx expo install expo-network
```

### Step 2: Update Configuration
```javascript
// In utils/config.js
export const APP_CONFIG = {
  STORAGE_MODE: 'dynamodb',  // Change from 'local'
  AUTH_MODE: 'cognito',      // Change from 'mock'
  FEATURES: {
    ENABLE_CLOUD_SYNC: true, // Enable cloud features
  }
};
```

### Step 3: Update Contexts
Each context needs to be updated to use GraphQL operations:

#### WorkoutContext
```javascript
// Before (AsyncStorage)
await AsyncStorage.setItem('workouts', JSON.stringify(workouts));

// After (GraphQL)
await client.graphql({
  query: createWorkout,
  variables: { input: workoutData }
});
```

#### NutritionContext
```javascript
// Before (AsyncStorage)
await AsyncStorage.setItem('nutritionData', JSON.stringify(nutritionData));

// After (GraphQL)
await client.graphql({
  query: createNutrition,
  variables: { input: nutritionData }
});
```

#### SettingsContext
```javascript
// Before (AsyncStorage)
await AsyncStorage.setItem('settings', JSON.stringify(settings));

// After (GraphQL)
await client.graphql({
  query: updateSettings,
  variables: { input: settings }
});
```

### Step 4: Run Migration
```javascript
// Use the MigrationService to migrate existing data
import { MigrationService } from '../utils/migrationService';

const results = await MigrationService.migrateAll();
console.log('Migration results:', results);
```

## 📊 Data Models

### Workout Model
```graphql
type Workout @model {
  id: ID!
  name: String!
  exercises: [Exercise!]!
  archived: Boolean!
  note: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

### Nutrition Model
```graphql
type Nutrition @model {
  id: ID!
  name: String!
  date: String!
  protein: Float!
  carbs: Float!
  fats: Float!
  calories: Float!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

### Settings Model
```graphql
type Settings @model {
  id: ID!
  mode: Boolean!
  unit: Boolean!
  bodyWeight: Float!
  height: Float!
  calorieGoal: Int!
  proteinGoal: Int!
  carbsGoal: Int!
  fatsGoal: Int!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

## 🔐 Authentication

### Current: API Key (Testing)
- **Mode**: `defaultAuthMode: 'apiKey'`
- **Use Case**: Development and testing
- **Limitations**: No user isolation, all data is public

### Future: Cognito Users
- **Mode**: `defaultAuthMode: 'userPool'`
- **Use Case**: Production with real users
- **Benefits**: User-specific data, security, multi-device sync

## 📱 AppSync Features

### Automatic Features:
- ✅ **Local Caching**: Data cached on device
- ✅ **Offline Support**: Works without internet
- ✅ **Real-time Sync**: Live updates across devices
- ✅ **Conflict Resolution**: Handles data conflicts automatically

### Manual Features:
- 🔄 **Data Migration**: From AsyncStorage to DynamoDB
- 📊 **Analytics**: User behavior tracking
- 🔔 **Push Notifications**: Real-time updates
- 👥 **Social Features**: Share workouts, leaderboards

## 🚨 Important Notes

### Before Migration:
1. **Backup Data**: Export all AsyncStorage data
2. **Test Thoroughly**: Test migration on development environment
3. **User Communication**: Inform users about the change
4. **Rollback Plan**: Have a plan to revert if issues occur

### During Migration:
1. **Monitor Logs**: Watch for migration errors
2. **Verify Data**: Check that all data migrated correctly
3. **Test Features**: Ensure all app features work
4. **User Support**: Be ready to help users with issues

### After Migration:
1. **Monitor Performance**: Watch for any performance issues
2. **User Feedback**: Collect feedback about the new features
3. **Analytics**: Monitor usage patterns
4. **Optimization**: Optimize based on real usage data

## 💰 Cost Considerations

### AWS Costs (Estimated):
- **DynamoDB**: ~$1-5/month for typical usage
- **AppSync**: ~$1-3/month for API calls
- **Data Transfer**: Minimal for typical usage
- **Total**: ~$2-8/month for small to medium user base

### Cost Optimization:
- **Read/Write Capacity**: Start with on-demand, switch to provisioned for high usage
- **Data Retention**: Implement data cleanup policies
- **Caching**: Use AppSync caching to reduce API calls
- **Monitoring**: Set up CloudWatch alerts for cost spikes

## 🆘 Troubleshooting

### Common Issues:

#### NetInfo Linking Error
```bash
Error: @react-native-community/netinfo: NativeModule.RNCNetInfo is null
```
**Solution**: Use Expo-compatible version or disable network monitoring

#### GraphQL Client Undefined
```bash
TypeError: Cannot read property 'graphql' of undefined
```
**Solution**: Ensure Amplify is configured before using GraphQL client

#### Migration Failures
```bash
Error: Failed to migrate data
```
**Solution**: Check network connection, API key validity, and data format

### Debug Commands:
```bash
# Check Amplify configuration
console.log('Amplify config:', Amplify.configure);

# Test GraphQL connection
client.graphql({ query: listWorkouts }).then(console.log);

# Check migration status
MigrationService.checkMigrationStatus().then(console.log);
```

## 📞 Support

When you're ready to migrate:
1. **Review this guide** thoroughly
2. **Test on development** environment first
3. **Backup all data** before starting
4. **Have rollback plan** ready
5. **Monitor closely** during migration

The AWS backend is ready and waiting! 🚀 