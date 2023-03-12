import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import DateTimePicker from 'react-datetime-picker';
import { firebase } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';

const db = firebase.firestore();
const user = firebase.auth().currentUser;

const BlockTimePage = () => {
  const [selectedDate, setSelectedDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [isDateTimePickerVisible, setDateTimePickerVisible] = useState('date');
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(true);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(true);
  const [tempStartTime, setTempStartTime] = useState(startTime);
  const [tempEndTime, setTempEndTime] = useState(endTime);
  const [blockedTimings, setBlockedTimings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  

  useEffect(() => {
    db.collection('blocked_timings').onSnapshot((snapshot) => {
      const blockedTimingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlockedTimings(
        blockedTimingsData.map((blockedTimingData) => {
          return {
            ...blockedTimingData,
            blockedTimings: blockedTimingData.blockedTimings.map((timing) => {
              return {
                startTime: new Date(timing.startTime.toDate().toLocaleString('en-US', {timeZone: 'Asia/Singapore'})),
                endTime: new Date(timing.endTime.toDate().toLocaleString('en-US', {timeZone: 'Asia/Singapore'})),
              };
            }),
          };
          
        })
      );
    });
  }, []);

  const handleDateTimeConfirm = useCallback((date) => {
    console.log(date);
    if (isDateTimePickerVisible === 'date') {
      setSelectedDate(date);
    } else if (isDateTimePickerVisible === 'start') {
      setStartTime(date);
    } else {
      setEndTime(date);
    }
    setDateTimePickerVisible(false);
  }, [isDateTimePickerVisible]);

  const handleStartTimeConfirm = useCallback((time) => {
    setTempStartTime(time);
  }, []);

  const handleEndTimeConfirm = useCallback((time) => {
    setTempEndTime(time);
  }, []);

  const handleBlockDate = useCallback(() => {
    if (!selectedDate) {
      setErrorMessage('Please select a date');
      return;
    }
  
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setDate(selectedDateTime.getDate() + 1);
    selectedDateTime.setUTCHours(0, 0, 0, 0); // set time to midnight in UTC time zone
    const documentId = selectedDateTime.toISOString().slice(0, 10); // use UTC date string for document ID
  
    const startDateTime = new Date(
      selectedDateTime.getUTCFullYear(),
      selectedDateTime.getUTCMonth(),
      selectedDateTime.getUTCDate(),
      0,
      0,
      0
    );
    const endDateTime = new Date(
      selectedDateTime.getUTCFullYear(),
      selectedDateTime.getUTCMonth(),
      selectedDateTime.getUTCDate(),
      23,
      59,
      59
    );
  
    const startTimestamp = firebase.firestore.Timestamp.fromDate(new Date(startDateTime.toLocaleString('en-US', {timeZone: 'Asia/Singapore'})));
    const endTimestamp = firebase.firestore.Timestamp.fromDate(new Date(endDateTime.toLocaleString('en-US', {timeZone: 'Asia/Singapore'})));
  
    db.collection('blocked_timings')
      .doc(documentId)
      .set(
        {
          blockedTimings: firebase.firestore.FieldValue.arrayUnion({
            startTime: startTimestamp,
            endTime: endTimestamp,
          }),
        },
        { merge: true }
      )
      .then(() => {
        setSelectedDate();
      })
      .catch((error) => {
        console.error(error);
      });
      setErrorMessage('');
  }, [selectedDate]);
  
  const handleSaveBlockedTime = useCallback(() => {
    if (!selectedDate || !tempStartTime || !tempEndTime) {
      setErrorMessage('Please select a date, start time, and end time');
      console.log('Please select a date, start time, and end time');
      return;
    }
    
    if (tempEndTime <= tempStartTime) {
      setErrorMessage('End time must be after start time');
      return;
    }
  
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setDate(selectedDateTime.getDate() + 1);
    selectedDateTime.setUTCHours(0, 0, 0, 0); // set time to midnight in UTC time zone
    const documentId = selectedDateTime.toISOString().slice(0, 10); // use UTC date string for document ID
  
    const startDateTime = new Date(
      selectedDateTime.getUTCFullYear(),
      selectedDateTime.getUTCMonth(),
      selectedDateTime.getUTCDate(),
      tempStartTime.getUTCHours(),
      tempStartTime.getUTCMinutes(),
      tempStartTime.getUTCSeconds(),
    );
    const endDateTime = new Date(
      selectedDateTime.getUTCFullYear(),
      selectedDateTime.getUTCMonth(),
      selectedDateTime.getUTCDate(),
      tempEndTime.getUTCHours(),
      tempEndTime.getUTCMinutes(),
      tempEndTime.getUTCSeconds(),
    );
  
    const startTimestamp = firebase.firestore.Timestamp.fromDate(new Date(startDateTime.toLocaleString('en-US', {timeZone: 'Asia/Singapore'})));
    const endTimestamp = firebase.firestore.Timestamp.fromDate(new Date(endDateTime.toLocaleString('en-US', {timeZone: 'Asia/Singapore'})));
  
    db.collection('blocked_timings')
      .doc(documentId) // Use selectedDate to create document ID
      .set(
        {
          blockedTimings: firebase.firestore.FieldValue.arrayUnion({
            startTime: startTimestamp,
            endTime: endTimestamp,
          }),
        },
        { merge: true }
      )
      .then(() => {
        setSelectedDate();
        setStartTime();
        setEndTime();
        setTempStartTime();
        setTempEndTime();
        setStartTimePickerVisible(false);
        setEndTimePickerVisible(false);
      })
      .catch((error) => {
        console.error(error);
      });
      setErrorMessage('');
  }, [selectedDate, tempStartTime, tempEndTime]);  
  

  const removeBlockedTiming = useCallback((date, startTime, endTime) => {
    const blockedTiming = blockedTimings.find((timing) => {
      return (
        timing.id === date &&
        timing.blockedTimings[0].startTime.getTime() === startTime.getTime() &&
        timing.blockedTimings[0].endTime.getTime() === endTime.getTime()
      );
    });
  
    if (blockedTiming) {
      db.collection('blocked_timings')
        .doc(date)
        .delete()
        .catch((error) => {
          console.error(error);
        });
    }
  }, [blockedTimings]);
  
  

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      ) : null}
    <TouchableOpacity onPress={() => setStartTimePickerVisible(true)}>
    <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Start Time:</Text>
    <Text style={styles.inputText}>
    {startTime ? startTime.toLocaleTimeString() : 'Select start time'}
    </Text>
    </View>
    </TouchableOpacity>
    {isStartTimePickerVisible && (
    <View style={styles.dateTimePicker}>
    <DateTimePicker
      value={tempStartTime}
      onChange={handleStartTimeConfirm}
      format="HH:mm:ss"
      disableClearIcon={true}
      disableTextInput={true}
      disableCalendar={true}
      display="spinner"
      mode="time"
      disableClock={true}
    />
  </View>
)}

<TouchableOpacity onPress={() => setEndTimePickerVisible(true)}>
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>End Time:</Text>
    <Text style={styles.inputText}>
      {endTime ? endTime.toLocaleTimeString() : 'Select end time'}
    </Text>
  </View>
</TouchableOpacity>
{isEndTimePickerVisible && (
  <View style={styles.dateTimePicker}>
    <DateTimePicker
      value={tempEndTime}
      onChange={handleEndTimeConfirm}
      format="HH:mm:ss"
      disableClearIcon={true}
      disableTextInput={true}
      disableCalendar={true}
      display="spinner"
      mode="time"
      disableClock={true}
    />
  </View>
)}
    <TouchableOpacity onPress={() => setDateTimePickerVisible('date')}>
    <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Date:</Text>
    <Text style={styles.inputText}>
    {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
    </Text>
    </View>
    </TouchableOpacity>
    {isDateTimePickerVisible === 'date' && (
    <View style={styles.dateTimePicker}>
    <DateTimePicker
             value={selectedDate}
             onChange={handleDateTimeConfirm}
             format="yyyy-MM-dd"
           />
    </View>
    )}
<TouchableOpacity onPress={handleBlockDate}>
  <View style={styles.saveButton}>
    <Text style={styles.saveButtonText}>Block Date</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity onPress={handleSaveBlockedTime}>
  <View style={styles.saveButton}>
    <Text style={styles.saveButtonText}>Save</Text>
  </View>
</TouchableOpacity>

<View style={{ flex: 2 }}>
  <ScrollView>
  {blockedTimings &&
  blockedTimings.map((blockedTiming, index) => (
    <View key={index} style={styles.cardContainer}>
      <Text style={styles.cardTitle}>Date: {blockedTiming.id}</Text>
      {blockedTiming.blockedTimings[0].startTime.getHours() === 0 && 
        blockedTiming.blockedTimings[0].startTime.getMinutes() === 0 && 
        blockedTiming.blockedTimings[0].endTime.getHours() === 23 && 
        blockedTiming.blockedTimings[0].endTime.getMinutes() === 59 ? (
          <Text style={styles.cardText}>Whole day has been blocked</Text>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MaterialIcons name="timer" size={24} color="black" />
              <Text style={styles.cardText}>
                Start Time: {new Date(blockedTiming.blockedTimings[0].startTime.getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="timer" size={24} color="black" />
              <Text style={styles.cardText}>
                End Time: {new Date(blockedTiming.blockedTimings[0].endTime.getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString()}
              </Text>
            </View>
          </>
        )}
      <TouchableOpacity
        onPress={() =>
          removeBlockedTiming(
            blockedTiming.id,
            blockedTiming.blockedTimings[0].startTime,
            blockedTiming.blockedTimings[0].endTime,
          )
        }
        style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  ))}

  </ScrollView>
</View>
</View>

  );
};

export default BlockTimePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  inputText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  dateTimePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    width: '100%',
    position: 'relative', 
    zIndex: 1, 
  },
  isStartTimePickerVisible: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0, 
  },
  saveButton: {
    backgroundColor: '#333333',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
    marginVertical: 10,
    width: '100%',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  removeButtonText: {
    color: 'red',
  },
});

