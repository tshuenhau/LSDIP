import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    UIManager,
    ScrollView,
    Platform,
} from 'react-native';
import TextBox from "../components/TextBox";
import Checkbox from "expo-checkbox";
import { firebase } from '../config/firebase';
import colors from '../colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import InvoiceLine from '../components/InvoiceLine';
import { sub } from 'react-native-reanimated';
import { pick } from 'lodash';
import * as Print from 'expo-print';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderSummary(props) {

    const { cart, subTotal, customerNumber } = props.route.params;
    const [pickupfee, setPickUpFee] = useState(0);

    

    const initialOrderValues = {
        orderDate: firebase.firestore.FieldValue.serverTimestamp(),
        customerName: "",
        customerAddress: "",
        customerNumber: customerNumber,
        pickupDate: "",
        deliveryDate: "",
        description: "",
        pickup: false,
        requireDelivery: false,
        express: false,
        redeemPoints: false,
        pointsDiscount: 0,
    }

    const [totalPrice, setTotalPrice] = useState(subTotal);
    const [orderValues, setOrderValues] = useState(initialOrderValues);
    const orderItem = firebase.firestore().collection('orderItem');
    const orders = firebase.firestore().collection("orders");
    const [selectedPrinter, setSelectedPrinter] = React.useState();
    const users = firebase.firestore().collection('users');

    useEffect(() => {
        users
            .where("number", "==", customerNumber)
            .limit(1)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    console.log('No documents found');
                } else {
                    const { name, address, points } = querySnapshot.docs[0].data();
                    const updatedOrderValues = {
                        ...orderValues,
                        customerName: name,
                        customerAddress: address,
                        // need to update when admin point management is implemented
                        points,
                        pointsDiscount: points * 0.01,
                    }
                    console.log(updatedOrderValues);
                    setOrderValues(updatedOrderValues);
                }
            })
    }, [])

    const html = () => OrderPage(props);

    const print = async () => {
        console.log("order:" + orderValues.customerName);
        // On iOS/android prints the given html. On web prints the HTML from the current page.
        await Print.printAsync({
            html,
            printerUrl: selectedPrinter?.url, // iOS only
        });
    };

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

    const handleExpressCheck = () => {
        if (orderValues.express) {
            setTotalPrice(totalPrice / 2);
        } else {
            setTotalPrice(totalPrice * 2);
        }
        setOrderValues({ ...orderValues, express: !orderValues.express })
    }

    const handleRedeemPoints = () => {

        if (orderValues.redeemPoints) {
            setTotalPrice(totalPrice + orderValues.pointsDiscount);
        } else {
            setTotalPrice(totalPrice - orderValues.pointsDiscount);
        }
        setOrderValues({ ...orderValues, redeemPoints: !orderValues.redeemPoints })
    }

    const createOrder = async () => {
        console.log(cart);
        const batch = firebase.firestore().batch();
        const orderItemIds = [];

        // Creating orderItem Ids
        cart.forEach((item) => {
            if (item.pricingMethod !== "Weight") {
                const { laundryItemName, typeOfServices, pricingMethod, price, quantity } = item;
                /*
                for (let i = 0; i < item.quantity; i++) {
                    const docRef = orderItem.doc();
                    batch.set(docRef, { laundryItemName, typeOfServices, pricingMethod, price });
                    orderItemIds.push(docRef.id);
                */
                const docRef = orderItem.doc();
                batch.set(docRef, { laundryItemName, typeOfServices, pricingMethod, price, quantity });
                orderItemIds.push(docRef.id);
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
                    // customerNumber: orderValues.customerNumber,
                    description: orderValues.description,
                    endDate: null,
                    totalPrice: subTotal + pickupfee,
                    orderStatus: "Pending Wash",
                    receiveFromWasherDate: null,
                    sendFromWasherDate: null,
                    staffID: await getUserId(),
                    outletId: "bTvPBNfMLkBmF9IKEQ3n", //this is default, assuming one outlet
                    orderDate: firebase.firestore.Timestamp.fromDate(new Date()),
                    orderItemIds: orderItemIds, // Add order item IDs to order
                });

                if (orderValues.customerAddress.length > 0) { //customer is a member
                    const newPointValue = Number(orderValues.redeemPoints ? 0 : orderValues.points) + Math.floor(totalPrice);
                    console.log(newPointValue);
                    users
                        .where("number", "==", customerNumber)
                        .update({
                            points: newPointValue,
                        })

                }
                setOrderValues(initialOrderValues);
                navigation.navigate('Home');
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

    function handleCheck(){
        setOrderValues({...orderValues, pickup : !orderValues.pickup})
    };

    function handlePickUpChange() {
        setPickUpFee(!orderValues.pickup * 10)
    }


    

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
                    onPress={() => props.navigation.navigate('Create Order')}
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
                            <TextBox style={styles.textBox} onChangeText={name => setOrderValues({ ...orderValues, customerName: name })} defaultValue={orderValues.customerName} />
                            <Text style={styles.checkoutDetails}>Customer Number</Text>
                            <TextBox style={styles.textBox} defaultValue={orderValues.customerNumber} editable={false} selectTextOnFocus={false} />
                            <Text style={styles.checkoutDetails}>Order Description</Text>
                            <TextBox style={styles.textBox} onChangeText={newDescription => setOrderValues({ ...orderValues, description: newDescription })} />
                            <View style={styles.checkboxContainer}>
                            <Text style={styles.checkboxLabel}>Do you need laundry pick up? ($10)</Text>
                                <Checkbox
                                style={{marginLeft: 20, marginBottom: 2 }}
                                disabled={false}
                                value={orderValues.pickup}
                                onValueChange={() => {handleCheck(), handlePickUpChange()}}
                                />

                            </View >
                                
                            <View style={styles.checkboxContainer}>
                                <Text style={styles.checkboxLabel}>Express</Text>
                                <Checkbox
                                    disabled={false}
                                    style={{ marginLeft: 20, marginBottom: 2 }}
                                    value={orderValues.express}
                                    onValueChange={() => handleExpressCheck()}
                                />
                            </View>

                            <View style={styles.checkboxContainer}>
                                <Text style={styles.checkboxLabel}>Redeem Points: {orderValues.points}</Text>
                                <Checkbox
                                    disabled={false}
                                    style={{ marginLeft: 20, marginBottom: 2 }}
                                    value={orderValues.redeemPoints}
                                    onValueChange={() => handleRedeemPoints()}
                                />
                            </View>
                        </View>
                        <View style={styles.orderDetails}>
                            <Text style={styles.subTotal}>Order Details</Text>
                            <View style={styles.orderDetailsBreakdown}>
                                <InvoiceLine label={"Subtotal"} value={subTotal} />
                                {
                                    orderValues.express &&
                                    <InvoiceLine label={"Express"} value={subTotal} />
                                }
                                {/* pending CRM module */}
                                <InvoiceLine label={"Membership Discount"} value={0} />
                                {/* pending CRM module */}
                                <InvoiceLine label={"Voucher Discount"} value={0} />
                                <InvoiceLine label={"Pick up Fee"} value={pickupfee} />
                            </View>
                            <View >
                                <InvoiceLine label={"Amount Due"} value={subTotal + pickupfee} total={true} />
                                {orderValues.redeemPoints &&
                                    <InvoiceLine label={"Redeem Points"} value={orderValues.pointsDiscount} discount={true} />
                                }
                            </View>
                            <View >
                                <InvoiceLine label={"Amount Due"} value={totalPrice} total={true} />
                                <TouchableOpacity style={styles.checkoutButton} onPress={createOrder}>
                                    <Text style={styles.checkoutButtonText}>Create Order</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.checkoutButton} onPress={print}>
                                    <Text style={styles.checkoutButtonText}>Print Invoice</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        marginLeft: "6%",
        marginBottom: 10,
        alignItems: 'flex-end'
    },
    checkboxLabel: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    btn: {
        borderRadius: 20,
        backgroundColor: colors.darkBlue,
        justifyContent: "center",
        alignItems: "center",
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
        borderColor: colors.darkBlue,
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
        backgroundColor: colors.darkBlue,
        padding: 10,
        borderRadius: 25,
        width: "96%",
        marginVertical: 20,
    },
    checkoutButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
    },
    orderDetails: {
        flex: 2,
        backgroundColor: "#f8f4f4",
        borderRadius: 5,
        padding: 25,
        margin: 10
    },
    orderDetailsBreakdown: {
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginVertical: 10
    }
});
