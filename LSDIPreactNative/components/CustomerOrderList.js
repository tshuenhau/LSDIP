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

export default function CustomerOrderList({ curUser }) {

    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderList, setOrderList] = useState([]);
    const orders = firebase.firestore().collection('orders');

    useEffect(() => {
        orders
            .where("customerPhone", "==", curUser.phone)
            .get()
            .then(querySnapshot => {
                const orderList = [];
                querySnapshot.forEach((doc) => {
                    const { customerName, customerPhone, date, orderItems, outletId, orderStatus, totalPrice } = doc.data();
                    orderList.push({
                        id: doc.id,
                        customerName,
                        customerPhone,
                        date,
                        orderItems,
                        outletId,
                        orderStatus,
                        totalPrice,
                    });
                });
                setOrderList(orderList);
            });
    }, []);

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
                    <Text style={styles.orderNumber}>Number: {order.customerPhone}</Text>
                    <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
                    <Text style={styles.orderNumber}>Total Price: {order.totalPrice}</Text>
                    <OrderDetails data={order.id}></OrderDetails>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView>
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
});