import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native'
import React, { useState, useEffect } from "react";
import BarChart from "../components/BarChart";
import { firebase } from "../config/firebase";
import colors from '../colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'react-native-svg';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
    const [orderList, setOrderList] = useState([]);
    const [refundList, setRefundList] = useState([]);
    const [orderRefunds, setOrderRefunds] = useState([]);
    const orders = firebase.firestore().collection("orders");
    const refunds = firebase.firestore().collection("refunds");

    const data = [
        { year: 1980, efficiency: 24.3, sales: 8949000 },
        { year: 1985, efficiency: 27.6, sales: 10979000 },
        { year: 1990, efficiency: 28, sales: 9303000 },
        { year: 1991, efficiency: 28.4, sales: 8185000 },
        { year: 1992, efficiency: 27.9, sales: 8213000 },
        { year: 1993, efficiency: 28.4, sales: 8518000 },
        { year: 1994, efficiency: 28.3, sales: 8991000 },
        { year: 1995, efficiency: 28.6, sales: 8620000 },
        { year: 1996, efficiency: 28.5, sales: 8479000 },
        { year: 1997, efficiency: 28.7, sales: 8217000 },
        { year: 1998, efficiency: 28.8, sales: 8085000 },
        { year: 1999, efficiency: 28.3, sales: 8638000 },
        { year: 2000, efficiency: 28.5, sales: 8778000 },
        { year: 2001, efficiency: 28.8, sales: 8352000 },
        { year: 2002, efficiency: 29, sales: 8042000 },
    ];
    /*
    const orderByMonth = [
        {month: 'Jan', orderAmt: 0, sales: 0},
        {month: 'Feb', orderAmt: 0, sales: 0},
        {month: 'Mar', orderAmt: 0, sales: 0},
        {month: 'Apr', orderAmt: 0, sales: 0},
        {month: 'May', orderAmt: 0, sales: 0},
        {month: 'Jun', orderAmt: 0, sales: 0},
        {month: 'Jul', orderAmt: 0, sales: 0},
        {month: 'Aug', orderAmt: 0, sales: 0},
        {month: 'Sep', orderAmt: 0, sales: 0},
        {month: 'Oct', orderAmt: 0, sales: 0},
        {month: 'Nov', orderAmt: 0, sales: 0},
        {month: 'Dec', orderAmt: 0, sales: 0},
    ]
    */

    const orderByMonth = [
        { month: 1, orderAmt: 0, sales: 0 },
        { month: 2, orderAmt: 0, sales: 0 },
        { month: 3, orderAmt: 0, sales: 0 },
        { month: 4, orderAmt: 0, sales: 0 },
        { month: 5, orderAmt: 0, sales: 0 },
        { month: 6, orderAmt: 0, sales: 0 },
        { month: 7, orderAmt: 0, sales: 0 },
        { month: 8, orderAmt: 0, sales: 0 },
        { month: 9, orderAmt: 0, sales: 0 },
        { month: 10, orderAmt: 0, sales: 0 },
        { month: 11, orderAmt: 0, sales: 0 },
        { month: 12, orderAmt: 0, sales: 0 },
    ]

    useEffect(() => {
        orders.onSnapshot(querySnapshot => {
            const orderList = [];
            querySnapshot.forEach(doc => {
                const { customerNumber, outletId, orderDate, totalPrice, express, requireDelivery } = doc.data();
                orderList.push({
                    id: doc.id,
                    customerNumber,
                    outletId,
                    orderDate,
                    totalPrice,
                    express,
                    requireDelivery
                });
            });
            setOrderList(orderList);
            addOrderToMonth(orderList);
        });
    }, []);

    function addOrderToMonth(orderList) {
        orderList.forEach((element) => {
            // console.log(element.orderDate.toDate().getMonth());
            let record = orderByMonth.at(element.orderDate.toDate().getMonth());
            record.orderAmt++;
            record.sales += element.totalPrice;
        });
        console.log(orderByMonth);
    }

    return (
        <View>
            <View style={styles.cards}>
                <View style={styles.cardContainer}>
                    <Text style={styles.cardHeader}>NEW USERS</Text>
                </View>
                <View style={styles.cardContainer}>
                    <Text style={styles.cardHeader}>STAFF</Text>
                </View>
                <View style={styles.cardContainer}>
                    <Text style={styles.cardHeader}>SALES</Text>
                </View>
                <View style={styles.cardContainer}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.cardHeader}>ORDERS PERFORMANCE</Text>
                        <linearGradient 
                            start={{x:0, y:0}}
                            end={{x:1, y: 0}}
                            colors={[colors.blue50, colors.blue600]}>
                            <MaterialCommunityIcons name="format-list-checks" size={30} color="#fff" style={styles.cardIcon}/>
                        </linearGradient>
                    </View>
                    
                </View>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartHeader}>Total Orders</Text>
                {console.log('dashboard', orderByMonth)}
                <BarChart data={orderByMonth} />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    cards: {
        flexDirection: 'row',
        marginHorizontal: "2%",
    },
    cardContainer: {
        flex: 2,
        height: 200,
        width: 220,
        marginTop: 20,
        marginBottom: 20,
        marginRight: 15,
        backgroundColor: "#fff",
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 8,
            height: 8,
        },
        shadowOpacity: 0.02,
        elevation: 3,
    },
    cardHeader: {
        fontWeight: "bold",
        fontSize: 20,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 20,
        color: colors.muted400,
        //backgroundColor: colors.indigo400
    },
    cardIcon: {
        marginTop: 10,
        marginLeft: 5,        
        marginRight: 10,
        width: 50,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: 'none',
        padding: '2',
        //backgroundColor: colors.blue600
        //background: LinearGradient(colors.blue50, colors.blue600)
    },
    chartContainer: {
        position: 'sticky',
        flex: 2,
        height: "40%",
        width: 400,
        marginTop: 20,
        marginBottom: 20,
        marginRight: 15,
        backgroundColor: "#fff",
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.2,
        elevation: 3,
    },
    chartHeader: {
        fontWeight: "bold",
        fontSize: 24,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 20
        //color: colors.blue700
    }
});