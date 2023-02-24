import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { firebase } from '../config/firebase';
import DuplicateAlert from '../components/DuplicateAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

const DeliveryScreen = ({ navigation }) => {
  const [duplicateMessage, setDuplicateMessage] = useState(null);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimesList, setSelectedTimesList] = useState([]);
  const [displayMonth, setDisplayMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentMonthDays, setCurrentMonthDays] = useState([]);

const getMonthDays = (month, year) => {

  const date = moment(`${year}-${month + 1}-01`);
  const days = [];

  while (date.month() === month) {
    days.push(date.toDate());
    date.add(1, 'day');
  }

  return days;
};
  
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
  const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
  
  const handleMonthChange = useCallback(({ year, month }) => {
    setDisplayMonth(`${Number(year)}-${Number(month)}`);
  }, []);
  
  useEffect(() => {
    //const days = getMonthDays(moment(displayMonth).year(), moment(displayMonth).month());
    const days = getMonthDays(moment(displayMonth).month(), moment(displayMonth).year());
    setCurrentMonthDays(days);
  }, [displayMonth]);

  useEffect(() => {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (user) {
      const docRef = db.collection('user_timings').doc(user.uid);
      docRef.onSnapshot((doc) => {
        if (doc.exists) {
          const selectedTimes = doc.data().selected_times || [];
          console.log(selectedTimes);
          setSelectedTimesList(selectedTimes);
        } else {
          setSelectedTimesList([]);
        }
      });
    }
  }, [handleMonthChange]);

  const AvailableTimingsModal = ({ date, onClose }) => {
    const [availableTimings, setAvailableTimings] = useState([]);
    //const [isOpen, setIsOpen] = useState(!!date);
    const [selectedTime, setSelectedTime] = useState(null);
  
    useEffect(() => {
      if (date) {
        // Retrieve available timings for the selected date from Firebase
        const db = firebase.firestore();
        db.collection('available_timings')
          .doc(date)
          .get()
          .then((doc) => {
            if (doc.exists) {
              setAvailableTimings(doc.data().available_times);
            } else {
              setAvailableTimings([]);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }, [date]);
  
    const handleTimeSelect = (timing) => {
      setSelectedTime(timing);
    };
  
    const handleClose = () => {
      setSelectedTime(null);
      setSelectedDate(null);
      onClose();
      //setIsOpen(false);
    };
  
    const handleConfirm = () => {
      if (selectedTime) {
        const existingTime = selectedTimesList.find(
          (item) => item.date === selectedDate && item.time === selectedTime
        );
    
        if (existingTime) {
          setDuplicateMessage(
            `The selected time ${selectedTime} is already added for ${selectedDate}`
          );
          setIsDuplicateOpen(true);
          setIsModalOpen(false);
        } else {
          const db = firebase.firestore();
          const user = firebase.auth().currentUser;
          if (user) {
            const docRef = db.collection('user_timings').doc(user.uid);
            docRef
              .get()
              .then((doc) => {
                let selectedTimes = [];
                if (doc.exists) {
                  selectedTimes = doc.data().selected_times;
                }
                selectedTimes.push({
                  date: selectedDate,
                  time: selectedTime,
                });
                return docRef.set({
                  selected_times: selectedTimes,
                });
              })
              .then(() => {
                console.log('Selected time added for user with UID: ', user.uid);
                const newSelectedTimesList = [
                  ...selectedTimesList,
                  {
                    date: selectedDate,
                    time: selectedTime,
                  },
                ];
                setSelectedTimesList(newSelectedTimesList);
                setSelectedTime(null);
                setIsModalOpen(false);
              })
              .catch((error) => {
                console.error(error);
              });
          }
        }
      }
    };
    
  
    return (
      <Modal visible={isModalOpen} animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Available Timings on {date}</Text>
          {availableTimings.length > 0 ? (
            availableTimings.map((timing) => {
              const isDisabled =
                selectedTime !== null && selectedTime !== timing;
              return (
                <TouchableOpacity
                  key={timing}
                  style={[
                    styles.timingButton,
                    selectedTime === timing && styles.selectedTimingButton,
                    isDisabled && styles.disabledTimingButton,
                  ]}
                  onPress={() => handleTimeSelect(timing)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.timingText,
                      isDisabled && styles.disabledTimingText,
                    ]}
                  >
                    {timing}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noTimingsText}>
              No available timings for selected
            </Text>
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                selectedTime === null && styles.disabledConfirmButton,
              ]}
              onPress={() => handleConfirm(date, selectedTime)}
              disabled={selectedTime === null}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleDelete = (id) => {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (user) {
      const docRef = db.collection('user_timings').doc(user.uid);
      docRef.get().then((doc) => {
        if (doc.exists) {
          const selectedTimes = doc.data().selected_times.filter(
            (time) => time.date !== id.date || time.time !== id.time
          );
          return docRef.set({
            selected_times: selectedTimes,
          });
        }
      }).then(() => {
        console.log('Selected time deleted for user with UID: ', user.uid);
        const newSelectedTimesList = selectedTimesList.filter(
          (item) => item.date !== id.date || item.time !== id.time
        );
        setSelectedTimesList(newSelectedTimesList);
      }).catch((error) => {
        console.error(error);
      });
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };
  
  return (
    <View style={styles.container}>
      <CalendarList
        onDayPress={handleDayPress}
        markedDates={{
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
            },
          }),
          ...currentMonthDays.reduce(
            (acc, day) => ({ ...acc, [day]: { disabled: true } }),
            {}
          ),
        }}
        pastScrollRange={0}
        futureScrollRange={3}
        scrollEnabled={true}
        horizontal={true}
        pagingEnabled={true}
        calendarWidth={350}
        calendarHeight={350}
        theme={{
          selectedDayBackgroundColor: '#007aff',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          textDisabledColor: '#d9e1e8',
          arrowColor: 'gray',
        }}
      />
      <Text style={styles.scrollMessage}>Scroll right to see more dates</Text>


      {selectedDate && (
        <View style={styles.selectedDateContent}>
          <Text style={styles.selectedDateText}>
            Selected date: {selectedDate}
          </Text>
          <TouchableOpacity
            style={styles.viewTimingsButton}
            onPress={() => setIsModalOpen(true)}
          >
            <Text style={styles.viewTimingsButtonText}>View timings</Text>
          </TouchableOpacity>
        </View>
      )}
      {selectedTimesList.length > 0 && (
        <View style={styles.selectedTimesContainer}>
          <Text style={styles.selectedTimesTitle}>Selected Times</Text>
          <ScrollView style={styles.selectedTimesList}>
            {selectedTimesList.map((item) => (
              <View key={`${item.date}-${item.time}`} style={styles.selectedTimeCard}>
                <Text style={styles.selectedTimeText}>
                  {item.date} - {item.time}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

      )}
      <AvailableTimingsModal
        date={selectedDate}
        onClose={() => setIsModalOpen(false)}
        isModalOpen={isModalOpen}
      />
      <DuplicateAlert
        message={duplicateMessage}
        isOpen={isDuplicateOpen}
        onClose={() => setIsDuplicateOpen(false)}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timingButton: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  selectedTimingButton: {
    backgroundColor: 'blue',
  },
  disabledTimingButton: {
    backgroundColor: 'lightgray',
  },
  timingText: {
    fontSize: 16,
  },
  disabledTimingText: {
    color: 'gray',
  },
  noTimingsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedDateContent: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  viewTimingsButton: {
    backgroundColor: '#007aff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  viewTimingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedTimesContent: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingVertical: 10,
  },
  selectedTimesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  selectedTimeText: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 10,
      marginVertical: 20,
    },
    arrowContainer: {
      width: '10%',
    },
    arrowButton: {
      padding: 10,
    },
    calendarHeaderText: {
      fontWeight: 'bold',
      fontSize: 20,
      textAlign: 'center',
      width: '80%',
    },
    scrollMessage: {
      backgroundColor: '#f1f1f1',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      marginTop: 10,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 16,
    },
    selectedTimesContainer: {
      marginTop: 20,
      marginBottom: 20,
      height: 500,
    },
    selectedTimesList: {
      flex: 1,
    },
  
});

export default DeliveryScreen;