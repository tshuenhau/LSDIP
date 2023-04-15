import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    Modal,
    ScrollView
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
import Toast from 'react-native-toast-message';

export default function AdminOutletScheduling({ route, navigation }) {

    const today = moment().format("YYYY-MM-DD");
    const [outletDetails, setOutletDetails] = useState(route.params.item);
    const [outletSchedule, setOutletSchedule] = useState([]);
    const [shiftDetails, setShiftDetails] = useState([]);
    const [staffDetails, setStaffDetails] = useState([]);
    const [staffAvailableDates, setStaffAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedDateSchedule, setSelectedDateSchedule] = useState([]);
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
                        console.log(staffDetails);
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
                                    .where('date', ">=", today)
                                    .get()
                                    .then(querySnapshot => {
                                        const outletSchedule = [];
                                        const markedDates = {};
                                        querySnapshot.forEach(doc => {
                                            const { date, completed, confirmed, shiftID, userID, outletID } = doc.data();
                                            console.log(doc.id);
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
                                            if (confirmed) {
                                                markedDates[date] = { marked: true };
                                            }
                                        });
                                        setStaffAvailableDates(outletSchedule.filter(s => s.confirmed != true));
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
        setMarkedDates(prevState => ({
            ...prevState,
            [selectedDate]: { ...prevState[selectedDate], selected: false },
            [date]: { ...prevState[date], selected: true, selectedColor: '#344869' }
        }));
        setSelectedDate(date);
        console.log("outlet", outletSchedule);
        setSelectedDateSchedule(outletSchedule.filter(s => s.date === date && s.confirmed === true));
        openAllocateModal();

    };

    const openAllocateModal = () => {
        const converted = new Date(selectedDate);
        const dayOfWeek = converted.getDay();
        if (dayOfWeek === 6 || dayOfWeek === 0) {
            setWeekendModalVisible(!weekendModalVisible);
        } else {
            setWeekdayModalVisible(!weekdayModalVisible);
        }
    };

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

                                const newSelectedDateSchedule = staffAvailableDates.filter(x => x.id != item.id);
                                setStaffAvailableDates(newSelectedDateSchedule);

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
            const existingAllocation = outletSchedule.find((item) =>
                item.date === selectedDate && item.userID === modalData.staffID && item.confirmed === true
            );
            if (existingAllocation) {
                alert("The selected staff has already been allocated on the selected date",
                    [
                        {
                            text: "Ok",
                            onPress: () => {
                                console.log(selectedDate);
                            }
                        }
                    ])
            } else {
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
                            confirmed: true,
                        });
                        console.log(outletSchedule);
                        setOutletSchedule(outletSchedule);

                        setMarkedDates(prevState => ({
                            ...prevState,
                            [selectedDate]: { marked: true }
                        }));

                        Toast.show({
                            type: 'success',
                            text1: 'Staff allocated',
                        });

                        setWeekdayModalVisible(false);
                        setWeekendModalVisible(false);
                    });
            }
        } else {
            alert("Confirmation", "Please select staff and shift",
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
    };

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
                                Toast.show({
                                    type: 'success',
                                    text1: 'Staff allocated',
                                });

                                setOutletSchedule(outletSchedule.map(schedule => {
                                    if (schedule.id === item.id) {
                                        return {
                                            ...schedule,
                                            confirmed: true,
                                        };
                                    } else {
                                        return { ...schedule };
                                    }
                                }));

                                const temp = staffAvailableDates.filter(s => s.id != item.id);
                                setStaffAvailableDates(temp);

                                setMarkedDates(prevState => ({
                                    ...prevState,
                                    [item.date]: { marked: true }
                                }));

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

    // only allocates records with no conflicts
    const handleAllocateAll = () => {
        const uniqueDates = new Set();
        const duplicateDates = new Set();
        for (const date in markedDates) {
            if (uniqueDates.has(date)) {
                duplicateDates.add(date);
            } else {
                uniqueDates.add(date);
            }
        }
        staffAvailableDates.forEach((item) => {
            const date = item.date;
            if (uniqueDates.has(date)) {
                duplicateDates.add(date);
            } else {
                uniqueDates.add(date);
            }
        })

        const recordsToAllocate = staffAvailableDates.filter(item => {
            const date = item.date;
            return !duplicateDates.has(date);
        })

        const db = firebase.firestore();
        const batch = db.batch();
        recordsToAllocate.forEach(record => {
            const recordRef = db.collection('staff_schedule').doc(record.id);
            batch.update(recordRef, { confirmed: true });
        })
        batch.commit()
            .then(() => {
                console.log("Batch Allocated");
                Toast.show({
                    type: 'success',
                    text1: 'Staff allocated (please manage schedule conflicts)',
                });

                recordsToAllocate.forEach(record => {
                    setOutletSchedule(outletSchedule.map(schedule => {
                        if (schedule.id === record.id) {
                            return {
                                ...schedule,
                                confirmed: true,
                            };
                        } else {
                            return { ...schedule };
                        }
                    }));

                    const temp = staffAvailableDates.filter(s => s.id != record.id);
                    setStaffAvailableDates(temp);

                    setMarkedDates(prevState => ({
                        ...prevState,
                        [record.date]: { marked: true }
                    }));
                })
            })
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.cardBody}>
                <Text style={styles.availabilityDate}>{item.date} </Text>
                <Text style={styles.itemText}>{item.userName} </Text>
                <Text style={styles.itemText}>{item.shiftName} </Text>
                <Text style={styles.itemText}>Staff Available</Text>
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

    const renderStaffModal = ({ item }) => (
        <View style={styles.staffContainer}>
            <View style={styles.cardBody}>
                <Text style={styles.itemText}>{item.userName} </Text>
                <Text style={styles.itemText}>{item.shiftName} </Text>
                <Text style={styles.itemText}>Staff Confirmed</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.topButtonContainer}>
                    <Btn onClick={() => navigation.goBack()} title="Back" style={styles.topBackButton} />
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
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10 }}>
                        <Text style={styles.timingsTitle}>Indicated Timings</Text>
                        <Btn onClick={() => handleAllocateAll()} title="Allocate All" style={styles.allocateAllButton} />
                    </View>
                    <FlatList
                        data={staffAvailableDates}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.noDatesText}>No availability indicated</Text>
                        }
                    />
                </View>

                {/* weekday modal */}
                <Modal visible={weekdayModalVisible} animationType="fade" transparent={true}>
                    <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalHeader}>{selectedDate}</Text>
                                <Text style={styles.modalTitle}>Roster</Text>
                                <FlatList
                                    data={selectedDateSchedule}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderStaffModal}

                                    ListEmptyComponent={
                                        <Text style={styles.noDatesText}>No staff allocated</Text>
                                    }
                                />
                                <Text style={styles.modalTitle}>Allocate Staff</Text>
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
                    </View>
                </Modal >

                {/* weekend modal */}
                <Modal visible={weekendModalVisible} animationType="fade" transparent={true}>
                    <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalHeader}>Date: {selectedDate}</Text>
                                <Text style={styles.modalTitle}>Roster</Text>
                                <FlatList
                                    data={selectedDateSchedule}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderStaffModal}
                                    ListEmptyComponent={
                                        <Text style={styles.noDatesText}>No staff allocated</Text>
                                    }
                                />
                                <Text style={styles.modalTitle}>Allocate Staff</Text>
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
                    </View>
                </Modal >

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: colors.white,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '2%',
        width: '95%',
        marginBottom: 20,
    },
    availabilityButton: {
        fontSize: 25,
        margin: 10,
    },
    topButtonContainer: {
        flexDirection: "row",
        alignSelf: "center",
        width: "92%",
        marginTop: 10,
    },
    allocateAllButton: {
        width: "15%",
        //backgroundColor: "#344869",
        backgroundColor: colors.blue700,
        margin: 10,
    },
    topBackButton: {
        width: "15%",
        //backgroundColor: "#344869",
        backgroundColor: colors.blue700,
        margin: 10,
    },
    topAllocateButton: {
        width: "30%",
        backgroundColor: "#344869",
        margin: 10,
        alignSelf: "flex-end"
    },
    calendarContainer: {
        marginBottom: 20,
        marginTop: 15,
        borderRadius: 25,
        backgroundColor: colors.white
    },
    outletName: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
        float: "left",
    },
    timingsContainer: {
        flex: 1,
    },
    timingsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        marginHorizontal: 10,
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
    staffContainer: {
        backgroundColor: colors.lightGray,
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
        width: '50%',
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
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: "left",
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
        width: "92%",
        borderRadius: 25,
        marginTop: 20

    }
});