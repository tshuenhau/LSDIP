import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    Modal
} from "react-native";
import React, { useState, useEffect } from "react";
import { SelectList } from 'react-native-dropdown-select-list';
import alert from '../components/Alert';
import { Calendar } from 'react-native-calendars';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { firebase, auth } from '../config/firebase';
import moment from "moment";

export default function StaffAvailability() {

    const today = moment().format("YYYY-MM-DD");
    const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [selectedAvailability, setSelectedAvailability] = useState("");
    const [shiftTimings, setShiftTimings] = useState([]);
    const [indicatedAvailabilities, setIndicatedAvailabilities] = useState([]);
    const auth1 = firebase.auth;
    const currUser = auth1().currentUser.uid;

    const staff_indicated_availability = firebase.firestore().collection('staff_indicated_availability');
    const shift_timings = firebase.firestore().collection('shift_timings');

    useEffect(() => {
        shift_timings
            .get()
            .then(querySnapshot => {
                const shiftTimings = [];
                querySnapshot.forEach(doc => {
                    const { name, hours, description, type } = doc.data();
                    shiftTimings.push({
                        key: doc.id,
                        value: name,
                        hours: hours,
                        description: description,
                        type: type
                    });
                });
                setShiftTimings(shiftTimings);

                staff_indicated_availability
                    .where("userID", "==", currUser)
                    .get()
                    .then(querySnapshot => {
                        const indicatedAvailabilities = [];
                        querySnapshot.forEach(doc => {
                            const { date, shiftID, userID } = doc.data();
                            const curShift = shiftTimings.find(s => s.key === shiftID);
                            indicatedAvailabilities.push({
                                id: doc.id,
                                date: date,
                                shiftID: shiftID,
                                name: curShift.value,
                                hours: curShift.hours,
                                description: curShift.description,
                                userID: userID
                            });
                        });
                        setIndicatedAvailabilities(indicatedAvailabilities);
                    });

            });

    }, [])

    const onDayPress = (day) => {
        const date = day.dateString;
        setAvailabilityModalVisible(!availabilityModalVisible);
        setSelectedDate(date);
    };

    // might need to add outlet id
    const indicateAvailability = () => {
        const newAvailability = {
            shiftID: selectedAvailability,
            userID: currUser,
            date: selectedDate
        }
        staff_indicated_availability
            .add(newAvailability)
            .then(() => {
                setAvailabilityModalVisible(!availabilityModalVisible);
                console.log("Success");
            }).catch((err) => {
                console.log(err);
            })
    }

    const deleteAvailability = (item) => {
        console.log(item);
        return alert("Confirmation", "Are you sure you want to remove indicated availability?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        staff_indicated_availability.doc(item.id)
                            .delete()
                            .then(() => {
                                console.log("Deleted Availability")
                                const temp = indicatedAvailabilities.filter(x => x.id != item.id)
                                setIndicatedAvailabilities(temp);
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
        // <TouchableOpacity style={styles.card}>
        <View style={styles.itemContainer}>
            <View style={styles.cardBody}>
                <Text style={styles.availabilityDate}>{item.date} </Text>
                <Text style={styles.itemText}>{item.description} </Text>
                <Text style={styles.itemText}>Hours: {item.hours} </Text>
            </View>
            <View style={styles.cardButtons}>
                <FontAwesome
                    style={styles.deleteAvailability}
                    name="remove"
                    color='red'
                    onPress={() => deleteAvailability(item)}
                />
            </View>
        </View>
        // </TouchableOpacity >
    );

    return (
        <View>
            <View style={styles.container}>
                <View style={styles.calendarContainer}>
                    <Calendar
                        onDayPress={onDayPress}
                        // markedDates={markedDates}
                        minDate={today}
                        markingType="simple"
                    />
                </View>
            </View>

            <Modal visible={availabilityModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedDate}</Text>

                        <SelectList
                            data={shiftTimings}
                            setSelected={(val) => setSelectedAvailability(val)}
                            save="key"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.indicateButton} onPress={() => indicateAvailability()}>
                                <Text style={styles.indicateButtonText}>Indicate</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setAvailabilityModalVisible(!availabilityModalVisible)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >

            <View style={styles.timingsContainer}>
                <Text style={styles.timingsTitle}>Indicated Timings</Text>
                <FlatList
                    data={indicatedAvailabilities}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.noDatesText}>No available timings</Text>
                    }
                />
            </View>

        </View >
    )
}

const styles = StyleSheet.create({
    availabilityDate: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    cardBody: {
        padding: 16,
    },
    // card: {
    //     backgroundColor: '#fff',

    // },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    deleteAvailability: {
        fontSize: 25,
        margin: 10,
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
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 5,
        minWidth: 300,
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
});