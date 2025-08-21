import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { migrationHelper } from '../database/databaseSystem/migrationHelper';
import { getCurrentConfig } from '../utils/config';

export default function MigrationStatus() {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const config = getCurrentConfig();

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const status = await migrationHelper.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const handleMigration = async () => {
    Alert.alert(
      'Migrate to Cloud Storage',
      'This will upload your local data to the cloud. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Migrate',
          onPress: async () => {
            setIsLoading(true);
            try {
              const results = await migrationHelper.migrateToDynamoDB();
              Alert.alert('Migration Complete', 'Your data has been uploaded to the cloud!');
              checkMigrationStatus();
            } catch (error) {
              Alert.alert('Migration Failed', error.message);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Don't show if already in DynamoDB mode
  if (config.storageMode === 'dynamodb') {
    return null;
  }

  // Don't show if no local data
  if (!migrationStatus?.hasLocalData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📦 Cloud Storage Available</Text>
        <Text style={styles.description}>
          You have {migrationStatus.localDataCount} items stored locally. 
          Migrate to cloud storage for backup and sync across devices.
        </Text>
        
        <View style={styles.statsContainer}>
          {migrationStatus.collections.map(collection => (
            <Text key={collection} style={styles.stat}>
              • {collection}: {migrationStatus.localDataCount} items
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleMigration}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Migrating...' : 'Migrate to Cloud'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00BFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#00BFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsContainer: {
    marginBottom: 16,
  },
  stat: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 