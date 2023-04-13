import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import DateTimePicker from 'react-datetime-picker';
import { firebase } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../colors';

const db = firebase.firestore();
const user = firebase.auth().currentUser;

const BlockTimePage = () => {
  const [selectedDate, setSelectedDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [isDateTimePickerVisible, setDateTimePickerVisible] = useState('date');
  const [tempStartTime, setTempStartTime] = useState(startTime);
  const [tempEndTime, setTempEndTime] = useState(endTime);
  const [blockedTimings, setBlockedTimings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedButtonFilter, setSelectedButtonFilter] = useState("period");

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
                startTime: new Date(timing.startTime.toDate().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })),
                endTime: new Date(timing.endTime.toDate().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })),
              };
            }),
          };

        })
      );
    });
  }, []);

  const handleDateConfirm = useCallback((date) => {
    console.log(date);
    setSelectedDate(date);
  }, []);

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

    const startTimestamp = firebase.firestore.Timestamp.fromDate(new Date(startDateTime.toLocaleString('en-US', { timeZone: 'Asia/Singapore' })));
    const endTimestamp = firebase.firestore.Timestamp.fromDate(new Date(endDateTime.toLocaleString('en-US', { timeZone: 'Asia/Singapore' })));

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

    const startTimestamp = firebase.firestore.Timestamp.fromDate(new Date(startDateTime.toLocaleString('en-US', { timeZone: 'Asia/Singapore' })));
    const endTimestamp = firebase.firestore.Timestamp.fromDate(new Date(endDateTime.toLocaleString('en-US', { timeZone: 'Asia/Singapore' })));

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
      <View style={styles.inputFlexContainer}>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style=
            {selectedButtonFilter === "period"
              ? styles.blockTypeSelectedButton
              : styles.blockTypeUnselectedButton
            } onPress={() => setSelectedButtonFilter("period")}>
            <Text style={styles.inputLabel}>Block Period</Text>
          </TouchableOpacity>
          <TouchableOpacity style=
            {selectedButtonFilter === "date"
              ? styles.blockTypeSelectedButton
              : styles.blockTypeUnselectedButton
            } onPress={() => setSelectedButtonFilter("date")}>
            <Text style={styles.inputLabel}>Block Date</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: colors.white, padding: 20 }}>
          {errorMessage ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          ) : null}
          {selectedButtonFilter == "period" &&
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Start Time:</Text>
                <Text style={styles.inputText}>
                  {startTime ? startTime.toLocaleTimeString() : 'Select start time'}
                </Text>
              </View>

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

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>End Time:</Text>
                <Text style={styles.inputText}>
                  {endTime ? endTime.toLocaleTimeString() : 'Select end time'}
                </Text>
              </View>

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
            </View>
          }

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date:</Text>
            <Text style={styles.inputText}>
              {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
            </Text>
          </View>
          <View style={styles.dateTimePicker}>
            <DateTimePicker
              value={selectedDate}
              minDate={new Date()}
              onChange={handleDateConfirm}
              format="yyyy-MM-dd"
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {selectedButtonFilter === "date"
              ?
              <TouchableOpacity onPress={handleBlockDate} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Block Date</Text>
              </TouchableOpacity>
              :
              <TouchableOpacity onPress={handleSaveBlockedTime} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Block Period</Text>
              </TouchableOpacity>
            }
          </View>
        </View>

      </View>

      <View style={styles.cardFlexContainer}>
        <ScrollView style={{ margin: 30 }}>
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
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: '#f5f5f5',
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: '4%',
    width: '95%',
    marginBottom: 20,
  },
  blockTypeSelectedButton: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  blockTypeUnselectedButton: {
    backgroundColor: colors.violet400,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inputFlexContainer: {
    flex: 1,
    marginRight: 10,
    marginVertical: 10,
  },
  inputContainer: {
    padding: 10,
    borderRadius: 5,
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
  errorMessageContainer: {
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  errorMessage: {
    color: colors.red,
    fontStyle: 'italic',
    fontSize: 16,
  },
  dateTimePicker: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.blue700,
    padding: 10,
    borderRadius: 25,
    width: '40%',
    margin: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardFlexContainer: {
    flex: 1,
    marginLeft: 10
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    /*shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,*/
    elevation: 5,
    padding: 16,
    marginVertical: 10,
    width: '100%',
    borderColor: colors.borderColor,
    borderWidth: 2
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

