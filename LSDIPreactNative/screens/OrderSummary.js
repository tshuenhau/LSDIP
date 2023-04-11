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
import { SelectList } from 'react-native-dropdown-select-list';
import axios from 'axios';
import * as geolib from 'geolib';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderSummary(props) {

    const { cart, subTotal, customerNumber } = props.route.params;

    const initialOrderValues = {
        orderDate: firebase.firestore.FieldValue.serverTimestamp(),
        customerName: "",
        customerAddress: "",
        customerNumber: customerNumber,
        customerEmail: "",
        pickupDate: "",
        deliveryDate: "",
        description: "",
        pickup: false,
        requireDelivery: false,
        express: false,
        redeemPoints: false,
        pickupCost: 0,
    }

    const [totalPrice, setTotalPrice] = useState(subTotal);
    const [CRMValues, setCRMValues] = useState({});
    const [transportationFee, setTransportationFee] = useState(0);
    const [orderValues, setOrderValues] = useState(initialOrderValues);
    // const [selectedPrinter, setSelectedPrinter] = React.useState();
    const [selectedOutlet, setSelectedOutlet] = useState("");
    const [outletList, setOutletList] = useState([]);
    const [invoiceNumber, setInvoiceNumber] = useState(0);
    const [membershipDiscount, setMembershipDiscount] = useState(0);
    const [membershipDiscountPercent, setMembershipDiscountPercent] = useState("");
    const orderItem = firebase.firestore().collection('orderItem');
    const orders = firebase.firestore().collection("orders");
    const users = firebase.firestore().collection('users');
    const crm = firebase.firestore().collection('crm');
    const invoice_number = firebase.firestore().collection('invoice_number');
    const membershipTier = firebase.firestore().collection('membership_tier');
    const logData = firebase.firestore().collection('log');
    const [log, setLog] = useState({});

    useEffect(() => {
        firebase.firestore().collection("outlet").get()
            .then((querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => doc.data().outletName + ' (' + doc.id + ')');
                setOutletList(data);
            });
    }, []);

    useEffect(() => {
        crm.doc('point_cash')
            .get()
            .then(doc => {
                setCRMValues({ pointCash: doc.data().value })
            })
        invoice_number.doc('invoiceNumber')
            .get()
            .then(doc => {
                setInvoiceNumber(doc.data().invoiceNumber);
            })
    }, [])

    useEffect(() => {
        users
            .where("number", "==", customerNumber)
            .limit(1)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    console.log('No documents found');
                } else {
                    const customerExpenditure = querySnapshot.docs[0].data().expenditure;
                    membershipTier
                        .get()
                        .then(querySnapshot => {
                            const membershipTiers = [];
                            querySnapshot.forEach((doc) => {
                                membershipTiers.push({ id: doc.id, ...doc.data() });
                            })
                            const sortedTiers = membershipTiers.sort((a, b) => a.expenditure - b.expenditure);
                            let customerTier;
                            for (let i = sortedTiers.length - 1; i >= 0; i--) {
                                if (customerExpenditure >= sortedTiers[i].expenditure) {
                                    customerTier = sortedTiers[i];
                                    break;
                                }
                            }
                            if (customerTier) {
                                const membershipDiscount = (Number(customerTier.discount) / 100) * subTotal;
                                setMembershipDiscountPercent(customerTier.discount);
                                setTotalPrice(totalPrice - membershipDiscount);
                                setMembershipDiscount(membershipDiscount);
                            }
                        })

                    if (querySnapshot.docs[0].data().address) {
                        const { name, address, points, email } = querySnapshot.docs[0].data();
                        const updatedOrderValues = {
                            ...orderValues,
                            customerName: name,
                            customerNumber: customerNumber,
                            customerAddress: address,
                            customerEmail: email,
                            points,
                        }
                        console.log(updatedOrderValues);
                        setOrderValues(updatedOrderValues);


                        // querySnapshot.forEach(doc => {
                        // Retrieve the user's address from the document
                        // address = doc.data().address;
                        console.log(`User's address: ${address}`);
                        const location1 = address;
                        const location2 = '10 Paya Lebar Rd Singapore 409057';
                        const apiKey = 'AIzaSyDcYq8n3h92G2HV4IdjWG5es4ioIHvKZc0';

                        // Make API request for location 1
                        const apiUrl1 = `https://maps.googleapis.com/maps/api/geocode/json?address=${location1}&key=${apiKey}`;
                        axios.get(apiUrl1)
                            .then(response => {
                                if (response.data.results.length === 0) {
                                    console.error('No results found for location:', location1);
                                }
                                const result = response.data.results[0];
                                const coords1 = {
                                    latitude: result.geometry.location.lat,
                                    longitude: result.geometry.location.lng
                                };

                                // Make API request for location 2
                                const apiUrl2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${location2}&key=${apiKey}`;
                                axios.get(apiUrl2)
                                    .then(response => {
                                        if (response.data.results.length === 0) {
                                            console.error('No results found for location:', location2);
                                        }
                                        const result = response.data.results[0];
                                        const coords2 = {
                                            latitude: result.geometry.location.lat,
                                            longitude: result.geometry.location.lng
                                        };

                                        // Calculate the distance between the two sets of coordinates
                                        const distanceInMeters = geolib.getDistance(coords1, coords2);
                                        console.log(`Distance between ${location1} and ${location2}: ${distanceInMeters} meters`);
                                        const transportationFee = Number((distanceInMeters / 500).toFixed(2));
                                        console.log(transportationFee);
                                        console.log("delivery fee is here!");
                                        setTransportationFee(transportationFee)
                                    }).catch(error => {
                                        console.error(error);
                                    });
                            }).catch(error => {
                                console.error(error);
                            });
                        // })
                    }
                }
            })
    }, [customerNumber])

    // const html = () => OrderPage(props);

    // const print = async () => {
    //     console.log("order:" + orderValues.customerName);
    //     // On iOS/android prints the given html. On web prints the HTML from the current page.
    //     await Print.printAsync({
    //         html,
    //         printerUrl: selectedPrinter?.url, // iOS only
    //     });
    // };

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
            setTotalPrice(totalPrice - subTotal);
        } else {
            setTotalPrice(totalPrice + subTotal);
        }
        setOrderValues({ ...orderValues, express: !orderValues.express })
    }

    const handleRedeemPoints = () => {
        const discountValue = CRMValues.pointCash * orderValues.points;
        if (orderValues.redeemPoints) {
            setTotalPrice(totalPrice + discountValue);
        } else {
            setTotalPrice(totalPrice - discountValue);
        }
        setOrderValues({ ...orderValues, redeemPoints: !orderValues.redeemPoints })
    }

    const handlePickUpChange = () => {
        if (orderValues.pickup) {
            setTotalPrice(totalPrice - transportationFee);
            setOrderValues({
                ...orderValues,
                pickup: !orderValues.pickup,
                pickupCost: 0,
                pickupDate: "",
            })
        } else {
            setTotalPrice(totalPrice + transportationFee);
            setOrderValues({
                ...orderValues,
                pickup: !orderValues.pickup,
                pickupCost: transportationFee,
                pickupDate: firebase.firestore.Timestamp.fromDate(new Date()),
            })
        }
    }

    const handleDeliveryChange = () => {
        if (orderValues.requireDelivery) {
            setTotalPrice(totalPrice - transportationFee);
            setOrderValues({ ...orderValues, requireDelivery: !orderValues.requireDelivery, deliveryCost: 0 })
        } else {
            setTotalPrice(totalPrice + transportationFee);
            setOrderValues({ ...orderValues, requireDelivery: !orderValues.requireDelivery, deliveryCost: transportationFee })
        }
    }

    const createOrder = async () => {
        /*if (!selectedOutlet) {
            Toast.show({
                type: "error",
                text1: "Please select an outlet",
            });
            return;
        }*/

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
                    invoiceNumber: invoiceNumber,
                    description: orderValues.description,
                    endDate: null,
                    totalPrice: subTotal,
                    orderStatus: "Pending Wash",
                    receiveFromWasherDate: null,
                    sendFromWasherDate: null,
                    staffID: await getUserId(),
                    outletId: "1RSi3QaKpvrHfh4ZVXNk", //hardcorded outlet id - lagoon 
                    //outletId: selectedOutlet.split('(')[1].split(')')[0], //this is default, assuming one outlet
                    orderDate: firebase.firestore.Timestamp.fromDate(new Date()),
                    orderItemIds: orderItemIds, // Add order item IDs to order
                });

                invoice_number.doc("invoiceNumber").update({ invoiceNumber: String(Number(invoiceNumber) + 1) });

                if (orderValues.customerAddress != undefined && orderValues.customerAddress.length > 0 && orderValues.redeemPoints) { // member redeemed points
                    users
                        .where("number", "==", customerNumber)
                        .get()
                        .then(querySnapshot => {
                            querySnapshot.forEach((doc) => {
                                users.doc(doc.id)
                                    .update({
                                        points: 0,
                                    })
                            })
                        })
                }

                //for log
                await logData.add({
                    ...log,
                    date: firebase.firestore.Timestamp.fromDate(new Date()),
                    staffID: await getUserId(),
                    outletId: "1RSi3QaKpvrHfh4ZVXNk",
                    outletName: "Lagoon Laundry",
                    logType: "Order",
                    logDetail: "Create Order"
                });

                setOrderValues(initialOrderValues);
                navigation.navigate('Home');
                Toast.show({
                    type: 'success',
                    text1: 'Order Created',
                });
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
                            {/*<View style={styles.checkoutDetailsContainer}>
                                <Text style={styles.checkoutDetails}>Outlet</Text>
                                <SelectList
                                    data={outletList}
                                    placeholder="Select Outlet"
                                    //setSelected={(val) => handleChange(val, "typeOfServices")}
                                    setSelected={(selectedOutlet) => {
                                        const id = selectedOutlet.split(' ')[1].slice(1, -1);
                                        setOrderValues({ ...orderValues, outletId: id });
                                        setSelectedOutlet(selectedOutlet)
                                    }}
                                />

                                </View>*/}
                            <Text style={styles.checkoutDetails}>Customer Name</Text>
                            <TextBox style={styles.textBox} onChangeText={name => setOrderValues({ ...orderValues, customerName: name })} defaultValue={orderValues.customerName} />
                            <Text style={styles.checkoutDetails}>Customer Number</Text>
                            <TextBox style={styles.textBox} defaultValue={orderValues.customerNumber} editable={false} selectTextOnFocus={false} />
                            <Text style={styles.checkoutDetails}>Order Description</Text>
                            <TextBox style={styles.textBox} onChangeText={newDescription => setOrderValues({ ...orderValues, description: newDescription })} />
                            {orderValues.customerAddress.length > 0 && <>
                                <View style={styles.checkboxContainer}>
                                    <Text style={styles.checkboxLabel}>Laundry Pickup (${transportationFee})</Text>
                                    <Checkbox
                                        style={{ marginLeft: 20, marginBottom: 2 }}
                                        disabled={false}
                                        value={orderValues.pickup}
                                        onValueChange={() => handlePickUpChange()}
                                    />
                                </View >

                                <View style={styles.checkboxContainer}>
                                    <Text style={styles.checkboxLabel}>Laundry Delivery (${transportationFee})</Text>
                                    <Checkbox
                                        style={{ marginLeft: 20, marginBottom: 2 }}
                                        disabled={false}
                                        value={orderValues.requireDelivery}
                                        onValueChange={() => handleDeliveryChange()}
                                    />
                                </View >

                                <View style={styles.checkboxContainer}>
                                    <Text style={styles.checkboxLabel}>Redeem Points: {orderValues.points}</Text>
                                    <Checkbox
                                        disabled={false}
                                        style={{ marginLeft: 20, marginBottom: 2 }}
                                        value={orderValues.redeemPoints}
                                        onValueChange={() => handleRedeemPoints()}
                                    />
                                </View>
                            </>
                            }

                            <View style={styles.checkboxContainer}>
                                <Text style={styles.checkboxLabel}>Express</Text>
                                <Checkbox
                                    disabled={false}
                                    style={{ marginLeft: 20, marginBottom: 2 }}
                                    value={orderValues.express}
                                    onValueChange={() => handleExpressCheck()}
                                />
                            </View>
                        </View>
                        <View style={styles.orderDetails}>
                            <Text style={styles.subTotal}>Order Details</Text>
                            <View style={styles.orderDetailsBreakdown}>
                                <InvoiceLine label={"Subtotal"} value={subTotal} />
                                {orderValues.express &&
                                    <InvoiceLine label={"Express"} value={subTotal} />
                                }
                                {/* flat $10 charge for now */}
                                {orderValues.pickup &&
                                    <InvoiceLine label={"Pick up Fee"} value={transportationFee} />
                                }
                                {/* flat $10 charge for now */}
                                {orderValues.requireDelivery &&
                                    <InvoiceLine label={"Delivery Fee"} value={10} />
                                }
                            </View>
                            <View>
                                {orderValues.customerAddress &&
                                    <InvoiceLine label={"Membership Discount " + "(" + membershipDiscountPercent + "%)"} value={membershipDiscount} discount={true} />
                                }
                                {orderValues.redeemPoints &&
                                    <InvoiceLine label={"Redeem Points"} value={CRMValues.pointCash * orderValues.points} discount={true} />
                                }
                            </View>
                            <View >
                                <InvoiceLine label={"Amount Due"} value={totalPrice} total={true} />
                                <TouchableOpacity style={styles.checkoutButton} onPress={createOrder}>
                                    <Text style={styles.checkoutButtonText}>Create Order</Text>
                                </TouchableOpacity>
                                {/*<TouchableOpacity style={styles.checkoutButton} onPress={props.navigation.navigate('Customer Invoice', { customerNumber: customerNumber, 
                                    customerName: orderValues.customerName, cart: cart, })}>
                                    <Text style={styles.checkoutButtonText}>Print Invoice</Text>
                                </TouchableOpacity>*/}
                                <TouchableOpacity style={styles.checkoutButton} onPress={() => {
                                    props.navigation.navigate('Customer Invoice', {
                                        customerNumber: customerNumber,
                                        customerName: orderValues.customerName, cart: cart, subTotal: subTotal, express: orderValues.express, pickup: orderValues.pickup,
                                        delivery: orderValues.requireDelivery, redeempt: orderValues.redeemPoints, totalPrice: totalPrice, selectedOutlet: selectedOutlet,
                                        pickUpFee: transportationFee, expressAmt: subTotal, points: (CRMValues.pointCash * orderValues.points).toFixed(2), invoiceNumber: invoiceNumber
                                    })
                                }}
                                >
                                    <Text style={styles.checkoutButtonText}>Print Invoice</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView >
    )
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
        backgroundColor: colors.blue700,
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
        backgroundColor: colors.blue700,
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
