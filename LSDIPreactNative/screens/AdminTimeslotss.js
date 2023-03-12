import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, TouchableOpacity, TouchableHighlight, Modal, StyleSheet, Alert, FlatList, TextInput, ScrollView } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { firebase } from '../config/firebase';
import DuplicateAlert from '../components/DuplicateAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import { MaterialIcons } from '@expo/vector-icons';

const AdminSetTimingsScreen = ({ navigation }) => {
    const [markedDates, setMarkedDates] = useState({});
    const [availableDates, setAvailableDates] = useState({});
    const [timingsModalVisible, setTimingsModalVisible] = useState(false);
    //const [selectedDate, setSelectedDate] = useState('');
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [selectedTimings, setSelectedTimings] = useState([]);
    const [availableTimings, setAvailableTimings] = useState(null);
    const [timingsInput, setTimingsInput] = useState('');
    

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    const CustomArrow = ({ direction, onPress }) => {
      return (
        <TouchableOpacity onPress={onPress}>
          <MaterialIcons name={direction === 'left' ? 'chevron-left' : 'chevron-right'} size={24} color="black" />
        </TouchableOpacity>
      );
    };
    const AddTimingsModal = ({
      visible,
      onClose,
      onAddTimings,
      onDeleteDate,
      onDeleteTimings,
      selectedDate,
      selectedTimings,
    }) => {
      const db = firebase.firestore();
      const [availableTimings, setAvailableTimings] = useState([]);
      const [timingsInput, setTimingsInput] = useState('');
    
      const getAvailableTimings = useCallback(async () => {
        try {
          const timingsDoc = await db.collection('available_timings').doc(selectedDate).get();
          const availableTimings = timingsDoc.data()?.available_times || [];
          setAvailableTimings(availableTimings);
        } catch (error) {
          console.error(error);
          setAvailableTimings([]);
        }
      }, [db, selectedDate]);
    
      useEffect(() => {
        getAvailableTimings();
      }, [getAvailableTimings]);
    
      const handleAddPress = () => {
        onAddTimings(timingsInput.split(","));
        setTimingsInput("");
      };
    
      const handleDeleteTimings = async () => {
        try {
          const timingsRef = db.collection('available_timings').doc(selectedDate);
          const timingsDoc = await timingsRef.get();
          const availableTimings = timingsDoc.data()?.available_times || [];
          const updatedTimings = availableTimings?.filter((timing) => !selectedTimings.includes(timing)) || [];
          await timingsRef.update({ available_times: updatedTimings });
          setSelectedTimings([]);
        } catch (err) {
          console.log('Error deleting available timings: ', err);
        }
      };
      
    
      return (
        <Modal visible={visible} animationType="slide" transparent={true}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedDate}</Text>
              <ScrollView style={styles.timingsContainer}>
                  {availableTimings.length > 0 ? (
                    availableTimings.map((timing, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timingButton,
                          selectedTimings.includes(timing) && styles.selectedTimingButton,
                        ]}
                        onPress={() => {
                          if (selectedTimings.includes(timing)) {
                            setSelectedTimings(selectedTimings.filter((t) => t !== timing));
                          } else {
                            setSelectedTimings([...selectedTimings, timing]);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.timingText,
                            !availableDates[selectedDate] && styles.disabledTimingText,
                          ]}
                        >
                          {timing}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noTimingsText}>No available timings</Text>
                  )}
                </ScrollView>
    
              <TextInput
                style={styles.timingsInput}
                placeholder="Enter comma-separated timings"
                value={timingsInput}
                onChangeText={(text) => setTimingsInput(text)}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPress}
                disabled={!timingsInput}
              >
                <Text style={styles.addButtonLabel}>Add Timings</Text>
              </TouchableOpacity>
              <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTimings}>
                <Text style={styles.deleteButtonText}>Delete Timings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={onDeleteDate}>
                <Text style={styles.deleteButtonText}>Delete Date</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            </View>
            </View>
          </Modal>
        );
      };
      
      const onDayPress = (day) => {
        const date = day.dateString;
        if (availableDates[date]) {
          const timings = availableDates[date].timings;
          setSelectedTimings(timings);
        }
        setTimingsModalVisible(true);
        setSelectedDate(date);
      };
  
      const handleAddTimings = async (available_times) => {
        try {
          const timingsRef = db.collection('available_timings').doc(selectedDate);
          const timingsDoc = await timingsRef.get();
          if (timingsDoc.exists) {
            const updatedTimings = [...selectedTimings, ...available_times];
            await timingsRef.update({ available_times: updatedTimings });
            setSelectedTimings(updatedTimings);
          } else {
            await timingsRef.set({ available_times });
            setSelectedTimings(available_times);
            setAvailableDates((prevAvailableDates) => {
              const updatedAvailableDates = { ...prevAvailableDates };
              updatedAvailableDates[selectedDate] = true;
              return updatedAvailableDates;
            });
            setMarkedDates((prevMarkedDates) => {
              const updatedMarkedDates = { ...prevMarkedDates };
              updatedMarkedDates[selectedDate] = { marked: true };
              return updatedMarkedDates;
            });
          }
          setTimingsModalVisible(false);
        } catch (err) {
          console.log('Error adding available timings: ', err);
        }
      };
      
  
    const handleDeleteDate = async () => {
      try {
        await db.collection('available_timings').doc(selectedDate).delete();
        setAvailableDates((prevAvailableDates) => {
          const updatedAvailableDates = { ...prevAvailableDates };
          delete updatedAvailableDates[selectedDate];
          return updatedAvailableDates;
        });
        setTimingsModalVisible(false);
      } catch (err) {
        console.log('Error deleting available date: ', err);
      }
    };
    useEffect(() => {
      const unsubscribe = db
        .collection('available_timings')
        .onSnapshot((snapshot) => {
          const updatedAvailableDates = {};
          const updatedMarkedDates = {};
          snapshot.forEach((doc) => {
            const date = doc.id;
            const timings = doc.data().timings;
            updatedAvailableDates[date] = true;
            updatedMarkedDates[date] = { marked: true };
          });
          setAvailableDates(updatedAvailableDates);
          setMarkedDates(updatedMarkedDates);
        });
      return unsubscribe;
    }, []);

    return (
      <View style={styles.container}>
        <View style={styles.calendarContainer}>
        <CalendarList
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType="simple"
          pastScrollRange={0}
          futureScrollRange={1}
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
        </View>
        <View style={styles.timingsContainer}>
          <Text style={styles.timingsTitle}>Available Timings</Text>
          <FlatList
            data={Object.keys(availableDates)}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableHighlight
                style={styles.dateButton}
                underlayColor="#DDDDDD"
                onPress={() => {
                  setSelectedDate(item);
                  if (!timingsModalVisible) {
                    setTimingsModalVisible(true);
                  }
                }}
              >
                <Text style={styles.dateText}>{item}</Text>
              </TouchableHighlight>
            )}
            
            ListEmptyComponent={
              <Text style={styles.noDatesText}>No available timings</Text>
            }
          />
        </View>
        <AddTimingsModal
            visible={timingsModalVisible}
            onClose={() => setTimingsModalVisible(false)}
            onAddTimings={handleAddTimings}
            onDeleteDate={handleDeleteDate}
            selectedDate={selectedDate}
            selectedTimings={selectedTimings}
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    calendarContainer: {
      marginBottom: 20,
    },
    timingsContainer: {
      flex: 1,
    },
    timingsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    dateButton: {
      backgroundColor: 'white',
      borderRadius: 5,
      padding: 10,
      marginVertical: 5,
      alignItems: 'center',
    },
    dateText: {
      fontSize: 16,
    },
    noDatesText: {
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: 10,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 5,
      minWidth: 300,
      width: '80%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    timingsContainer: {
      marginBottom: 20,
    },
    timingsTitle: {
      fontSize: 16,
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
    addButton: {
      backgroundColor: 'blue',
      borderRadius: 5,
      padding: 10,
      marginTop: 20,
      alignSelf: 'center',
    },
    addButtonLabel: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    deleteButton: {
      backgroundColor: 'blue',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginHorizontal: 10,
    },
    deleteButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },  
    timingsInput: {
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      height: 40,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
  });
  
  
  export default AdminSetTimingsScreen;
  
  