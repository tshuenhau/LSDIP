import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    LayoutAnimation,
} from "react-native";
import { firebase } from "../config/firebase";
import colors from '../colors';
import OrderDetails from "./OrderDetails";
import Delivery from '../screens/Delivery';

export default function CustomerOrderList({ curUser, navigation }) {
    console.log(curUser);

    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderList, setOrderList] = useState([]);
    const orders = firebase.firestore().collection('orders');

    useEffect(() => {
        if (curUser) {
            orders
                .where("customerNumber", "==", curUser.number)
                .where("orderStatus", "==", "Back from Wash")
                .get()
                .then(querySnapshot => {
                    const orderList = [];
                    console.log(curUser);
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
        }
    }, [curUser]);


    const formatOrderNumber = (id) => {
        return '#' + id.slice(0, 4).toUpperCase();
    };

    const formatOrderDate = (date) => {
        //return date.toDate().toLocaleString();
        return date;
    };

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedOrder === id) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(id);
        }
    };

    const renderItem = ({ item: order }) => (
        <View>
            <TouchableOpacity
                style={styles.card}
                onPress={() => toggleExpand(order.id)}
                activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderNumber}>{formatOrderNumber(order.id)}</Text>
                    <Text style={styles.orderDate}>{formatOrderDate(order.date)}</Text>
                    <Text style={styles.orderNumber}>{order.orderStatus}</Text>
                </View>
                {expandedOrder === order.id && (
                    <View style={styles.cardBody}>
                        <Text style={styles.orderNumber}>Name: {order.customerName}</Text>
                        <Text style={styles.orderNumber}>Number: {order.customerNumber}</Text>
                        <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
                        <Text style={styles.orderNumber}>Total Price: {order.totalPrice}</Text>
                        <OrderDetails data={order.id}></OrderDetails>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View>
            <ScrollView>
                {orderList.length > 0 && (
                    <TouchableOpacity style={styles.deliveryButton} onPress={() => navigation.navigate("Delivery", { curuser: curUser })}>
                        <Text style={styles.deliveryButtonText}>Delivery</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.container}>
                    <FlatList
                        style={styles.list}
                        data={orderList}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.noDataText}>No Data Found!</Text>
                        }
                    />
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    orderNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    orderDate: {
        fontSize: 14,
        color: colors.gray,
    },
    cardBody: {
        backgroundColor: colors.lightGray,
        padding: 16,
    },
    list: {
        flex: 1,
    },
    noDataText: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    deliveryButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 5,
        margin: 10,
        alignSelf: 'center',
    },
    deliveryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});