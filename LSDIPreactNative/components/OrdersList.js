import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, FlatList } from "react-native";
import { firebase } from "../config/firebase";
import colors from '../colors';

export default function OrdersList() {
    const [orderlist, setOrderList] = useState([]);
    useEffect(() => {
        const orders = firebase.firestore().collection('orders');
        const unsubscribe = orders.onSnapshot(querySnapshot => {
          const orderlist = [];
          querySnapshot.forEach(doc => {
            const { date, items } = doc.data();
            orderlist.push({
              id: doc.id,
              date,
              items,
            });
          });
          setOrderList(orderlist);
        });
        return () => unsubscribe();
      }, []);

    function showOrders() {
        console.log("in method");
        ({ orderlist }) => {
            return (
                <FlatList
                    data={orderlist}
                    keyExtractor={order => order.id}
                    renderItem={({ item: order }) => (
                        <View>
                            <Text>Order Date: {order.date}</Text>
                            <FlatList
                                data={order.items}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <View>
                                        <Text>Item Name: {item.text}</Text>
                                        {/* <Text>Item Quantity: {item.quantity}</Text>
                        <Text>Item Price: {item.price}</Text> */}
                                    </View>
                                )}
                            />
                        </View>
                    )}
                />
            );
        };
    }

    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    function formatDate(date) {
        return (
            [
                padTo2Digits(date.getMonth() + 1),
                padTo2Digits(date.getDate()),
                date.getFullYear(),
            ].join('/') +
            ' ' +
            [
                padTo2Digits(date.getHours()),
                padTo2Digits(date.getMinutes()),
                padTo2Digits(date.getSeconds()),
            ].join(':')
        );
    }

    return (
        <View>
            {!(orderlist.length > 0) && <Text> No Data Found! </Text>}
            <View>
                <FlatList
                    data={orderlist}
                    keyExtractor={order => order.id}
                    renderItem={({ item: order }) => (
                        <View style={styles.cards}>
                            <Text>Order Date: {formatDate(new Date(order.date.toMillis()))}</Text>
                            <FlatList
                                data={order.items}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <View>
                                        <Text>Item Name: {item}</Text>
                                        {/* <Text>Item Quantity: {item.quantity}</Text>
                                <Text>Item Price: {item.price}</Text> */}
                                    </View>
                                )}
                            />
                        </View>
                    )}
                />
                <View style={styles.refreshContainer}>
                    <TouchableOpacity onPress={showOrders} style={styles.refreshButton}>
                        <Text style={styles.refreshButtonText}>Refresh Orders</Text>
                    </TouchableOpacity>
                </View>
            </View >
        </View>
    )
}

const styles = StyleSheet.create({
    cards: {
        backgroundColor: '#fff',
        marginBottom: 10,
        marginLeft: '2%',
        width: '96%',
        shadowColor: '#000',
        shadowOpacity: 1,
        shadowOffset: {
            width: 3,
            height: 3,
        }
    },
    refreshContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
        //alignItems: "center",
        //alignContent: "center",
    },
    refreshButton: {
        backgroundColor: '#0782F9',
        width: '60%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 40,
    },
    refreshButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    }
});