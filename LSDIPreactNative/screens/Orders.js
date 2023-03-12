import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
    Modal,
    TextInput,
    Button,
    ScrollView,
    Image
} from 'react-native';
import { firebase } from '../config/firebase';
import OrderDetails from "../components/OrderDetails";
import colors from '../colors';
import { FontAwesome } from '@expo/vector-icons';
import Checkbox from "expo-checkbox";
import { SelectList } from "react-native-dropdown-select-list";
import Btn from "../components/Button";
import alert from "../components/Alert";
import QR from "../components/QR";
import { Entypo } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import CustomerOrderList from "../components/CustomerOrderList";
import { color } from "react-native-reanimated";

export default function Orders({ navigation }) {

    const [orderList, setOrderList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [udpateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const orders = firebase.firestore().collection("orders");

    useEffect(() => {
        const unsubscribe = orders.onSnapshot((querySnapshot) => {
            const orderList = [];
            querySnapshot.forEach((doc) => {
                const {
                    customerName,
                    customerNumber,
                    orderDate,
                    orderItems,
                    outletId,
                    orderStatus,
                    totalPrice,
                    deliveryDate,
                } = doc.data();
                orderList.push({
                    isSelected: false,
                    id: doc.id,
                    customerName,
                    customerNumber,
                    orderDate,
                    orderItems,
                    outletId,
                    orderStatus,
                    totalPrice,
                    deliveryDate
                });
            });
            orderList.sort(function(a,b) {
                return b.orderDate - a.orderDate;
            });
            setOrderList(orderList);
        });
        return () => unsubscribe();
    }, []);

    const statuses = [
        { key: 1, value: "Pending Wash" },
        { key: 2, value: "Out for Wash" },
        { key: 3, value: "Back from Wash" },
        { key: 4, value: "Pending Delivery" },
        { key: 5, value: "Out for Delivery" },
        { key: 6, value: "Closed" },
        // for orders with problems
        { key: 7, value: "Case" },
        { key: 8, value: "Void" },
    ];

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedOrder === id) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(id);
        }
    };

    const formatOrderNumber = (id) => {
        return "#" + id.slice(0, 4).toUpperCase();
    };

    const formatOrderDate = (date) => {
        //return date.toDate().toLocaleString();
        var convertedDate = date.toDate();
        return convertedDate.getFullYear() + "-" + convertedDate.getMonth() + "-" + convertedDate.getDate();
    };

    const handleCheck = (order) => {
        const updatedArray = orderList.map((item) => {
            if (item.id === order.id) {
                return {
                    ...item,
                    isSelected: !order.isSelected,
                };
            }
            return item;
        });

        setOrderList(updatedArray);
    };


    // const auth1 = firebase.auth;

    const [user, setUser] = useState(null) // This user
    const users = firebase.firestore().collection('users');



    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Image
                    source={require('../assets/washin.jpg')}
                    style={{
                        width: 40,
                        height: 40,
                        marginRight: 15,
                    }}
                />
            ),
        });
    }, [navigation]);



    const updateStatus = () => {
        const selectedOrders = orderList.filter((s) => s.isSelected);
        if (selectedOrders.length === 0 || selectedStatus === "") {
            alert("Confirmation", "Please select an order and a status", [
                {
                    text: "Ok",
                    onPress: () => {
                        console.log("Closed");
                    },
                },
            ]);
        } else {
            selectedOrders.forEach((o) => {
                orders
                    .doc(o.id)
                    .update({
                        orderStatus: selectedStatus,
                    })
                    .then(() => {
                        console.log(o.id, "updated");
                    });
            });
            setUpdateModalVisible(false);
        }
    };

    const filteredOrderList = orderList.filter((order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item: order }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(order.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <TouchableOpacity
                    style={{ paddingTop: 12, marginRight: 15 }}
                    onPress={() => handleCheck(order)}>
                    <Checkbox
                        disabled={false}
                        value={order.isSelected}
                        onValueChange={() => handleCheck(order)}
                    />
                </TouchableOpacity>
                <Text style={styles.orderNumber}>{formatOrderDate(order.orderDate)}</Text>
                <Text style={styles.orderNumber}>{formatOrderNumber(order.id)}</Text>
                <Text style={styles.orderNumber}>{order.customerName}</Text>
                <Text style={styles.orderNumber}>${order.totalPrice}</Text>
                {order.orderStatus === "Pending Wash" && (<Text style={styles.pendingwash}>{order.orderStatus}</Text>)}
                {order.orderStatus === "Out for Wash" && (<Text style={styles.outforwash}>{order.orderStatus}</Text>)}
                {order.orderStatus === "Back from Wash" && (<Text style={styles.backfromwash}>{order.orderStatus}</Text>)}
                {order.orderStatus === "Pending Delivery" && (<Text style={styles.pendingdelivery}>{order.orderStatus}</Text>)}
                {order.orderStatus === "Out for Delivery" && (<Text style={styles.outfordelivery}>{order.orderStatus}</Text>)}
                {order.orderStatus === "Closed" && (<Text style={styles.orderNumber}>{order.orderStatus}</Text>)}
                {order.orderStatus === "Case" && (<Text style={styles.orderNumber}>{order.orderStatus}</Text>)}
                {order.orderStatus === "Void" && (<Text style={styles.orderNumber}>{order.orderStatus}</Text>)}
                {order.orderStatus === "" && (<Text style={styles.orderNumber}>{order.orderStatus}</Text>)}

                <View style={styles.cardButtons}>

                    {/*<TouchableOpacity
                        style={{ paddingTop: 12, marginRight: 15 }}
                        onPress={() => handleCheck(order)}>
                        <Checkbox
                            disabled={false}
                            value={order.isSelected}
                            onValueChange={() => handleCheck(order)}
                        />
                     </TouchableOpacity>*/}
                    <FontAwesome
                        style={styles.outletIcon}
                        name="edit"
                        color='green'
                        onPress={() => navigation.navigate('Order Page', { orderId: order.id })}
                    />
                    <FontAwesome
                        style={styles.outletIcon}
                        name="print"
                        color='black'
                        onPress={() => navigation.navigate('Invoice', { orderId: order.id })}
                    />
                </View>
            </View>
            {expandedOrder === order.id && (
                <View style={styles.cardBody}>
                    <Text style={styles.orderNumber}>Customer Number: {order.customerNumber}</Text>
                    <Text style={styles.orderNumber}>Name: {order.customerName}</Text>
                    <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
                    <Text style={styles.orderNumber}>Delivery Fee: when to add</Text>
                    <Text style={styles.orderNumber}>Delivery Date: {order.deliveryDate}</Text>
                    <QR orderID={order.id}></QR>
                    {/*<OrderDetails data={order.id}></OrderDetails>*/}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View>
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by Order ID"
                    />
                    <FontAwesome name="search" size={20} color="black" />
                </View>
                <View style={styles.orders}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Select</Text>
                        <Text style={styles.tableHeaderText}>Date</Text>
                        <Text style={styles.tableHeaderText}>Order Id</Text>
                        <Text style={styles.tableHeaderText}>Customer</Text>
                        <Text style={styles.tableHeaderText}>Price</Text>
                        <Text style={styles.tableHeaderText}>Status</Text>
                        <Text style={styles.tableHeaderText}>Action</Text>
                    </View>
                    <FlatList
                        style={styles.list}
                        data={filteredOrderList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.noDataText}>No Data Found!</Text>
                        }
                    />
                </View>
            </View>
        </View>

    )
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '2%',
        width: '95%'
    },
    searchContainer: {
        width: "96%",
        marginVertical: 15,
        marginLeft: "auto",
        marginRight: "auto",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#f5f5f5',
        backgroundColor: '#f5f5f5',
        alignItems: "center",
        flexDirection: "row"
    },
    searchInput: {
        height: 40,
        fontSize: 18,
        width: '95%',
        marginLeft: 10,
        paddingHorizontal: 10
    },
    searchbaricon: {
        height: 40
    },
    orders: {
        marginHorizontal: "auto",
        width: '95%'
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: 'space-between',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    tableHeaderText: {
        fontWeight: "bold",
        fontSize: 20,
    },
    card: {
        marginVertical: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 0.5,
        },
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
    },
    orderNumber: {
        fontSize: 15,
    },
    pendingwash: {
        fontSize: 15,
        backgroundColor: colors.teal400,
        padding: 3,
        borderRadius: 15,
        color: "#fff",
    },
    outforwash: {
        fontSize: 15,
        backgroundColor: colors.violet400,
        padding: 3,
        borderRadius: 15,
        color: "#fff",
    },
    backfromwash: {
        fontSize: 15,
        backgroundColor: colors.blue400,
        padding: 3,
        borderRadius: 15,
        color: "#fff",
    },
    pendingdelivery: {
        fontSize: 15,
        backgroundColor: colors.blue600,
        padding: 3,
        borderRadius: 15,
        color: "#fff",
    },
    outfordelivery: {
        fontSize: 15,
        backgroundColor: colors.blue800,
        padding: 3,
        borderRadius: 15,
        color: "#fff",
    },
    cardBody: {
        backgroundColor: colors.blue50,
        padding: 16,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },


    ordersListContainer: {
        flex: 1,
        padding: 10,
    },
    chatButtonContainer: {
        position: "absolute",
        bottom: 20,
        right: 20,
    },
    chatButton: {
        backgroundColor: colors.primary,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: .9,
        shadowRadius: 8,
    },
    button: {
        marginTop: "20"
    },
    createOrderContainer: {
        alignSelf: "center",
    },
    list: {
        flex: 1,
    },
    outletIcon: {
        fontSize: 20,
        margin: 5,
    },


    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
    },
});