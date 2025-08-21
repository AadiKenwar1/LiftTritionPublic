import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function OnboardingScreen2() {
  const navigation = useNavigation();
  
  // Set default birthdate to 25 years ago instead of today
  const defaultBirthDate = new Date();
  defaultBirthDate.setFullYear(defaultBirthDate.getFullYear() - 25);
  
  const [selectedMonth, setSelectedMonth] = useState(defaultBirthDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(defaultBirthDate.getDate());
  const [selectedYear, setSelectedYear] = useState(defaultBirthDate.getFullYear());
  const [age, setAge] = useState(0);

  // Generate arrays for picker options
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  
  // Function to get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

  const calculateAge = (month, day, year) => {
    const today = new Date();
    const birthDate = new Date(year, month, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    console.log('Calculating age:', { birthDate: birthDate.toDateString(), age });
    return age;
  };

  // Calculate initial age when component mounts and when date changes
  useEffect(() => {
    const calculatedAge = calculateAge(selectedMonth, selectedDay, selectedYear);
    setAge(calculatedAge);
    console.log('Age updated:', calculatedAge);
  }, [selectedMonth, selectedDay, selectedYear]);

  // Handle picker changes
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    // Adjust day if it's invalid for the new month
    const maxDays = getDaysInMonth(month, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    // Adjust day if it's invalid for the new year (leap year consideration)
    const maxDays = getDaysInMonth(selectedMonth, year);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleNext = () => {
    console.log('Next button pressed, age:', age);
    if (age === 0) {
      Alert.alert('Error', 'Please select a valid birthdate');
      return;
    }
    
    if (age < 12) {
      Alert.alert('Age Requirement', 'You must be at least 12 years old to use this app');
      return;
    }
    
    // Create birthDate from selected values and store in navigation params as YYYY-MM-DD
    const birthDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    navigation.navigate('Onboarding4', {
      birthDate,
      age: age
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = () => {
    const fullMonthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${fullMonthNames[selectedMonth]} ${selectedDay}, ${selectedYear}`;
  };

  console.log('Current state:', { age, month: selectedMonth, day: selectedDay, year: selectedYear });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>When's your birthday?</Text>
        
        <Text style={styles.description}>
          This helps us calculate your personalized nutrition and fitness recommendations.
        </Text>

        <View style={styles.pickerSection}>
          
          <View style={styles.pickerContainer}>
            <View style={styles.monthPickerColumn}>
              <Text style={styles.pickerLabel}>Month</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={handleMonthChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {months.map((month, index) => (
                    <Picker.Item key={index} label={month} value={index} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.dayPickerColumn}>
              <Text style={styles.pickerLabel}>Day</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedDay}
                  onValueChange={handleDayChange}
                  style={styles.picker}
                  itemStyle={{...styles.pickerItem, fontSize: 16}}
                >
                  {days.map((day) => (
                    <Picker.Item key={day} label={day.toString()} value={day} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.yearPickerColumn}>
              <Text style={styles.pickerLabel}>Year</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={handleYearChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {years.map((year) => (
                    <Picker.Item key={year} label={year.toString()} value={year} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          
          <View style={[styles.ageContainer, (age < 12 || age === 0) && styles.ageContainerWarning]}>
            <Text style={[styles.ageText, age < 12 && styles.ageTextWarning]}>
              {age < 12 && 'Must be at least 12 years old'}
              {age >= 12 && 'You are ' + age + ' years old'}
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#666666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, (age === 0 || age < 12) && styles.nextButtonDisabled]} 
            onPress={handleNext}
            disabled={age === 0 || age < 12}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    maxWidth: 300,
  },
  dateDisplayContainer: {
    backgroundColor: '#00B8A9',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dateDisplayText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pickerSection: {
    width: '100%',
    backgroundColor: '#00B8A9',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 8,
    paddingTop: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  pickerSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthPickerColumn: {
    width: '30%',
    alignItems: 'center',
    marginRight: 6,
  },
  dayPickerColumn: {
    width: '30%',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  yearPickerColumn: {
    width: '35%',
    alignItems: 'center',
    marginLeft: 6,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'black',
    overflow: 'hidden',
    width: '100%',
    height: 120,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 220,
  },
  pickerItem: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    textAlign: 'center',
  },
  ageContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    marginTop: 12,
    marginBottom: 5,
    borderWidth: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: 'center',
  },
  ageContainerWarning: {
    backgroundColor: '#FFE5E5',
    shadowColor: '#E53E3E',
  },
  ageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00B8A9',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  ageTextWarning: {
    color: '#E53E3E',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  nextButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: '#00B8A9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
}); 