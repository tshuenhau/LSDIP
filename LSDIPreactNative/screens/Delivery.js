import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

const SignUpScreen = ({ navigation }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
  const AvailableTimingsModal = ({ date, onClose }) => {
    const [availableTimings, setAvailableTimings] = useState([
      '10:00 AM',
      '12:00 PM',
      '02:00 PM',
      '04:00 PM',
    ]);
    const handleTimeSelect = (timing) => {
      setSelectedTime(timing);
      onClose(); // close the modal when a time is selected
    };

    const handleClose = () => {
      onClose();
    };

    return (
        <Modal visible={!!date} animationType="slide" onRequestClose={onClose}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Timings on {date}</Text>
            {availableTimings.length > 0 ? (
              availableTimings.map((timing) => (
                <TouchableOpacity
                  key={timing}
                  style={[
                    styles.timingButton,
                    selectedTime === timing && styles.selectedTimingButton,
                  ]}
                  onPress={() => handleTimeSelect(timing)}
                >
                  <Text style={styles.timingText}>{timing}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noTimingsText}>
                No available timings for selected date.
              </Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      );
  };

  const CalendarScreen = () => {
    
    const handleDayPress = (day) => {
      setSelectedDate(day.dateString);
      setIsModalOpen(true);
    };

    const handleClose = () => {
      setIsModalOpen(false);
    };

    const handleTimeSelect = (timing) => {
        setSelectedTime(timing);
        handleClose();
      };

    return (
      <View style={styles.container}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#1e90ff',
            },
          }}
        />
        <AvailableTimingsModal date={selectedDate} onClose={handleClose} />
      </View>
    );
  };

  return <CalendarScreen />;
};

export default SignUpScreen;

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 10,
  },
  timingButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
  },
  selectedTimingButton: {
    backgroundColor: '#1e90ff',
  },
  timingText: {
    fontSize: 16,
    color: '#333',
  },
  noTimingsText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
  },
};