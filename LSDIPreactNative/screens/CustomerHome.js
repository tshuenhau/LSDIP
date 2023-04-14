import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import CustomerAvailableOrderList from "../components/CustomerAvailableOrderList";
import colors from '../colors';
import alert from '../components/Alert'
import { ProgressBar } from "react-milestone";

export default function CustomerHome({ user, navigation }) {

    const [orderList, setOrderList] = useState([]);
    const [pointCash, setPointCash] = useState(0);
    const [selectedTimesList, setSelectedTimesList] = useState([]);
    const [orderPickupDisplay, setOrderPickupDisplay] = useState([]);
    const [selectedPickupTimesList, setSelectedPickupTimesList] = useState([]);
    const [membershipTiers, setMembershipTiers] = useState([]);
    const [customerMilestone, setCustomerMilestone] = useState(0);
    const orders = firebase.firestore().collection('orders');
    const crm = firebase.firestore().collection('crm');
    const userTimings = firebase.firestore().collection('user_timings');
    const pickupTimings = firebase.firestore().collection('pickup_timings');
    const membershipTier = firebase.firestore().collection('membership_tier');

    useEffect(() => {
        if (user) {
            orders
                .where("customerNumber", "==", user.number)
                .get()
                .then(querySnapshot => {
                    const orderList = [];
                    console.log(user);
                    querySnapshot.forEach((doc) => {
                        const { customerName, customerNumber, date, orderItems, outletId, orderStatus, totalPrice, invoiceNumber } = doc.data();
                        orderList.push({
                            id: doc.id,
                            customerName,
                            customerNumber,
                            date,
                            orderItems,
                            outletId,
                            orderStatus,
                            totalPrice,
                            invoiceNumber,
                        });
                    });

                    userTimings
                        .doc(user.uid)
                        .onSnapshot((doc) => {
                            if (doc.exists) {
                                const selectedTimes = doc.data().selected_times || [];
                                console.log(selectedTimes);
                                selectedTimes.forEach((ST => {
                                    const orderInvoices = [];
                                    ST.orders.forEach(order => {
                                        orderInvoices.push(orderList.find(OL => OL.id === order).invoiceNumber)
                                    })
                                    ST.orderInvoices = orderInvoices;
                                }))

                                console.log(selectedTimes);
                                // console.log(orderInvoices);
                                setSelectedTimesList(selectedTimes);
                            } else {
                                setSelectedTimesList([]);
                            }
                        });

                    setOrderList(orderList);
                    // console.log(orderList);
                }).then(console.log(orderList));

            crm
                .doc("point_cash")
                .get()
                .then(querySnapshot => {
                    setPointCash(querySnapshot.data().value);
                })

            membershipTier
                .get()
                .then(querySnapshot => {
                    const membershipTiers = [];
                    querySnapshot.forEach((doc) => {
                        membershipTiers.push({ id: doc.id, ...doc.data() });
                    })
                    const sortedTiers = membershipTiers.sort((a, b) => a.expenditure - b.expenditure);
                    const userExpenditure = user.expenditure;
                    setCustomerMilestone((Number(userExpenditure) / Number(sortedTiers[sortedTiers.length - 1].expenditure)) * 100);
                    setMembershipTiers(sortedTiers);
                })

            pickupTimings
                .doc(user.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const selectedPickupTimesList = doc.data().selected_times || [];
                        console.log(selectedPickupTimesList);
                        setSelectedPickupTimesList(selectedPickupTimesList);
                    } else {
                        setSelectedPickupTimesList({});
                    }
                });
        }
    }, [user]);

    useEffect(() => {
        if (window.location.href.includes("localhost:19006/success")) {
            console.log("called");
            const curLink = window.location.href.split("/");
            console.log(curLink);
            const deliveryFee = curLink[4];
            const selectedDate = curLink[5];
            const selectedStartTime = curLink[6];
            const selectedEndTime = curLink[7];
            const selectedTime = selectedStartTime + " - " + selectedEndTime;
            console.log(selectedTime);
            orders
                .where("customerNumber", "==", user.number)
                .where("orderStatus", "==", "Back from Wash")
                .get()
                .then(querySnapshot => {
                    const matchingOrders = [];
                    querySnapshot.forEach((doc) => {
                        matchingOrders.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(matchingOrders);
                    const db = firebase.firestore();
                    const user = firebase.auth().currentUser;
                    console.log(user);
                    const selectedOrders = matchingOrders.map((order) => order.id);
                    console.log(selectedOrders);
                    console.log(selectedTime);
                    console.log(selectedDate);
                    if (user) {

                        const docRef = db.collection('user_timings').doc(user.uid);
                        docRef.get().then((doc) => {
                            let selectedTimes = [];

                            if (doc.exists) {
                                selectedTimes = doc.data().selected_times;
                            } else {
                                // Create a new document with the user's uid and the initial data
                                db.collection('user_timings').doc(user.uid).set({
                                    selected_times: []
                                });
                                //selectedTimes = doc.data().selected_times;
                                selectedTimes = [];
                            }
                            selectedTimes.push({
                                date: selectedDate,
                                time: selectedTime,
                                orders: selectedOrders,
                                deliveryFee: deliveryFee,
                            });
                            console.log(selectedTimes);
                            db.collection('user_timings').doc(user.uid).set({
                                selected_times: selectedTimes
                            })
                                .then(() => {
                                    console.log('Selected times updated successfully');
                                })
                                .catch((error) => {
                                    console.error('Error updating selected times:', error);
                                });
                            const batch = db.batch();
                            matchingOrders.forEach((order) => {
                                const orderRef = db.collection('orders').doc(order.id);

                                // Convert the date string to a Date object
                                const date = new Date(selectedDate);
                                // Extract the hours and minutes from the time string
                                const [hours, minutes] = selectedTime.split(" ")[0].split(':');
                                const meridian = minutes.slice(2);
                                const adjustedHours = meridian === 'pm' ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
                                // Set the hours and minutes on the date object
                                date.setHours(adjustedHours);
                                // Create a Firestore Timestamp object
                                const timestamp = firebase.firestore.Timestamp.fromDate(date);

                                batch.update(orderRef, { orderStatus: 'Pending Delivery', deliveryDate: timestamp });
                            });
                            batch.commit()
                                .then(() => {
                                    console.log('Orders updated successfully');
                                })
                                .catch((error) => {
                                    console.error('Error updating orders:', error);
                                });
                        }).then(() => {
                            const selectedTimeObj = {
                                time: selectedTime,
                                orders: selectedOrders,
                            };

                            const selectedDateDocRef = db.collection('shift_orders').doc(selectedDate);
                            selectedDateDocRef.get().then((doc) => {
                                if (doc.exists) {
                                    // If the document already exists, update its data
                                    const updatedSelectedTimes = [...doc.data().selected_times, selectedTimeObj];
                                    selectedDateDocRef.update({ selected_times: updatedSelectedTimes })
                                        .then(() => {
                                            console.log(`Selected times updated for ${selectedDate}`);
                                        })
                                        .catch((error) => {
                                            console.error(`Error updating selected times for ${selectedDate}:`, error);
                                        });
                                } else {
                                    // If the document doesn't exist, create a new one with the initial data
                                    selectedDateDocRef.set({
                                        date: selectedDate,
                                        selected_times: [selectedTimeObj],
                                    })
                                        .then(() => {
                                            console.log(`New document created for ${selectedDate}`);
                                        })
                                        .catch((error) => {
                                            console.error(`Error creating new document for ${selectedDate}:`, error);
                                        });
                                }
                            })

                            setTimeout(() => {
                                window.location.href = window.location.origin;
                            }, 1000);

                        })
                    }

                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [])


    const handleDeliveryDelete = (id) => {
        return alert(
            "Confirmation",
            "Are you sure you want to delete this delivery?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        deleteDelivery(id);
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancelled`"),
                    style: "cancel"
                }
            ]
        );
    };

    const handlePickupDelete = (id) => {
        return alert(
            "Confirmation",
            "Are you sure you want to delete this pickup?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        deletePickup(id);
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancelled`"),
                    style: "cancel"
                }
            ]
        );
    }

    const deletePickup = (id) => {
        const user = firebase.auth().currentUser;
        if (user) {
            pickupTimings
                .doc(user.uid)
                .get().then((doc) => {
                    if (doc.exists) {
                        const selectedTimes = doc.data().selected_times.filter(
                            (time) => time.date !== id.date || time.time !== id.time
                        );
                        return pickupTimings
                            .doc(user.uid).set({
                                selected_times: selectedTimes,
                            }).then(() => {
                                console.log('Selected time deleted for user with UID: ', user.uid);

                                const newSelectedTimesList = selectedTimesList.filter(
                                    (item) => item.date !== id.date || item.time !== id.time
                                );
                                setSelectedPickupTimesList(newSelectedTimesList);
                            });
                    }
                }).then(() => {
                    console.log('Pickup removed successfully');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000)
                }).catch((error) => {
                    console.error(error);
                });
        }
    }

    const deleteDelivery = (id) => {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;

        if (user) {
            const userDocRef = db.collection('user_timings').doc(user.uid);
            const shiftOrdersDocRef = db.collection('shift_orders').doc(id.date);

            userDocRef.get().then((doc) => {
                if (doc.exists) {
                    const selectedTime = doc.data().selected_times.find(
                        (time) => time.date === id.date && time.time === id.time
                    );
                    const selectedTimes = doc.data().selected_times.filter(
                        (time) => time.date !== id.date || time.time !== id.time
                    );

                    return userDocRef.set({
                        selected_times: selectedTimes,
                    }).then(() => {
                        console.log('Selected time deleted for user with UID: ', user.uid);

                        const batch = db.batch();

                        selectedTime.orders.forEach((order) => {
                            const orderRef = db.collection('orders').doc(order);
                            batch.update(orderRef, { orderStatus: 'Back from Wash' });
                        });

                        batch.commit().then(() => {
                            console.log('Orders updated successfully');

                            // Delete the order and timing from the shift_orders collection
                            shiftOrdersDocRef.get().then((doc) => {
                                if (doc.exists) {
                                    const updatedSelectedTimes = doc.data().selected_times.filter(
                                        (time) => time.time !== id.time || time.orders.join() !== selectedTime.orders.join()
                                    );

                                    return shiftOrdersDocRef.update({
                                        selected_times: updatedSelectedTimes,
                                    }).then(() => {
                                        console.log(`Selected times updated for ${id.date}`);
                                    }).catch((error) => {
                                        console.error(`Error updating selected times for ${id.date}:`, error);
                                    });
                                }
                            }).catch((error) => {
                                console.error(error);
                            });
                        }).catch((error) => {
                            console.error('Error updating orders:', error);
                        });
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
            navigation.navigate('Home');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    return (
        <View>
            <View style={styles.customerPointContainer}>
                <View>
                    <Text style={styles.customerPointDisplay}>
                        {user.points} (${(user.points * pointCash).toFixed(2)})
                    </Text>
                    <Text style={styles.customerPointLabel}>Point balance</Text>
                </View>
                {/*<AntDesign name="star" size={24} color="#0782F9" />*/}
            </View>
            <View style={{ padding: 20, width: "96%" }}>
                <ProgressBar
                    percentage={customerMilestone}
                    color={'#65a30d'}
                    style={{ backgroundColor: '#EDE5BB' }}
                    transitionSpeed={1000}
                    Milestone={() => <AntDesign name="star" size={26} color={'#FADA39'} />}
                    CurrentMilestone={() => <AntDesign name="star" size={26} color={'#a3e635'} />}
                    CompletedMilestone={() => <AntDesign name="star" size={26} color={'#65a30d'} />}
                    milestoneCount={membershipTiers.length} />

            </View>

            {selectedTimesList.length > 0 && (
                <View style={styles.selectedTimesContainer}>
                    <Text style={styles.listtext}>Selected Delivery Times</Text>
                    <View style={styles.selectedTimesList}>
                        {selectedTimesList.map((item) => (
                            <View key={`${item.date}-${item.time}`} style={styles.selectedTimeCard}>
                                <Text style={styles.cardTitle}><b>Date: </b>{item.date}</Text>
                                <Text style={styles.cardText}>
                                    <b>Time: </b>{item.time}
                                </Text>
                                {item.orderInvoices ? (
                                    <View>
                                        {/*<Text style={styles.orderTitle}>Order IDs:</Text>*/}
                                        <Text style={styles.orderText}><b>Order IDs: </b>{item.orderInvoices.join(", ")}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.noOrdersText}>No orders for this timeslot</Text>
                                )}

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleDeliveryDelete(item)}
                                >
                                    <Text style={styles.removeButtonText}> Remove </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

            )}

            {selectedPickupTimesList.length > 0 && (
                <View style={styles.selectedTimesContainer}>
                    <Text style={styles.listtext}>Pickup Times</Text>
                    <View style={styles.selectedTimesList}>
                        {selectedPickupTimesList.map((item) => (
                            <View key={`${item.date}-${item.time}`} style={styles.selectedTimeCard}>
                                <Text style={styles.cardTitle}><b>Date: </b>{item.date}</Text>
                                <Text style={styles.cardText}><b>Time: </b>{item.time}</Text>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handlePickupDelete(item)}
                                >
                                    <Text style={styles.removeButtonText}> Remove </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

            )}

            <Text style={styles.listtext}>Available for Delivery</Text>
            <CustomerAvailableOrderList navigation={navigation} orderList={orderList.filter(o => o.orderStatus === "Back from Wash")} curUser={user} />
        </View>
    )
}

const styles = StyleSheet.create({
    customerPointContainer: {
        paddingLeft: 5,
        marginLeft: 10,
        flexDirection: "row"
    },
    customerPointDisplay: {
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 5,
        fontSize: 24,
        fontWeight: "600"
    },
    customerPointLabel: {
        marginHorizontal: 10,
        fontWeight: "400"
    },
    selectedTimesContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    selectedTimesList: {
        flex: 1,
    },
    selectedTimeCard: {
        width: "92%",
        alignItems: 'left',
        backgroundColor: colors.white,
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginLeft: 15,
        borderColor: colors.borderColor,
        borderWidth: 2
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
    orderText: {
        fontSize: 16,
        color: '#333333',
        marginLeft: 10
    },
    noOrdersText: {
        fontSize: 16,
        color: '#333333',
        marginLeft: 10
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
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    ordersListContainer: {
        flex: 1,
        padding: 10,
    },
    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
    },
    NavButton: {
        backgroundColor: colors.primary,
        padding: 20,
        borderRadius: 5,
        margin: 2,
        alignSelf: 'center',
    },
    NavButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        alignSelf: 'center',
    },
    ViewAllButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 5,
        margin: 20,
        alignSelf: 'flex-end',
        // marginBottom: 30
    },
    ViewAllButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        alignSelf: 'center',
    },
});