import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import CustomerAvailableOrderList from "../components/CustomerAvailableOrderList";
import colors from '../colors';

export default function CustomerHome({ user, navigation }) {

    const [orderList, setOrderList] = useState([]);
    const [pointCash, setPointCash] = useState(0);
    const [selectedTimesList, setSelectedTimesList] = useState([]);
    const orders = firebase.firestore().collection('orders');
    const crm = firebase.firestore().collection('crm');
    const userTimings = firebase.firestore().collection('user_timings');

    useEffect(() => {
        if (user) {
            orders
                .where("customerNumber", "==", user.number)
                .get()
                .then(querySnapshot => {
                    const orderList = [];
                    console.log(user);
                    querySnapshot.forEach((doc) => {
                        const { customerName, customerNumber, date, orderItems, outletId, orderStatus, totalPrice } = doc.data();
                        orderList.push({
                            id: doc.id,
                            customerName,
                            customerNumber,
                            date,
                            orderItems,
                            outletId,
                            orderStatus,
                            totalPrice,
                        });
                    });
                    setOrderList(orderList);
                    console.log(orderList);
                }).then(console.log(orderList));

            crm
                .doc("point_cash")
                .get()
                .then(querySnapshot => {
                    setPointCash(querySnapshot.data().value);
                })

            userTimings
                .doc(user.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const selectedTimes = doc.data().selected_times || [];
                        console.log(selectedTimes);
                        setSelectedTimesList(selectedTimes);
                    } else {
                        setSelectedTimesList([]);
                    }
                });
        }
    }, [user]);

    return (
        <View>
            <View style={{ paddingLeft: 5, marginLeft: 10 }}>
                <Text style={
                    {
                        flexDirection: 'row',
                        flex: 2,
                        margin: 10,
                        fontSize: 24,
                        fontWeight: "800"
                    }
                }>
                    <Ionicons name="ios-person-outline" size={24} onPress={() => alert("clicked")} /> <FontAwesome5 name="coins" size={24} /> {user.points} (${user.points * pointCash})</Text>

            </View>

            <View style={
                {
                    flexDirection: 'row',
                    // alignSelf: 'center',
                    justifyContent: "center",
                    flexWrap: 'wrap',
                    padding: 10,

                }
            }>
                <TouchableOpacity style={styles.NavButton} onPress={() => navigation.navigate('Order History')}>
                    <Text style={styles.NavButtonText}>Order History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.NavButton} onPress={() => navigation.navigate('Pick up')}>
                    <Text style={styles.NavButtonText}>Pick Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.NavButton} >
                    <Text style={styles.NavButtonText}>Rewards</Text>
                </TouchableOpacity>
                {orderList.length > 0 && (
                    <TouchableOpacity style={styles.NavButton} onPress={() => navigation.navigate("Delivery", { curuser: user })}>
                        <Text style={styles.NavButtonText}>Delivery</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* <Text style={styles.listtext}>My Orders</Text>
            <CustomerOrderList curUser={user} /> */}
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
                                {item.orders ? (
                                    <View>
                                        {/*<Text style={styles.orderTitle}>Order IDs:</Text>*/}
                                        <Text style={styles.orderText}><b>Order IDs: </b>{item.orders.map((order) => order.id).join(", ")}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.noOrdersText}>No orders for this timeslot</Text>
                                )}

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleDelete(item)}
                                >
                                    <Text style={styles.removeButtonText}> Remove </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>

            )}
            <Text style={styles.listtext}>Available for Delivery</Text>
            <CustomerAvailableOrderList navigation={navigation} orderList={orderList.filter(o => o.orderStatus === "Back from Wash")} />
        </View>
    )
}

const styles = StyleSheet.create({
    selectedTimesContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    selectedTimesList: {
        flex: 1,
    },
    selectedTimeCard: {
        width: "97%",
        alignItems: 'left',
        backgroundColor: colors.white,
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginLeft: 15
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
});