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
import { MaterialCommunityIcons, AntDesign, Entypo } from '@expo/vector-icons';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { line } from 'd3';

export default function Dashboard() {
    const date = new Date();
    const today = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    const [orderList, setOrderList] = useState([]);
    const [rosterList, setRosterList] = useState([]);
    const [refundList, setRefundList] = useState([]);
    const [orderRefunds, setOrderRefunds] = useState([]);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [requestDelivery, setRequestDelivery] = useState(0);
    const [requestExpress, setRequestExpress] = useState(0);
    const [staff, setStaff] = useState(0);
    const [sales, setSales] = useState(0);
    const [salesLastMonth, setSalesLastMonth] = useState(0);
    const orders = firebase.firestore().collection("orders");
    const refunds = firebase.firestore().collection("refunds");
    const users = firebase.firestore().collection("users");
    const staff_schedule = firebase.firestore().collection("staff_schedule");

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
        orders
            .get()
            .then(querySnapshot => {
                const orderList = [];
                let completedorders = 0;
                let requestDelivery = 0;
                let requestExpress = 0;
                querySnapshot.forEach(doc => {
                    const { customerNumber, outletId, orderDate, totalPrice, express, requireDelivery, orderStatus } = doc.data();
                    if (orderStatus === "Closed") {
                        completedorders++;
                    }
                    if (requireDelivery) {
                        requestDelivery++;
                    }
                    if (express) {
                        requestExpress++;
                    }
                    orderList.push({
                        id: doc.id,
                        customerNumber,
                        outletId,
                        orderDate,
                        totalPrice,
                        express,
                        requireDelivery,
                        orderStatus
                    });
                });
                console.log(completedorders);
                setCompletedOrders(completedorders);
                setRequestDelivery(requestDelivery);
                setRequestExpress(requestExpress);
                //console.log(completedOrders);
                setOrderList(orderList);
                console.log('order list', orderList);
                //getOrderByMonth(orderList);
                orderList.forEach((element) => {
                    // console.log(element.orderDate.toDate().getMonth());
                    let record = orderByMonth.at(element.orderDate.toDate().getMonth());
                    record.orderAmt++;
                    record.sales += element.totalPrice;
                });
                console.log(orderByMonth);
                console.log(data);
                console.log(orderByMonth[1].sales);
                setSales(orderByMonth[date.getMonth()].sales);
                setSalesLastMonth(orderByMonth[date.getMonth() - 1].sales);
                console.log(data[1].sales);
            });
    }, []);

    useEffect(() => {
        console.log(today);
        staff_schedule.onSnapshot(querySnapshot => {
            let staff = 0;
            querySnapshot.forEach(doc => {
                const { date, outletID, userID } = doc.data();
                if (date === today && outletID === 'bTvPBNfMLkBmF9IKEQ3n') {
                    console.log('found');
                    staff++;
                }
            });
            setStaff(staff);
        });
    }, []);

    function getOrderByMonth(orderList) {
        //console.log('ol', orderList);
        orderList.forEach((element) => {
            // console.log(element.orderDate.toDate().getMonth());
            let record = orderByMonth.at(element.orderDate.toDate().getMonth());
            record.orderAmt++;
            record.sales += element.totalPrice;
        });
        console.log(orderByMonth);
        console.log(data);
        console.log(orderByMonth[1].sales);
        console.log(data[1].sales);
        //return orderByMonth;
    }

    function calculateOrderStats(a, b) {
        return (a / b * 100).toFixed(2);
    }

    function compareSales(sales, salesLastMonth) {
        return ((sales - salesLastMonth) / salesLastMonth * 100).toFixed(2);
    }

    return (
        <View>
            <View style={styles.cards}>
                <View style={styles.cardContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.cardHeader}>STAFF</Text>
                        <Image source={require('../assets/staff.png')} style={{ marginTop: 10, marginRight: 15, marginLeft: 'auto', height: 50, width: 50 }} />
                    </View>
                    <Text style={styles.cardStats}></Text>
                    <Text style={styles.cardInfo}></Text>
                    <Text style={styles.cardInfo}>{staff} staff in the outlet</Text>
                </View>
                <View style={styles.cardContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.cardHeader}>DELIVERY & EXPRESS RATE</Text>
                        <Image source={require('../assets/piechart.png')} style={{ marginTop: 10, marginRight: 15, marginLeft: 'auto', height: 50, width: 50 }} />
                    </View>
                    <Text style={styles.cardStats}></Text>
                    <Text style={styles.cardInfo}>{calculateOrderStats(requestDelivery, orderList.length)}% requested delivery</Text>
                    <Text style={styles.cardInfo}>{calculateOrderStats(requestExpress, orderList.length)}% requested express</Text>
                </View>
                <View style={styles.cardContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.cardHeader}>SALES</Text>
                        <Image source={require('../assets/sales.png')} style={{ marginTop: 10, marginRight: 15, marginLeft: 'auto', height: 50, width: 50 }} />
                    </View>
                    <Text style={styles.cardStats}>$ {sales}</Text>
                    {compareSales(sales, salesLastMonth) >= 0 && (
                        <Text style={{ color: colors.green500, marginLeft: 20 }}>
                        {compareSales(sales, salesLastMonth)}%
                        <Text style={styles.cardInfo}>
                            since last month
                        </Text>
                    </Text>
                    )}
                    {compareSales(sales, salesLastMonth) < 0 && (
                        <Text style={{ color: colors.red500, marginLeft: 20 }}>
                            {compareSales(sales, salesLastMonth)}%
                            <Text style={styles.cardInfo}>
                                since last month
                            </Text>
                        </Text>)}
                </View>
                <View style={styles.cardContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.cardHeader}>ORDERS PERFORMANCE</Text>
                        {/* <MaterialCommunityIcons name="format-list-checks" size={30} color="#fff" style={styles.cardIcon} />*/}
                        <Image source={require('../assets/orderperformance.png')} style={styles.cardIcon} />
                    </View>
                    {/* don't know why useeffect executes twice, thus / 2 */}
                    <Text style={styles.cardStats}>{calculateOrderStats(completedOrders, orderList.length)}%</Text>
                    <Text style={styles.cardInfo}>{completedOrders} orders finished</Text>
                    <Text style={styles.cardInfo}>{orderList.length - completedOrders} orders left</Text>
                </View>
            </View>

            <View style={styles.charts}>
                <View style={styles.chartContainer1}>
                    <Text style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginTop: 10,
                        marginBottom: 0,
                        marginLeft: 20,
                        color: '#e7e5e4'
                    }}>OVERVIEW</Text>
                    <Text style={styles.chartHeader1}>Sales Value</Text>
                    {/*console.log('dashboard', orderByMonth)*/}
                    {/** <BarChart data={data} />*/}
                </View>
                <View style={styles.chartContainer2}>
                    <Text style={styles.chartHeader2}>Total Orders</Text>
                    {/*console.log('dashboard', orderByMonth)*/}
                    <BarChart data={orderByMonth} />
                    {/** <BarChart data={orderByMonth} />*/}
                </View>
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
        marginLeft: 'auto',
        marginRight: 10,
        width: 50,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        //borderRadius: '50%',
        border: 'none',
        padding: '2',
        backgroundColor: "#fff"
        //background: LinearGradient(colors.blue50, colors.blue600)
    },
    cardStats: {
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 5,
        marginBottom: 10,
        marginLeft: 20
    },
    cardInfo: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 5,
        marginLeft: 20,
        color: colors.muted400
    },
    charts: {
        flexDirection: 'row',
        //marginHorizontal: "5%",
    },
    chartContainer1: {
        position: 'sticky',
        flex: 2,
        height: "100%",
        //width: "50%",
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: colors.chart,
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 8,
            height: 8,
        },
        shadowOpacity: 0.02,
        elevation: 3,
    },
    chartContainer2: {
        //position: 'sticky',
        //flex: 2,
        height: "100%",
        width: "35%",
        marginTop: 20,
        marginBottom: 20,
        marginRight: 15,
        backgroundColor: "#fff",
        //backgroundColor: colors.blue100,
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 8,
            height: 8,
        },
        shadowOpacity: 0.02,
        elevation: 3,
    },
    chartHeader1: {
        fontWeight: "bold",
        fontSize: 24,
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 20,
        color: '#fff',
    },
    chartHeader2: {
        fontWeight: "bold",
        fontSize: 24,
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 20,
        //color: colors.blue700
    }
});