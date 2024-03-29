import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { firebase } from '../config/firebase';
import DuplicateAlert from '../components/DuplicateAlert';
import moment from 'moment';
import Btn from "../components/Button"
import colors from '../colors';
import axios from 'axios';
import * as geolib from 'geolib';

export default function Pickup({ navigation }) {
    const today = moment().format("YYYY-MM-DD");;
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(null);
    const [displayMonth, setDisplayMonth] = useState(new Date().toISOString().slice(0, 7));
    const [currentMonthDays, setCurrentMonthDays] = useState([]);
    const [selectedTimesList, setSelectedTimesList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [duplicateMessage, setDuplicateMessage] = useState(null);
    const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
    const [pickupFees, setPickupFees] = useState(0);

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

    useEffect(() => {
        const calculateDeliveryFee = () => {
            return new Promise((resolve, reject) => {
                let address = "";
                const db = firebase.firestore();
                const user = firebase.auth().currentUser;
                db.collection('users')
                    .where('email', '==', user.email)
                    .get()
                    .then(querySnapshot => {
                        if (querySnapshot.empty) {
                            console.log('No matching documents.');
                            reject();
                        } else {
                            querySnapshot.forEach(doc => {
                                // Retrieve the user's address from the document
                                address = doc.data().address;
                                console.log(`User's address: ${address}`);
                                const location1 = address;
                                const location2 = '10 Paya Lebar Rd Singapore 409057';
                                const apiKey = 'AIzaSyDpuo4PKoIf6vYm6BbCa77-kQN_zq7pDoA';

                                // Make API request for location 1
                                const apiUrl1 = `https://maps.googleapis.com/maps/api/geocode/json?address=${location1}&key=${apiKey}`;
                                axios.get(apiUrl1)
                                    .then(response => {
                                        if (response.data.results.length === 0) {
                                            console.error('No results found for location:', location1);
                                            reject();
                                        }
                                        const result = response.data.results[0];
                                        const coords1 = {
                                            latitude: result.geometry.location.lat,
                                            longitude: result.geometry.location.lng
                                        };

                                        // Make API request for location 2
                                        const apiUrl2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${location2}&key=${apiKey}`;
                                        axios.get(apiUrl2)
                                            .then(response => {
                                                if (response.data.results.length === 0) {
                                                    console.error('No results found for location:', location2);
                                                    reject();
                                                }
                                                const result = response.data.results[0];
                                                const coords2 = {
                                                    latitude: result.geometry.location.lat,
                                                    longitude: result.geometry.location.lng
                                                };

                                                // Calculate the distance between the two sets of coordinates
                                                const distanceInMeters = geolib.getDistance(coords1, coords2);
                                                console.log(`Distance between ${location1} and ${location2}: ${distanceInMeters} meters`);
                                                const deliveryFee = distanceInMeters / 500;
                                                console.log(deliveryFee);
                                                console.log("delivery fee is here!");
                                                resolve(deliveryFee);
                                            }).catch(error => {
                                                console.error(error);
                                                reject();
                                            });
                                    }).catch(error => {
                                        console.error(error);
                                        reject();
                                    });
                            })
                        }
                    }).catch(error => {
                        console.error(error);
                        reject();
                    });
            });
        }

        calculateDeliveryFee().then(deliveryFee => {
            setPickupFees(deliveryFee);
            setLoading(false);
        }).catch(error => {
            console.error(error);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        console.log('Delivery fees updated:', pickupFees);
    }, [pickupFees]);

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
        ];

        const filterAvailableTimings = (timings, blockedTimings) => {
            return timings.filter((timing) => {
                const startTime = moment(`${selectedDate} ${timing.split(' - ')[0]}`, 'YYYY-MM-DD hh:mmA');
                const endTime = moment(`${selectedDate} ${timing.split(' - ')[1]}`, 'YYYY-MM-DD hh:mmA');
                // console.log("options " + startTime + " and " + endTime);
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

        const handleConfirm = async () => {
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
                    db.collection('users').doc(firebase.auth().currentUser.uid)
                        .get()
                        .then(doc => {
                            const user = { ...doc.data(), id: doc.id }

                            const docRef = db.collection('pickup_timings').doc(user.id);
                            docRef
                                .get()
                                .then((doc) => {
                                    let selectedTimes = [];
                                    if (doc.exists) {
                                        selectedTimes = doc.data().selected_times;
                                    } else {
                                        db.collection('pickup_timings').doc(user.id).set({
                                            selected_times: selectedTimes
                                        }).then(() => {
                                            console.log('Selected times update successfully');
                                        }).catch((error) => {
                                            console.log('Error updating selected times: ', error);
                                        });
                                    }

                                    const selectedTimeObj = {
                                        time: selectedTime,
                                        address: user.address,
                                        name: user.name,
                                        number: user.number,
                                    };

                                    const selectedDateDocRef = db.collection('pickup_orders').doc(selectedDate);
                                    selectedDateDocRef.get().then((doc) => {
                                        if (doc.exists) {
                                            const updatedSelectedTimes = [...doc.data().selected_times, selectedTimeObj];
                                            selectedDateDocRef.update({ selected_times: updatedSelectedTimes })
                                                .then(() => {
                                                    console.log(`Selected times updated for ${selectedDate}`);
                                                }).catch((error) => {
                                                    console.error(`Error updating selected times for ${selectedDate}:`, error);
                                                });
                                        } else {
                                            selectedDateDocRef.set({
                                                date: selectedDate,
                                                selected_times: [selectedTimeObj],
                                            }).then(() => {
                                                console.log(`New document created for ${selectedDate}`);
                                            }).catch((error) => {
                                                console.error(`Error creating new document for ${selectedDate}:`, error);
                                            });
                                        }
                                    })
                                })

                            db.collection('pickup_timings').doc(user.uid)
                                .get()
                                .then((doc) => {
                                    let selectedTimes = [];

                                    if (doc.exists) {
                                        selectedTimes = doc.data().selected_times;
                                    }

                                    selectedTimes.push({
                                        date: selectedDate,
                                        time: selectedTime,
                                        pickupFee: pickupFees,
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
                }
            }
        };

        const handleTimeSelect = (timing) => {
            setSelectedTime(timing);
        };

        const handleClose = () => {
            setSelectedTime(null);
            setSelectedDate(null);
            onClose();
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
                        },
                            // setTimeout(() => {
                            //     window.location.reload();
                            // }, 2000)
                        ).catch((error) => {
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
    if (!loading) {
        return (
            <ScrollView>
                <View style={styles.mainContainer}>
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
                                calendarWidth={290}
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
                                </View>
                            )}
                        </View>
                        {selectedDate && (
                            <View>
                                <TouchableOpacity
                                    style={styles.viewTimingsButton}
                                    onPress={() => setIsModalOpen(true)}
                                >
                                    <Text style={styles.viewTimingsButtonText}>View timings</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
                                            <Text style={styles.pickupText}>Pick up Cost: ${pickupFees.toFixed(1)}0</Text>
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
            </ScrollView>
        )
    }
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
        width: "100%",
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
        padding: 20,
        width: "100%",
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
        paddingVertical: 15,
        paddingHorizontal: "33%",
        marginLeft: 2,
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
        marginLeft: 5,
        borderColor: colors.borderColor,
        borderWidth: 2
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