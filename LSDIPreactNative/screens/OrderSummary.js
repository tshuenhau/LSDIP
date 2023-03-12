import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    LayoutAnimation,
    UIManager,
    ScrollView,
    Platform,
    Modal
} from 'react-native';
import TextBox from "../components/TextBox";
import { firebase } from '../config/firebase';
import colors from '../colors';
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Print from 'expo-print';
import InvoiceLine from '../components/InvoiceLine';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderSummary(props) {
    const { cart } = props.route.params;
    const { subTotal } = props.route.params;
    const [totalPrice, setTotalPrice] = useState(subTotal);

    const initialOrderValues = {
        orderDate: firebase.firestore.FieldValue.serverTimestamp(),
        customerName: "",
        customerAddress: "",
        customerNumber: "",
        pickupDate: "",
        deliveryDate: "",
        customerNumber: "",
        description: ""
    }

    const [orderValues, setOrderValues] = useState(initialOrderValues);
    const orderItem = firebase.firestore().collection('orderItem');
    const orders = firebase.firestore().collection("orders");

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
        console.log(cart);
        const batch = firebase.firestore().batch();
        const orderItemIds = [];

        // Creating orderItem Ids
        cart.forEach((item) => {
            if (item.pricingMethod !== "Weight") {
                const { laundryItemName, typeOfServices, pricingMethod, price } = item;
                for (let i = 0; i < item.quantity; i++) {
                    const docRef = orderItem.doc();
                    batch.set(docRef, { laundryItemName, typeOfServices, pricingMethod, price });
                    orderItemIds.push(docRef.id);
                }
            } else {
                const docRef = orderItem.doc();
                const { laundryItemName, typeOfServices, pricingMethod, price, weight } = item;
                batch.set(docRef, { laundryItemName, typeOfServices, pricingMethod, price, weight });
                orderItemIds.push(docRef.id);
            }
        })
        batch.commit()
            .then(async () => {

                // Create order
                const orderRef = await orders.add({
                    ...orderValues,
                    customerName: orderValues.customerName,
                    customerNumber: orderValues.customerNumber,
                    description: orderValues.description,
                    endDate: null,
                    totalPrice: totalPrice,
                    orderStatus: "Pending Wash",
                    receiveFromWasherDate: null,
                    sendFromWasherDate: null,
                    staffID: await getUserId(),
                    outletId: "bTvPBNfMLkBmF9IKEQ3n", //this is default, assuming one outlet
                    orderDate: firebase.firestore.Timestamp.fromDate(new Date()),
                    orderItemIds: orderItemIds, // Add order item IDs to order
                });

                setOrderValues(initialOrderValues);
                Toast.show({
                    type: 'success',
                    text1: 'Order Created',
                });

                navigation.navigate("Orders");
            }).catch((err) => {
                console.error(err);
                Toast.show({
                    type: 'error',
                    text1: 'an error occurred',
                });
            })
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
        <ScrollView>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => props.navigation.goBack()}
                    style={styles.btn}>
                    <Text style={styles.text}>Back to Cart</Text>
                </TouchableOpacity>

                <View style={styles.checkoutCard}>
                    <Text style={styles.sectionText}>Checkout</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Service</Text>
                        <Text style={styles.tableHeaderText}>Item Name</Text>
                        <Text style={styles.tableHeaderText}>Price</Text>
                        <Text style={styles.tableHeaderText}>Qty</Text>
                    </View>
                    <FlatList
                        style={styles.list}
                        data={cart}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.noDataText}>No Data Found!</Text>
                        }
                    />

                </View>

                <View style={styles.checkoutCard}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.checkoutDetailsContainer}>
                            <Text style={styles.checkoutDetails}>Customer Name</Text>
                            <TextBox style={styles.textBox} onChangeText={name => setOrderValues({ ...orderValues, customerName: name })} />
                            <Text style={styles.checkoutDetails}>Customer Number</Text>
                            <TextBox style={styles.textBox} onChangeText={number => setOrderValues({ ...orderValues, customerNumber: number })} />
                            <Text style={styles.checkoutDetails}>Order Description</Text>
                            <TextBox style={styles.textBox} onChangeText={newDescription => setOrderValues({ ...orderValues, description: newDescription })} />
                        </View>
                        <View style={{ flex: 2, backgroundColor: "#f8f4f4", borderRadius: 5, padding: 25, margin: 10, }}>
                            <Text style={styles.subTotal}>Order Details</Text>
                            <View style={{ borderBottomColor: "#ccc", borderBottomWidth: 1, paddingBottom: 10, marginVertical: 10, }}>
                                <InvoiceLine label={"Subtotal"} value={subTotal} />
                                {/* pending CRM module */}
                                <InvoiceLine label={"Membership Discount"} value={0} />
                                {/* pending CRM module */}
                                <InvoiceLine label={"Voucher Discount"} value={0} />
                            </View>
                            <View >
                                <InvoiceLine label={"Amount Due"} value={subTotal} total={true} />
                                <TouchableOpacity style={styles.checkoutButton} onPress={createOrder}>
                                    <Text style={styles.checkoutButtonText}>Create Order</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: 20,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
        // margin: 10,
        width: "13%"
    },
    noDataText: {
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
    text: {
        fontSize: 18,
        color: "#fff",
        padding: 10,
        float: "left"
    },
    sectionText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: "000000",
        padding: 10,
        float: "left"
    },
    container: {
        flex: 1,
        padding: 25,
    },
    list: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
    },
    subTotal: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    orderNumber: {
        fontSize: 18,
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
    checkoutCard: {
        borderRadius: 5,
        marginTop: 20,
        padding: 20,
        backgroundColor: colors.lightGray,
    },
    textBox: {
        width: "96%",
        marginLeft: 13,
        fontSize: 16,
        padding: 10,
        marginTop: -20,
        borderColor: "#0B3270",
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: "#fff"
    },
    checkoutDetails: {
        alignSelf: 'flex-start',
        marginLeft: "6%",
        fontWeight: 'bold',
        fontSize: 18,
    },
    checkoutDetailsContainer: {
        alignItems: "center",
        marginBottom: "5%",
        flex: 3,
    },
    checkoutButton: {
        backgroundColor: "#0B3270",
        padding: 10,
        borderRadius: 25,
        width: "96%",
        marginVertical: 20,
    },
    checkoutButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
    }
});
