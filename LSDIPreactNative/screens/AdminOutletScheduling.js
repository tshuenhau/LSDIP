import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    Modal
} from "react-native";
import React, { useState, useEffect } from "react"
import { CalendarList } from 'react-native-calendars'
import Btn from "../components/Button"
import { FontAwesome } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list';
import { firebase } from '../config/firebase';
import colors from '../colors';
import alert from '../components/Alert';
import moment from "moment";

export default function AdminOutletScheduling({ route, navigation }) {

    const today = moment().format("YYYY-MM-DD");
    const [outletDetails, setOutletDetails] = useState(route.params.item);
    const [outletSchedule, setOutletSchedule] = useState([]);
    const [shiftDetails, setShiftDetails] = useState([]);
    const [staffDetails, setStaffDetails] = useState([]);
    const [selectedDateSchedule, setSelectedDateSchedule] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [markedDates, setMarkedDates] = useState({});
    const [modalData, setModalData] = useState({});
    const [weekdayModalVisible, setWeekdayModalVisible] = useState(false);
    const [weekendModalVisible, setWeekendModalVisible] = useState(false);

    const users = firebase.firestore().collection('users');
    const shift_timings = firebase.firestore().collection('shift_timings');
    const outlet_staff = firebase.firestore().collection('outlet_staff');
    const staff_schedule = firebase.firestore().collection('staff_schedule');

    useEffect(() => {
        users
            .get()
            .then(querySnapshot => {
                const allStaff = [];
                querySnapshot.forEach(doc => {
                    const { name, number, uid } = doc.data();
                    allStaff.push({
                        value: name,
                        number: number,
                        key: uid
                    });
                });

                outlet_staff
                    .where("outletID", "==", outletDetails.id)
                    .get()
                    .then(querySnapshot => {
                        const staffDetails = []
                        querySnapshot.forEach(doc => {
                            staffDetails.push(allStaff.find(s => s.key === doc.data().staffID));
                        });
                        setStaffDetails(staffDetails);

                        shift_timings
                            .get()
                            .then(querySnapshot => {
                                const shiftDetails = [];
                                querySnapshot.forEach(doc => {
                                    const { description, hours, name, type } = doc.data();
                                    shiftDetails.push({
                                        key: doc.id,
                                        description: description,
                                        hours: hours,
                                        value: name,
                                        type: type
                                    });
                                });
                                setShiftDetails(shiftDetails);

                                // to be displayed in flatlist contains all indicated shifts for this outlet
                                staff_schedule
                                    .where("outletID", "==", outletDetails.id)
                                    .get()
                                    .then(querySnapshot => {
                                        const outletSchedule = [];
                                        const markedDates = {};
                                        querySnapshot.forEach(doc => {
                                            const { date, completed, confirmed, shiftID, userID, outletID } = doc.data();
                                            outletSchedule.push({
                                                id: doc.id,
                                                date: date,
                                                completed: completed,
                                                confirmed: confirmed,
                                                userID: userID,
                                                outletID: outletID,
                                                userName: staffDetails.find(s => s.key === userID).value,
                                                shiftID: shiftID,
                                                shiftName: shiftDetails.find(s => s.key === shiftID).value,
                                            });
                                            markedDates[date] = { marked: true };
                                        });
                                        setOutletSchedule(outletSchedule);
                                        setMarkedDates(markedDates);
                                    });
                            });
                    });
            });
    }, []);

    function handleChange(text, eventName) {
        setModalData(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const onDayPress = (day) => {
        const date = day.dateString;
        setSelectedDate(date);
        const selectedDateSchedule = outletSchedule.filter(os => os.date === date);
        setSelectedDateSchedule(selectedDateSchedule);
    };

    const openAllocateModal = () => {
        if (selectedDate) {
            const converted = new Date(selectedDate);
            const dayOfWeek = converted.getDay();
            if (dayOfWeek === 6 || dayOfWeek === 0) {
                setWeekendModalVisible(!weekendModalVisible);
            } else {
                setWeekdayModalVisible(!weekdayModalVisible);
            }
        } else {
            alert("Please select a date on the calendar first", "",
                [
                    {
                        text: "Ok",
                        onPress: () => {
                            console.log("alert closed");
                        }
                    }
                ])
        }
    }

    const deleteAvailability = (item) => {
        return alert("Confirmation", "Are you sure you want to remove indicated availability?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        staff_schedule.doc(item.id)
                            .delete()
                            .then(() => {
                                console.log("Deleted Availability")
                                const newOutletSchedule = outletSchedule.filter(x => x.id != item.id);
                                setOutletSchedule(newOutletSchedule);
                                const newSelectedDateSchedule = selectedDateSchedule.filter(x => x.id != item.id);
                                setSelectedDateSchedule(newSelectedDateSchedule);
                                if (newSelectedDateSchedule.filter(x => x.date === selectedDate).length === 0) {
                                    markedDates[selectedDate] = { marked: false };
                                    setMarkedDates(markedDates);
                                }
                            }).catch((err) => {
                                console.log(err)
                            })
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => {
                        console.log("Cancelled");
                    }
                }
            ])
    };

    const allocateStaff = () => {
        if (modalData.shiftID && modalData.staffID) {
            const newAllocation = {
                completed: false,
                confirmed: true,
                date: selectedDate,
                outletID: outletDetails.id,
                shiftID: modalData.shiftID,
                userID: modalData.staffID
            }
            staff_schedule
                .add(newAllocation)
                .then(() => {
                    outletSchedule.push({
                        date: selectedDate,
                        userName: staffDetails.find(s => s.key === modalData.staffID).value,
                        shiftName: shiftDetails.find(s => s.key === modalData.shiftID).value,
                    });

                    setOutletSchedule(outletSchedule);
                    const selectedDateSchedule = outletSchedule.filter(os => os.date === selectedDate);
                    setSelectedDateSchedule(selectedDateSchedule);
                    markedDates[selectedDate] = { marked: true };
                    setMarkedDates(markedDates);

                    setWeekdayModalVisible(false);
                    setWeekendModalVisible(false);
                });
        } else {
            alert("Confirmation", "Please select outlet and shift",
                [
                    {
                        text: "Ok",
                        onPress: () => {
                            console.log(modalData.shiftID);
                            console.log(modalData.outletID);
                        }
                    }
                ])
        }
    }

    const confirmStaffSchedule = (item) => {
        return alert("Confirmation", "Are you sure you want allocate schedule?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        staff_schedule.doc(item.id)
                            .update({
                                confirmed: true,
                            })
                            .then(() => {
                                console.log("Confirmed")
                                //needs some visual feedback
                            }).catch((err) => {
                                console.log(err)
                            })
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => {
                        console.log("Cancelled");
                    }
                }
            ])
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.cardBody}>
                <Text style={styles.availabilityDate}>{item.date} </Text>
                <Text style={styles.itemText}>{item.userName} </Text>
                <Text style={styles.itemText}>{item.shiftName} </Text>
            </View>
            <View style={styles.cardButtons}>
                <FontAwesome
                    style={styles.availabilityButton}
                    name="check"
                    color='green'
                    onPress={() => confirmStaffSchedule(item)}
                />
                <FontAwesome
                    style={styles.availabilityButton}
                    name="remove"
                    color='red'
                    onPress={() => deleteAvailability(item)}
                />
            </View>
        </View>
    );

    return (
        <View>
            <View style={styles.topButtonContainer}>
                <Btn onClick={() => navigation.goBack()} title="Back" style={styles.topBackButton} />
                <Btn onClick={openAllocateModal} title="Allocate Staff" style={styles.topAllocateButton} />
            </View>
            <View style={styles.calendarContainer}>
                <Text style={styles.outletName}>{outletDetails.outletName} Schedule</Text>
                <CalendarList
                    onDayPress={onDayPress}
                    markedDates={markedDates}
                    minDate={today}
                    markingType="simple"
                    pastScrollRange={0}
                    futureScrollRange={3}
                    scrollEnabled={true}
                    horizontal={true}
                    pagingEnabled={true}
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
                <Text style={styles.timingsTitle}>Indicated Timings</Text>
                <FlatList
                    data={selectedDateSchedule}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.noDatesText}>No availability indicated</Text>
                    }
                />
            </View>

            {/* weekday modal */}
            <Modal visible={weekdayModalVisible} animationType="slide" transparent={true}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHeader}>Allocate Staff</Text>
                        <Text style={styles.modalTitle}>{selectedDate}</Text>
                        <View style={styles.modalDropdown}>
                            <SelectList
                                data={staffDetails}
                                setSelected={(val) => handleChange(val, "staffID")}
                                save="key"
                                search={false}
                            />
                        </View>
                        <View style={styles.modalDropdown}>
                            <SelectList
                                data={shiftDetails.filter(s => s.type === "weekday")}
                                setSelected={(val) => handleChange(val, "shiftID")}
                                save="key"
                                search={false}
                            />
                        </View>
                        <View style={styles.modalButtons}>
                            <Btn onClick={() => allocateStaff()} title="Allocate" style={{ width: "48%" }} />
                            <Btn onClick={() => setWeekdayModalVisible(!weekdayModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                        </View>
                    </View>
                </View>
            </Modal >

            {/* weekend modal */}
            <Modal visible={weekendModalVisible} animationType="slide" transparent={true}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHeader}>Allocate Staff</Text>
                        <Text style={styles.modalTitle}>{selectedDate}</Text>
                        <View style={styles.modalDropdown}>
                            <SelectList
                                data={staffDetails}
                                setSelected={(val) => handleChange(val, "staffID")}
                                save="key"
                                search={false}
                            />
                        </View>
                        <View style={styles.modalDropdown}>
                            <SelectList
                                data={shiftDetails.filter(s => s.type === "weekend")}
                                setSelected={(val) => handleChange(val, "shiftID")}
                                save="key"
                                search={false}
                            />
                        </View>
                        <View style={styles.modalButtons}>
                            <Btn onClick={() => allocateStaff()} title="Allocate" style={{ width: "48%" }} />
                            <Btn onClick={() => setWeekendModalVisible(!weekendModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                        </View>
                    </View>
                </View>
            </Modal >

        </View>
    )
}

const styles = StyleSheet.create({
    availabilityButton: {
        fontSize: 25,
        margin: 10,
    },
    topButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "92%",
    },
    topBackButton: {
        width: "23%",
        backgroundColor: "#344869",
        margin: 10,
    },
    topAllocateButton: {
        width: "40%",
        backgroundColor: "#344869",
        margin: 10,
    },
    calendarContainer: {
        marginBottom: 20,
    },
    outletName: {
        fontSize: 20,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    timingsContainer: {
        flex: 1,
    },
    timingsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    noDatesText: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    itemContainer: {
        backgroundColor: colors.lightGray,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        paddingVertical: 8,
        paddingRight: 20,
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
    },
    cardBody: {
        padding: 16,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    availabilityDate: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    indicateButton: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    indicateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: 'grey',
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
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
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "92%"
    },
    modalHeader: {
        fontSize: 34,
        fontWeight: "800",
        marginBottom: 20
    },
    modalDropdown: {
        marginBottom: 20,
    }
});