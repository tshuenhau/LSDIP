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
    TextInput,
    Image
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import alert from '../components/Alert'
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";
import Toast from 'react-native-toast-message';
import { Rating } from 'react-native-ratings';

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
                if (rating >= 0 && outletId === '1RSi3QaKpvrHfh4ZVXNk') {
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
                <Image style={styles.image}
                    source={require('../assets/customerprofile.png')} />
                <View style={{ flexDirection: 'row', width: '35%' }}>
                    <Text style={styles.orderCustomerName}>{order.customerName}</Text>
                    <Text style={styles.orderDate}>{formatOrderDate(order.orderDate)}</Text>
                </View>
                <Text style={styles.orderId}>{order.invoiceNumber}</Text>
                <Rating
                    type='heart'
                    ratingCount={5}
                    imageSize={20}
                    startingValue={order.rating}
                    readonly
                    style={styles.rating}
                />
                <Text style={styles.orderNum}>${order.totalPrice}</Text>
            </View>
            <Text style={styles.orderFeedback}>{order.feedback}</Text>
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
                <Text style={styles.title}>Customer Feedbacks</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText1}>Review</Text>
                    <Text style={styles.tableHeaderText}>Invoice No</Text>
                    <Text style={styles.tableHeaderText}>Rating</Text>
                    <Text style={styles.tableHeaderText}>Price</Text>
                </View>
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
        //padding: 8,
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
    tableHeader: {
        flexDirection: "row",
        //justifyContent: 'space-between',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    tableHeaderText: {
        fontWeight: "bold",
        fontSize: 20,
        width: '20%',
        textAlign: 'center',
        //backgroundColor: colors.blue100
    },
    tableHeaderText1: {
        fontWeight: "bold",
        fontSize: 20,
        width: '40%'
    },
    card: {
        marginVertical: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 0.5,
        },
        elevation: 3,
    },
    orderCustomerName: {
        fontSize: 16,
        textAlign: "center",
        marginLeft: "2%",
        fontWeight: 'bold'
    },
    orderDate: {
        fontSize: 14,
        //width: "100%",
        //textAlign: "left",
        marginLeft: 10,
        color: colors.shadowGray
    },
    orderId: {
        fontSize: 15,
        width: "8%",
        textAlign: "center",
        marginHorizontal: 'auto'
    },
    orderNum: {
        fontSize: 15,
        width: "20%",
        textAlign: "center",
        marginVertical: 'auto'
    },
    rating: {
        width: '20%',
        marginLeft: '5%',
        textAlign: 'center',
        alignItems: 'center',
        marginVertical: 'auto'
    },
    orderFeedback: {
        fontSize: 15,
        marginLeft: '4%',
        textAlign: 'left',
        marginTop: -5,
        marginBottom: 2
        //marginTop: 5
    },
    image: {
        height: 35,
        width: 35,
        borderRadius: '50%',
        marginLeft: 5
    },
});