import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation, } from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import CustomerAvailableOrderList from "../components/CustomerAvailableOrderList";
import colors from '../colors';

export default function CustomerHome({ user, navigation }) {

    const [orderList, setOrderList] = useState([]);
    const [pointCash, setPointCash] = useState(0);
    const orders = firebase.firestore().collection('orders');
    const crm = firebase.firestore().collection('crm');

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
            <Text style={styles.listtext}>Available for Delivery</Text>
            <CustomerAvailableOrderList navigation={navigation} orderList={orderList.filter(o => o.orderStatus === "Back from Wash")} />
        </View>
    )
}

const styles = StyleSheet.create({
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