import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
    ScrollView,
    TextInput
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import alert from '../components/Alert'
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";
import Toast from 'react-native-toast-message';

export default function Feedback() {
    const [orderList, setOrderList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [udpateModalVisible, setUpdateModalVisible] = useState(false);
    const orders = firebase.firestore().collection("orders");

    useEffect(() => {
        orders.onSnapshot(querySnapshot => {
            const orderList = [];
            console.log('here');
            querySnapshot.forEach(doc => {
                const { customerName, orderId, outletId, rating, feedback, invoiceNumber, orderDate, totalPrice } = doc.data();
                if (rating >= 0) {
                    orderList.push({
                        id: doc.id,
                        customerName,
                        orderId,
                        outletId,
                        rating,
                        feedback,
                        invoiceNumber,
                        orderDate,
                        totalPrice
                    })
                }
            });
            setOrderList(orderList);
        });
    }, []);

    const formatOrderDate = (date) => {
        //return date.toDate().toLocaleString();
        if (date !== null) {
            var convertedDate = new Date(date.seconds * 1000);
            return convertedDate.getFullYear() + "-" + (1 + convertedDate.getMonth()) + "-" + convertedDate.getDate();
        } else {
            return null;
        }
    };

    const renderItem = ({ item: order }) => (
        <TouchableOpacity
            style={styles.card}
            //onPress={() => toggleExpand(order.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.orderDate}>{formatOrderDate(order.orderDate)}</Text>
                <Text style={styles.orderId}>{order.invoiceNumber}</Text>
                <Text style={styles.orderCustomerName}>{order.customerName}</Text>
                <Text style={styles.orderNum}>${order.totalPrice}</Text>
                <Text style={styles.orderNum}>{order.rating}</Text>
                <Text style={styles.orderNum}>{order.feedback}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={{ marginBottom: 20 }}>
            <View style={styles.buttonView}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.btn}>
                    <Text style={styles.text}>Back</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Customer Feedback</Text>
                <FlatList
                    style={styles.list}
                    data={orderList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    // onEndReachedThreshold={0}
                    // onEndReached={handleLoadMore}
                    ListEmptyComponent={
                        <Text style={styles.noDataText}>No Data Found!</Text>
                    }
                />
            </View>
        </ScrollView>
    );
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
    cardHeader: {
        flexDirection: 'row',
        //justifyContent: 'space-between',
        padding: 8,
    },
    buttonView: {
        justifyContent: 'space-between',
        marginTop: 30,
        flexDirection: 'row',
    },
    btn: {
        borderRadius: 20,
        backgroundColor: colors.blue700,
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
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
        float: "left",
    },
});