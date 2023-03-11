import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
    Alert,
    Modal
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'
import TextBox from "../components/TextBox";
import { firebase } from '../config/firebase';
import colors from '../colors';
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Print from 'expo-print';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderSummary(props) {
    const { cart } = props.route.params;
    const {totalAmount} = props.route.params;
    // console.log('tp:', totalAmount);
    // console.log('cart: ', cart);

    const [customerDetails, setCustomerDetails] = useState({
        customerName: "",
        customerNumber: "",
        description: ""
    });
    //const [description, setDescription] = useState("");
    const initialOrderValues = {
        //orderDate: moment().format("YYYY-MM-DD HH:mm:ss a")
        orderDate: firebase.firestore.FieldValue.serverTimestamp(),
        customerName: "",
        customerAddress: "",
        customerNumber: "",
        pickupDate: "",
        deliveryDate: "",
        customerNumber: "",
        description: ""
    }
    const orderItems = firebase.firestore().collection('orderItem');
    const orders = firebase.firestore().collection("orders");
    const [orderValues, setOrderValues] = useState(initialOrderValues);


    const getUserId = async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            if (id !== null) {
                return id;
            }
        } catch (e) {
            console.log(e);
        }
    };

    const createOrder = async () => {
        console.log(customerDetails);
        try {
            const orderItemRefs = await Promise.all(
                cart.map(async (item) => {
                    const orderItemRef = await orderItems.add(item);
                    return orderItemRef;
                })
            );

            // Get IDs of created order items
            const orderItemIds = orderItemRefs.map((ref) => ref.id);

            // Create order
            const orderRef = await orders.add({
                ...orderValues,
                customerName: customerDetails.customerName,
                customerNumber: customerDetails.customerNumber,
                description: customerDetails.description,
                endDate: null,
                totalPrice: totalAmount,
                orderStatus: "Pending Wash",
                receiveFromWasherDate: null,
                sendFromWasherDate: null,
                staffID: await getUserId(),
                outletId: "bTvPBNfMLkBmF9IKEQ3n", //this is default, assuming one outlet
                orderDate: firebase.firestore.Timestamp.fromDate(new Date()),
                orderItemIds: orderItemIds, // Add order item IDs to order
            });

            setOrderValues(initialOrderValues);
            setCustomerDetails({ customerName: "", customerNumber: "", description: "" });
            //setDescription("");
            // alert("Order created successfully");
            Toast.show({
                type: 'success',
                text1: 'Order Created',
            });

            // Print.printAsync({
            //       html,
            // });
            navigation.navigate("Home");

        } catch (error) {
            console.error(error);
            Alert.alert("Error creating order. Please try again.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.cardHeader}>
            <Text style={styles.orderNumber}>{item.typeOfServices}</Text>
            <Text style={styles.orderNumber}>{item.laundryItemName}</Text>
            <Text style={styles.orderNumber}>{item.price}</Text>
            <Text style={styles.orderNumber}>{item.quantity}</Text>

        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionText}>Checkout</Text>
            <View style={styles.summary}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Service</Text>
                    <Text style={styles.tableHeaderText}>Item Name</Text>
                    <Text style={styles.tableHeaderText}>Price</Text>
                    <Text style={styles.tableHeaderText}>Qty</Text>
                </View>
                <FlatList
                    style={styles.list}
                    data={cart}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.noDataText}>No Data Found!</Text>
                    }
                />

                <Text style={styles.orderNumber}>
                    Total Price: ${totalAmount}
                </Text>
            </View>

            <View style={{ alignItems: "center", marginBottom: "5%", marginLeft: "5%", width: "90%" }}>
                <TextBox style={styles.textBox} placeholder="Customer Name" onChangeText={name => setCustomerDetails({ ...customerDetails, customerName: name })} value={customerDetails.customerName} />
                <TextBox style={styles.textBox} placeholder="Customer Number" onChangeText={number => setCustomerDetails({ ...customerDetails, customerNumber: number })} value={customerDetails.customerNumber} />
                <TextBox style={styles.textBox} placeholder="Order Description" onChangeText={newDescription => setCustomerDetails({ ...customerDetails, description: newDescription})} value={customerDetails.description} />
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={createOrder}>
                <Text style={styles.checkoutButtonText}>Create Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => props.navigation.goBack()}
                style={styles.btn}>
                <Text style={styles.text}>Back to Cart</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 20,
    },
    indicateButton: {
        backgroundColor: "blue",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    indicateButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    closeButton: {
        backgroundColor: "grey",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    closeButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 5,
        minWidth: 300,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonView: {
        width: "92%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        flexDirection: 'row',
    },
    button: {
        margin: 10,
        backgroundColor: "#0B3270",
    },
    btn: {
        borderRadius: 15,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        width: "20%"
    },
    createOrderContainer: {
        flexDirection: "row",
        alignSelf: "center",
    },
    noDataText: {
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        padding: 10,
        float: "left"
    },
    sectionText: {
        fontSize: 20,
        fontWeight: "600",
        color: "000000",
        padding: 10,
        float: "left"
    },
    container: {
        flex: 1,
        marginTop: "5%"
    },
    list: {
        flex: 1,
    },
    card: {
        backgroundColor: "#fff",
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
    },
    orderNumber: {
        fontSize: 20,
    },
    orderDate: {
        fontSize: 14,
        color: colors.gray,
    },
    cardBody: {
        backgroundColor: colors.lightGray,
        padding: 16,
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.darkBlue,
        marginLeft: 8,
    },
    noDataText: {
        alignSelf: "center",
        marginTop: 32,
        fontSize: 18,
        fontWeight: "bold",
    },
    outletIcon: {
        fontSize: 20,
        margin: 10,
    },
    cardHeaderIcon: {
        flexDirection: 'row',
        padding: 16,
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: colors.gray,
        paddingHorizontal: 10,
        fontSize: 18,
        backgroundColor: colors.white,
        marginVertical: 10,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    searchContainer: {
        justifyContent: "center",
        alignContent: "center",
        width: "96%",
        marginLeft: 15
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
        fontSize: 14,
    },
    summary: {
        backgroundColor: "fff"
    },
    textBox: {
        width: "96%",
        marginLeft: 13,
        fontSize: 16,
        padding: 10,
        borderColor: "#0B3270",
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: "#fff"
    },
    checkoutButton: {
        backgroundColor: "#0B3270",
        padding: 16,
        borderRadius: 10,
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: 20,
    },
    checkoutButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
    }
});
