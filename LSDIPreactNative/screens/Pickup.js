import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { firebase } from '../config/firebase';
import DuplicateAlert from '../components/DuplicateAlert';
import moment from 'moment';
import Btn from "../components/Button"
import colors from '../colors';

export default function Pickup({ navigation }) {
    const today = moment().format("YYYY-MM-DD");;

    const [selectedDate, setSelectedDate] = useState(null);
    const [displayMonth, setDisplayMonth] = useState(new Date().toISOString().slice(0, 7));
    const [currentMonthDays, setCurrentMonthDays] = useState([]);
    const [selectedTimesList, setSelectedTimesList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [duplicateMessage, setDuplicateMessage] = useState(null);
    const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);

    useEffect(() => {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;
        if (user) {
            const docRef = db.collection('pickup_timings').doc(user.uid);
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

    const handleMonthChange = useCallback(({ year, month }) => {
        setDisplayMonth(`${Number(year)}-${Number(month)}`);
    }, []);

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    const AvailableTimingsModal = ({ date, onClose }) => {
        const [selectedTime, setSelectedTime] = useState(null);
        const [blockedTimings, setBlockedTimings] = useState([]);
        const [availableTimings, setAvailableTimings] = useState([]);

        useEffect(() => {
            // console.log(firebase.auth().currentUser.uid);
            if (selectedDate) {
                const db = firebase.firestore();
                db.collection('blocked_timings')
                    .doc(selectedDate)
                    .get()
                    .then((doc) => {
                        if (doc.exists) {
                            console.log(doc.data());
                            const blockedTimings = doc.data().blockedTimings;
                            setBlockedTimings(blockedTimings);
                            setAvailableTimings(filterAvailableTimings(timings, blockedTimings));
                        } else {
                            setBlockedTimings([]);
                            setAvailableTimings(filterAvailableTimings(timings, []));
                        }
                    })
                    .catch((error) => {
                        console.log('Error getting blocked timings: ', error);
                    });
            }
        }, [selectedDate]);

        const timings = [
            /*'12:00am - 1:00am',
            '1:00am - 2:00am',
            '2:00am - 3:00am',
            '3:00am - 4:00am',
            '4:00am - 5:00am',
            '5:00am - 6:00am',
            '6:00am - 7:00am',
            '7:00am - 8:00am',*/
            '8:00am - 9:00am',
            '9:00am - 10:00am',
            '10:00am - 11:00am',
            '11:00am - 12:00pm',
            '12:00pm - 1:00pm',
            '1:00pm - 2:00pm',
            '2:00pm - 3:00pm',
            '3:00pm - 4:00pm',
            '4:00pm - 5:00pm',
            '5:00pm - 6:00pm',
            '6:00pm - 7:00pm',
            '7:00pm - 8:00pm',
            '8:00pm - 9:00pm',
            '9:00pm - 10:00pm',
            /*'10:00pm - 11:00pm',
            '11:00pm - 12:00am',*/
        ];

        const filterAvailableTimings = (timings, blockedTimings) => {
            return timings.filter((timing) => {
                const startTime = moment(`${selectedDate} ${timing.split(' - ')[0]}`, 'YYYY-MM-DD hh:mmA');
                const endTime = moment(`${selectedDate} ${timing.split(' - ')[1]}`, 'YYYY-MM-DD hh:mmA');
                console.log("options " + startTime + " and " + endTime);
                return !blockedTimings.some((blockedTiming) => {
                    const blockedStartTime = moment(new Date(blockedTiming.startTime['seconds'] * 1000)).add(8, 'hours');
                    const blockedEndTime = moment(new Date(blockedTiming.endTime['seconds'] * 1000)).add(8, 'hours');
                    console.log("options blocking  " + blockedStartTime + " and " + blockedEndTime);
                    return (
                        (startTime.isSameOrAfter(blockedStartTime) && startTime.isBefore(blockedEndTime)) ||
                        (endTime.isSameOrAfter(blockedStartTime) && endTime.isBefore(blockedEndTime))
                    );
                });
            });
        };

        const handleTimeSelect = (timing) => {
            setSelectedTime(timing);
        };

        const handleClose = () => {
            setSelectedTime(null);
            setSelectedDate(null);
            onClose();
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
                        console.log(selectedTime.split(' - ')[0]);
                        const selectedHour = selectedTime.split(' - ')[0];
                        const shiftTime = selectedHour.split('00')[1];
                        console.log(shiftTime);
                        const docRef = db.collection('pickup_orders').doc(selectedDate);

                        docRef.get()
                            .then((doc) => {
                                let shiftData;
                                if (doc.exists) {
                                    shiftData = doc.data();
                                } else {
                                    shiftData = {
                                        am_shift: [],
                                        pm_shift: []
                                    }
                                }

                                const usersToAdd = shiftTime === 'am' ? shiftData.am_shift.concat(user.uid) : shiftData.pm_shift.concat(user.uid);
                                console.log(shiftData);
                                console.log(usersToAdd);
                                console.log(shiftTime);
                                if (shiftTime === 'am') {
                                    shiftData.am_shift = usersToAdd;
                                } else if (shiftTime === 'pm') {
                                    shiftData.pm_shift = usersToAdd;
                                }
                                console.log(shiftData);
                                console.log(shiftData.am_shift);
                                console.log(shiftData.pm_shift);
                                return docRef.set(shiftData);
                            })
                            .then(() => {
                                console.log('pickup orders updated successfully');
                                const docRef = db.collection('pickup_timings').doc(user.uid);
                                docRef.get()
                                    .then((doc) => {
                                        let selectedTimes = [];

                                        if (doc.exists) {
                                            selectedTimes = doc.data().selected_times;
                                        }

                                        selectedTimes.push({
                                            date: selectedDate,
                                            time: selectedTime,
                                            // orders: matchingOrders,
                                        });

                                        return docRef.set({
                                            selected_times: selectedTimes,
                                        });
                                    })
                                    .then(() => {
                                        console.log('Selected time added for user with UID: ', user.uid);
                                        const newSelectedTimesList = [...selectedTimesList, { date: selectedDate, time: selectedTime },];
                                        setSelectedTimesList(newSelectedTimesList);
                                        setSelectedTime(null);
                                        setIsModalOpen(false);
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    });
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    }
                }
            }
        };

        return (
            <Modal visible={isModalOpen} animationType="fade" onRequestClose={onClose}>
                <ScrollView style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>
                                <Text style={styles.modalTitle}>Available Timings on {date}</Text>

                                {console.log(availableTimings)}
                                {availableTimings.map((timing) => {
                                    const isDisabled = selectedTime !== null && selectedTime !== timing;
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
                                })}
                                {availableTimings.length === 0
                                    && <Text style={styles.selectedDateText}>No Available Timeslot</Text>}
                                <View style={styles.modalButtons}>
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
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={handleClose}
                                    >
                                        <Text style={styles.closeButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Modal>
        );
    };

    const handleDelete = (id) => {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;

        if (user) {
            const docRef = db.collection('pickup_timings').doc(user.uid);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    const selectedTime = doc.data().selected_times.find(
                        (time) => time.date === id.date && time.time === id.time
                    );
                    const selectedTimes = doc.data().selected_times.filter(
                        (time) => time.date !== id.date || time.time !== id.time
                    );

                    return docRef.set({
                        selected_times: selectedTimes,
                    }).then(() => {
                        console.log('Selected time deleted for user with UID: ', user.uid);

                        const newSelectedTimesList = selectedTimesList.filter(
                            (item) => item.date !== id.date || item.time !== id.time
                        );

                        setSelectedTimesList(newSelectedTimesList);

                        const selectedHour = id.time.split(' - ')[0];
                        const shiftTime = selectedHour.split('00')[1];
                        console.log(selectedHour);
                        console.log(shiftTime);
                        const docRef = db.collection('pickup_orders').doc(id.date);
                        docRef.get().then((doc) => {
                            const shiftData = doc.exists ? doc.data() : { am_shift: [], pm_shift: [] };
                            if (shiftTime === 'am') {
                                shiftData.am_shift = shiftData.am_shift.filter((id) => !user.uid);
                            } else if (shiftTime === 'pm') {
                                shiftData.pm_shift = shiftData.pm_shift.filter((id) => !user.uid);
                            }
                            return docRef.set(shiftData);
                        }).catch((error) => {
                            console.error(error);
                        });
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
        }
    };

    return (
        <ScrollView>
            <View style={styles.mainContainer}>
                <View style={styles.container}>
                    <View style={styles.leftcontainer}>
                        <View style={styles.calendarcontainer}>
                            <CalendarList
                                onDayPress={handleDayPress}
                                minDate={today}
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
                                futureScrollRange={1}
                                scrollEnabled={true}
                                horizontal={true}
                                pagingEnabled={true}
                                calendarWidth={480}
                                theme={{
                                    selectedDayBackgroundColor: colors.blue800,
                                    selectedDayTextColor: colors.white,
                                    todayTextColor: colors.blue700,
                                    textDisabledColor: colors.blue100,
                                    arrowColor: colors.shadowGray,
                                    todayButtonFontWeight: "bold",
                                }}
                            />
                        </View>
                        <View style={styles.selectedDateContent}>
                            <View>
                                <Text style={styles.selectedDateText}>
                                    Selected date:
                                </Text>

                            </View>

                            {selectedDate && (
                                <View style={styles.dateContent}>
                                    <Text style={styles.dateText}>
                                        {selectedDate}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.viewTimingsButton}
                                        onPress={() => setIsModalOpen(true)}
                                    >
                                        <Text style={styles.viewTimingsButtonText}>View timings</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.detailContainer}>
                        {selectedTimesList.length > 0 && (
                            <View style={styles.selectedTimesContainer}>
                                <Text style={styles.selectedTimesTitle}>Selected Pick Up Times</Text>
                                <ScrollView style={styles.selectedTimesList}>
                                    {selectedTimesList.map((item) => (
                                        <View key={`${item.date}-${item.time}`} style={styles.selectedTimeCard}>
                                            <Text style={styles.cardTitle}><b>Date: </b>{item.date}</Text>
                                            <Text style={styles.cardText}>
                                                <b>Time: </b>{item.time}
                                            </Text>
                                            <Text style={styles.pickupText}>Pick up scheduled for this timeslot</Text>
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => handleDelete(item)}
                                            >
                                                <Text style={styles.removeButtonText}> Remove</Text>
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
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 20,
    },
    container: {
        flex: 1,
        padding: 20,
        alignContent: "space-between",
        flexDirection: "row"
    },
    leftcontainer: {
        flex: "left",
        padding: 20,
        width: "50%",
        borderRadius: 5,
        alignContent: "center",
    },
    calendarcontainer: {
        flex: "left",
        padding: 20,
        borderRadius: 5,
        alignContent: "center",
        backgroundColor: colors.white,
        borderRadius: 10
    },
    detailContainer: {
        flex: "right",
        padding: 20,
        width: "48%",
        marginLeft: "2%"
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        width: '50%',
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: colors.shadowGray,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
        borderWidth: 1,
        borderColor: colors.gray,
        shadowColor: colors.shadowGray,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
        width: "92%",
    },
    selectedTimingButton: {
        backgroundColor: colors.blue600,
        width: "92%",
        alignItems: "center",
        color: colors.white,
    },
    disabledTimingButton: {
        backgroundColor: colors.gray,
        width: "92%",
        alignItems: "center",
    },
    timingText: {
        fontSize: 16,
    },
    disabledTimingText: {
        color: colors.lightGray,
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
        backgroundColor: colors.dismissBlue,
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
        backgroundColor: colors.blue600,
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
        marginLeft: 2
    },
    selectedDateText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginRight: 10,
    },
    dateText: {
        fontSize: 25,
        marginRight: 10,
    },
    dateContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewTimingsButton: {
        backgroundColor: colors.blue600,
        shadowColor: colors.shadowGray,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginLeft: 50,
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
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 5
    },
    selectedTimeCard: {
        width: "95%",
        alignItems: 'left',
        backgroundColor: colors.white,
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginLeft: 5
    },
    selectedTimeText: {
        flex: 1,
        fontSize: 16,
    },
    removeButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginRight: 10
    },
    removeButtonText: {
        color: 'red',
        fontSize: 15
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
        height: 380,
    },
    selectedTimesList: {
        flex: 1,
    },
    pickupText: {
        fontSize: 16,
        color: '#333333',
        marginLeft: 10
    },
    cardText: {
        fontSize: 20,
        color: '#333333',
        marginBottom: 15,
        marginLeft: 10
    },
    cardTitle: {
        fontSize: 20,
        marginBottom: 4,
        marginLeft: 10
    },
    checkoutDetails: {
        fontSize: 18,
        color: '#333333',
        marginTop: 10

    }

});