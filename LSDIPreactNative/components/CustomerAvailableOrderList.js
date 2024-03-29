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
import colors from '../colors';
import OrderDetails from "./OrderDetails";

export default function CustomerOrderList({ orderList, navigation, curUser }) {
    console.log(curUser);
    console.log(orderList);

    const [expandedOrder, setExpandedOrder] = useState(null);

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
        <View style>
            <TouchableOpacity
                style={styles.card}
                onPress={() => toggleExpand(order.id)}
                activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderNumber}>Invoice Number: {order.invoiceNumber}</Text>
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
                {orderList.length > 0 && (
                    <TouchableOpacity style={styles.deliveryButton} onPress={() => navigation.navigate("Delivery", { curuser: curUser })}>
                        <Text style={styles.deliveryButtonText}>Select Delivery Timing</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        // backgroundColor: '#fff',
        // marginVertical: 10,
        // marginHorizontal: 16,
        // borderRadius: 10,
        // shadowColor: '#000',
        // shadowOpacity: 0.2,
        // shadowOffset: {
        //     width: 0,
        //     height: 3,
        // },
        // elevation: 3,
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