import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    Alert,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
    ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
// import alert from '../components/Alert';
import colors from '../colors';
import { TabView, SceneMap } from 'react-native-tab-view';
import { firebase } from "../config/firebase";
import moment from "moment";
import Toast from 'react-native-toast-message';
import * as Print from 'expo-print';

export default function CreateOrder() {
    const initialOrderValues = {
        //orderDate: moment().format("YYYY-MM-DD HH:mm:ss a")
        orderDate: firebase.firestore.FieldValue.serverTimestamp(),
        customerName: "",
        customerAddress: "",
        customerPhone: "",
        pickupDate: "",
        deliveryDate: "",
        customerNumber: "",
    }

    const [index, setIndex] = React.useState(0);
    const [expandedItem, setExpandedItem] = useState(null);
    const [laundryItems, setLaundryItems] = useState([]);
    const laundry_item = firebase.firestore().collection('laundryItem');
    const [createModalData, setCreateModalData] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const today = moment().format("YYYY-MM-DD");
    const orderItems = firebase.firestore().collection('orderItem');
    const orders = firebase.firestore().collection("orders");
    const [customerDetails, setCustomerDetails] = useState({
        customerName: "",
        customerNumber: ""
    });
    const [orderValues, setOrderValues] = useState(initialOrderValues);
    const [cart, setCart] = useState([]);
    let orderId = "";

    useEffect(() => {
        laundry_item
            .get()
            .then(querySnapshot => {
                const laundryItems = [];
                querySnapshot.forEach(doc => {
                    const { laundryItemName, price, pricingMethod, typeOfServices } = doc.data();
                    laundryItems.push({
                        id: doc.id,
                        laundryItemName,
                        typeOfServices,
                        price,
                        pricingMethod
                    })
                })
                setLaundryItems(laundryItems)
            })
    }, [])

    function handleChange(text, eventName) {
        setCreateModalData(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

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

    const clearState = () => {
        cart.length = 0;
        console.log(cart.length);
    }

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedItem === id) {
            setExpandedItem(null);
        } else {
            setExpandedItem(id);
        }
    };

    const addToCart = () => {
        // TODO addToCart
        /*
        if(cart.length == 0) {
            console.log("cart is empty");
            orders.add(orderValues)
            .then(function(docRef) {
                orderId = docRef.id;
                cart.push(orderId);
                console.log("new order id: ", orderId)
                console.log(cart.toString);
            }).catch((err) => {
                console.log(err);
            })
        }     
        console.log(orderId);
        */
        const { laundryItemName, typeOfServices, pricingMethod, description, price } = createModalData;
        setCart(prevCart => [...prevCart, { laundryItemName, typeOfServices, pricingMethod, description, price }]);
        setCreateModalVisible(false);
        console.log(createModalData);
        console.log("added item");
    }

    const openModal = (laundryItem) => {
        console.log(laundryItem);
        setCreateModalData(laundryItem);
        setCreateModalVisible(true);
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.itemName}>{item.laundryItemName} </Text>
            </View>
            {expandedItem === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Pricing Method: {item.pricingMethod} </Text>
                        <Text style={styles.itemText}>Pricing: {item.price} </Text>
                    </View>
                    <View style={styles.cardButtons}>
                        <Ionicons
                            style={styles.outletIcon}
                            name="add-circle"
                            color="#0B3270"
                            onPress={() => openModal(item)}
                        />
                    </View>
                </View>
            )}

        </TouchableOpacity>
    );

    const WetWash = () => (
        <FlatList
            data={laundryItems.filter(l => l.typeOfServices === "Wet Wash")}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
                <Text style={styles.noDatesText}>No available items</Text>
            }
        />
    );

    const DryClean = () => (
        <FlatList
            data={laundryItems.filter(l => l.typeOfServices === "Dry Clean")}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
                <Text style={styles.noDatesText}>No available items</Text>
            }
        />
    );

    const Others = () => (
        <FlatList
            data={laundryItems.filter(l => l.typeOfServices === "Alteration")}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
                <Text style={styles.noDatesText}>No available items</Text>
            }
        />
    );

    const renderScene = SceneMap({
        wetWash: WetWash,
        dryClean: DryClean,
        others: Others
    });

    const [routes] = React.useState([
        { key: 'wetWash', title: 'Wet Wash' },
        { key: 'dryClean', title: 'Dry Clean' },
        { key: 'others', title: 'Others' },
    ]);

    const totalPrice = cart.reduce((acc, item) => acc + Number(item.price), 0);

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

            setCart([]);
            setOrderValues(initialOrderValues);
            setCustomerDetails({ customerName: "", customerNumber: "" });
            // alert("Order created successfully");
            Toast.show({
                type: 'success',
                text1: 'Order Created',
            });

            

            // Print.printAsync({
            //       html,
            // });
            
        } catch (error) {
            console.error(error);
            Alert.alert("Error creating order. Please try again.");
        }
    };

    const deleteItem = (item) => {
        /*
        return alert(
            "Are you sure you want to delete this item?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        const index = cart.indexOf(item);
                        console.log(index);
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancelled`"),
                    style: "cancel"
                }
            ]
        );
        */
       const cartCopy = cart.map((x) => x);
       let index = cartCopy.indexOf(item);
       console.log(index);
       cartCopy.splice(index, 1);
       //console.log("cartcopy", cartCopy);
       setCart(cartCopy);
    }

    return (
        <ScrollView>
        <View>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
            />

            {/* Create Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Add Item to Cart</Text>
                            <Text style={styles.itemText}>Item Name: {createModalData.laundryItemName} </Text>
                            <Text style={styles.itemText}>Type of Service: {createModalData.typeOfServices} </Text>
                            <Text style={styles.itemText}>Pricing Method: {createModalData.pricingMethod} </Text>
                            <TextBox placeholder="Description" onChangeText={text => handleChange(text, "description")} defaultValue={createModalData.description} />
                            <Text style={styles.itemText}>Input price: </Text>
                            <TextBox placeholder="Price" onChangeText={text => handleChange(text, "price")} defaultValue={createModalData.price} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => addToCart()} title="Add" style={{ width: "48%" }} />
                                <Btn onClick={() => setCreateModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Cart Table */}
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Item Type</Text>
                    <Text style={styles.tableHeaderText}>Description</Text>
                    <Text style={styles.tableHeaderText}>Item Name</Text>
                    <Text style={styles.tableHeaderText}>Price</Text>
                </View>
                <ScrollView style={styles.tableBody}>
                    {cart.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableRowText}>{item.typeOfServices}</Text>
                            <Text style={styles.tableRowText}>{item.description}</Text>
                            <Text style={styles.tableRowText}>{item.laundryItemName}</Text>
                            <Text style={styles.tableRowText}>{item.price}</Text>
                            <FontAwesome
                                style={styles.outletIcon}
                                name="trash-o"
                                color='red'
                                onPress={() => deleteItem(item)}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
            <View style= {{alignItems:"center", marginBottom:"5%", marginLeft:"5%", width:"90%"}}>
                <TextBox style={styles.textBox} placeholder="Customer Name" onChangeText={name => setCustomerDetails({ ...customerDetails, customerName: name })} value={customerDetails.customerName} />
                <TextBox style={styles.textBox} placeholder="Customer Phone" onChangeText={phone => setCustomerDetails({ ...customerDetails, customerNumber: phone })} value={customerDetails.customerNumber} />
                </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={createOrder}>
                    <Text style={styles.checkoutButtonText}>Checkout</Text>
                </TouchableOpacity>
        </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    tableContainer: {
        marginTop: 20,
        marginBottom: 20,
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        elevation: 3,
        width: "80%",
    },

    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    tableHeaderText: {
        fontWeight: "bold",
        fontSize: 16,
        flex: 1,
    },
    tableBody: {
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent:"center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom:20
    },
    tableRowText: {
        marginTop:8,
        fontSize: 16,
        flex: 1,
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
    },
    button: {
        height: 60,
        width: "40%",
        backgroundColor: "#0B3270",
        color: "#fff",
        fontSize: 20,
        borderRadius: 25,
        marginTop: 20,
        marginLeft: "auto",
        marginRight: "auto"
    },
    cardBody: {
        padding: 16,
    },
    itemContainer: {
        backgroundColor: colors.lightGray,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        paddingVertical: 8,
        paddingRight: 20,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#fff',
        width: "60%",
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
    },
    itemName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    outletIcon: {
        fontSize: 25,
        margin: 10,
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    btn: {
        padding: 10,
        borderRadius: 25,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff"
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    textBox: {
        width: "96%",
        marginLeft:13,
        fontSize: 16,
        padding: 10,
        borderColor: "#0B3270",
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor:"#fff"
      },
});

