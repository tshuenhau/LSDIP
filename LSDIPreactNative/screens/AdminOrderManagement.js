import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    UIManager,
    Platform,
    LayoutAnimation
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import { ScrollView } from 'react-native-gesture-handler';
import moment from 'moment';


if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Invoice(props) {
    const [user, setUser] = useState(null);
    const { userNumber } = props.route.params;
    const [orderList, setOrderList] = useState([]);
    const orders = firebase.firestore().collection('orders');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const users = firebase.firestore().collection('users');
    //console.log(userNumber.toString())
    useEffect(() => {
        orders
            //.where("customerNumber", "==", userNumber)
            .onSnapshot(querySnapshot => {
                const orderList = [];
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
            });
    }, []);

    const formatOrderNumber = (id) => {
        return '#' + id.slice(0, 4).toUpperCase();
    };

    const filteredOrder = orderList.filter((item) => item.customerNumber == userNumber.toString());

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
                <Text style={styles.orderDate}>{order.orderDate}</Text>
                <Text style={styles.orderNumber}>{order.orderStatus}</Text>
            </View>
            {expandedOrder === order.id && (
                <View style={styles.cardBody}>
                    <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
                    <Text style={styles.orderNumber}>Total Price: {order.totalPrice}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView>
            <View style={styles.buttonView}>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('Customer Rewards')}
                    style={styles.btn}>
                    <Text style={styles.text}>Back</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                <Text style={styles.searchText}>Order History</Text>
                <FlatList
                    style={styles.list}
                    data={filteredOrder}
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
        backgroundColor: '#fff',
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '2%',
        width: '95%',
        marginBottom: 20,
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
        height: "10%"
    },
    noDataText: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    searchText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
        float: "left"
    },
    buttonView: {
        justifyContent: 'space-between',
        marginTop: 30,
        flexDirection: 'row',
    },
    btn: {
        borderRadius: 20,
        backgroundColor: colors.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        width: "20%",
        marginHorizontal: "5%",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        padding: 10
    },
});