import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
    UIManager,
    ScrollView,
    LayoutAnimation
} from 'react-native';
import colors from '../colors';
import moment from "moment";
import alert from '../components/Alert';
import React, { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { firebase } from '../config/firebase';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StaffSchedule() {

    const today = moment().format("YYYY-MM-DD");
    const [staffSchedule, setStaffSchedule] = useState([]);
    const [displaySchedule, setDisplaySchedule] = useState("upcoming");
    const staff_schedule = firebase.firestore().collection('staff_schedule');
    const shift_timings = firebase.firestore().collection('shift_timings');
    const outlet = firebase.firestore().collection('outlet');
    const auth1 = firebase.auth;
    const currUser = auth1().currentUser.uid;

    useEffect(() => {
        outlet
            .get()
            .then(querySnapshot => {
                const tempOutlet = [];
                querySnapshot.forEach(doc => {
                    const { outletAddress, outletEmail, outletName, outletNumber } = doc.data();
                    tempOutlet.push({
                        id: doc.id,
                        outletAddress: outletAddress,
                        outletEmail: outletEmail,
                        outletName: outletName,
                        outletNumber: outletNumber,
                    });
                });

                shift_timings
                    .get()
                    .then(querySnapshot => {
                        const tempShiftTimings = [];
                        querySnapshot.forEach(doc => {
                            const { description, hours, name, type } = doc.data();
                            tempShiftTimings.push({
                                id: doc.id,
                                description: description,
                                hours: hours,
                                name: name,
                                type: type
                            })
                        });

                        staff_schedule
                            .where("userID", "==", currUser)
                            .where("confirmed", "==", true)
                            .get()
                            .then(querySnapshot => {
                                const staffSchedule = [];
                                querySnapshot.forEach(doc => {
                                    const { completed, confirmed, date, outletID, shiftID, userID } = doc.data();
                                    staffSchedule.push({
                                        id: doc.id,
                                        completed: completed,
                                        confirmed: confirmed,
                                        date: date,
                                        outletName: tempOutlet.find(o => o.id === outletID).outletName,
                                        hours: tempShiftTimings.find(s => s.id === shiftID).hours,
                                        description: tempShiftTimings.find(s => s.id === shiftID).description,
                                    });
                                });
                                setStaffSchedule(staffSchedule);
                            });
                    });
            });
    }, [])

    const toggleExpand = (menu) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (displaySchedule === menu) {
            setDisplaySchedule(null);
        } else {
            setDisplaySchedule(menu);
        }
    };

    const completeShift = (item) => {
        return alert("Confirmation", "Are you sure you want to complete shift?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        staff_schedule.doc(item.id)
                            .update({
                                completed: true,
                            })
                            .then(() => {
                                console.log("Complete")
                                setStaffSchedule(staffSchedule.map(s => {
                                    if (s.id === item.id) {
                                        return {
                                            ...s,
                                            completed: true,
                                        };
                                    } else {
                                        return s;
                                    }
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
    }

    const renderPast = ({ item }) => (
        <TouchableOpacity
            // onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.itemContainer}>
                <View style={styles.cardBody}>
                    <Text style={styles.availabilityDate}>{item.date} </Text>
                    <Text style={styles.itemText}>{item.outletName} </Text>
                    <Text style={styles.itemText}>{item.description} </Text>
                    <Text style={styles.itemText}>Hours: {item.hours} </Text>
                </View>
            </View>

        </TouchableOpacity>
    );

    const renderUpcoming = ({ item }) => (
        <TouchableOpacity
            // onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.itemContainer}>
                <View style={styles.cardBody}>
                    <Text style={styles.availabilityDate}>{item.date} </Text>
                    <Text style={styles.itemText}>{item.outletName} </Text>
                    <Text style={styles.itemText}>{item.description} </Text>
                    <Text style={styles.itemText}>Hours: {item.hours} </Text>
                </View>
                <View style={styles.cardButtons}>
                    <FontAwesome
                        style={styles.deleteAvailability}
                        name="check"
                        color='green'
                        onPress={() => completeShift(item)}
                    />
                </View>
            </View>

        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => toggleExpand("past")}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.scheduleHeader}>Past Schedules</Text>
                    </View>
                    {displaySchedule === "past" && (
                        <FlatList
                            data={staffSchedule.filter(s => s.completed === true)}
                            keyExtractor={staff => staff.id}
                            renderItem={renderPast}
                            ListEmptyComponent={
                                <Text style={styles.noDataText}>No Data Found!</Text>
                            }
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => toggleExpand("upcoming")}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.scheduleHeader}>Upcoming Schedules</Text>
                    </View>
                    {displaySchedule === "upcoming" && (
                        <FlatList
                            data={staffSchedule.filter(s => s.completed === false)}
                            keyExtractor={staff => staff.id}
                            renderItem={renderUpcoming}
                            ListEmptyComponent={
                                <Text style={styles.noDataText}>No Data Found!</Text>
                            }
                        />
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    scheduleName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    noDataText: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    deleteAvailability: {
        fontSize: 25,
        margin: 10,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    availabilityDate: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    scheduleHeader: {
        fontSize: 20,
        fontWeight: 'bold',
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
})