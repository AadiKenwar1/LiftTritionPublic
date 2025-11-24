import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function DatePickerModal({ visible, onClose, onDateSelect, initialDate = new Date() }) {
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  // Generate arrays for picker options
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);
  
  // Function to get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

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

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onDateSelect(selectedDate);
    onClose();
  };

  const formatSelectedDate = () => {
    return `${months[selectedMonth]} ${selectedDay}, ${selectedYear}`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Select Date</Text>
              <Text style={styles.headerSubtitle}>Choose a date to view nutrition logs</Text>
            </View>

            {/* Date Display */}
            <View style={styles.dateDisplayContainer}>
              <Text style={styles.dateDisplayText}>{formatSelectedDate()}</Text>
            </View>

            {/* Date Picker */}
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
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  content: {
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 5,
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  pickerSection: {
    width: '105%',
    backgroundColor: '#4CD964',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    paddingTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerColumn: {
    width: '32%',
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
    fontFamily: 'Inter_700Bold',
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
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#888888',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CD964',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
