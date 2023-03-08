import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
              console.log(timing);
              console.log(timing.startTime);
              console.log(timing.endTime);
              console.log(timing.startTime.toDate());
              console.log(timing.endTime.toDate());
              return {
                startTime: timing.startTime.toDate(),
                endTime: timing.endTime.toDate(),
              };
            }),
          };
        })
      );
    });
  }, []);

  const handleDateTimeConfirm = useCallback((date) => {
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

  const handleSaveBlockedTime = useCallback(() => {
    if (tempEndTime <= tempStartTime) {
      Alert.alert('End time must be after start time');
      return;
    }
  
    const startTimestamp = firebase.firestore.Timestamp.fromDate(tempStartTime);
    const endTimestamp = firebase.firestore.Timestamp.fromDate(tempEndTime);
  
    db.collection('blocked_timings')
      .doc(selectedDate.toISOString().slice(0, 10))
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
        .update({
          blockedTimings: firebase.firestore.FieldValue.arrayRemove(blockedTiming.blockedTimings[0]),
        });
    }
  }, [blockedTimings]);
  

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity onPress={() => setDateTimePickerVisible('date')}>
        <Text>{selectedDate ? selectedDate.toISOString().slice(0, 10) : 'Select a date'}</Text>
      </TouchableOpacity>
      {isDateTimePickerVisible === 'date' && (
        <DateTimePicker
          value={selectedDate}
          onChange={handleDateTimeConfirm}
          format="yyyy-MM-dd"
        />
      )}
      <TouchableOpacity onPress={() => setStartTimePickerVisible(true)}>
        <Text>{startTime ? startTime.toLocaleTimeString() : 'Select start time'}</Text>
      </TouchableOpacity>
      {isStartTimePickerVisible && (
        <DateTimePicker
          value={tempStartTime}
          onChange={handleStartTimeConfirm}
          format="HH:mm:ss"
          disableClearIcon={true}
          disableTextInput={true}
        />
      )}

      <TouchableOpacity onPress={() => setEndTimePickerVisible(true)}>
        <Text>{endTime ? endTime.toLocaleTimeString() : 'Select end time'}</Text>
      </TouchableOpacity>
      {isEndTimePickerVisible && (
        <DateTimePicker
          value={tempEndTime}
          onChange={handleEndTimeConfirm}
          format="HH:mm:ss"
          disableClearIcon={true}
          disableTextInput={true}
        />
      )}

      <TouchableOpacity onPress={handleSaveBlockedTime}>
        <Text>Save</Text>
      </TouchableOpacity>

      <View style={{ flex: 2 }}>
  <ScrollView>
    {blockedTimings &&
      blockedTimings.map((blockedTiming, index) => (
        <View
          key={index}
          style={{
            backgroundColor: '#fff',
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
            margin: 10,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', marginRight: 8 }}>Date:</Text>
            <Text>{blockedTiming.id}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <MaterialIcons name='timer' size={24} color="black" />  
            <Text style={{ fontWeight: 'bold', marginRight: 8 }}>Start Time:</Text>
            <Text>{blockedTiming.blockedTimings[0].startTime.toLocaleTimeString()}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name='timer' size={24} color="black" />  
            <Text style={{ fontWeight: 'bold', marginRight: 8 }}>End Time:</Text>
            <Text>{blockedTiming.blockedTimings[0].endTime.toLocaleTimeString()}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              removeBlockedTiming(
                blockedTiming.id,
                blockedTiming.blockedTimings[0].startTime,
                blockedTiming.blockedTimings[0].endTime,
              )
            }

            style={{ alignSelf: 'flex-end', marginTop: 8 }}>
            <Text style={{ color: 'red' }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
  </ScrollView>
</View>


    </View>
  );
};

export default BlockTimePage;

