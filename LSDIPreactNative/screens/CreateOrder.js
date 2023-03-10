import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    TouchableOpacity,
} from 'react-native'
import React, { useState, useEffect } from "react";
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Btn from "../components/Button";
import TextBox from "../components/TextBox";
import colors from '../colors';
import { firebase } from "../config/firebase";

export default function CreateOrder() {

    const [laundryItems, setLaundryItems] = useState([]);
    const [laundryCategories, setLaundryCategories] = useState([]);
    const [createModalData, setCreateModalData] = useState({});
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedButtonFilter, setSelectedButtonFilter] = useState("");
    const orderItems = firebase.firestore().collection('orderItem');
    const [orderValues, setOrderValues] = useState(initialOrderValues);
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const initialOrderValues = {
        //orderDate: moment().format("YYYY-MM-DD HH:mm:ss a")
        orderDate: firebase.firestore.FieldValue.serverTimestamp(),
        customerName: "",
        customerAddress: "",
        customerNumber: "",
        pickupDate: "",
        deliveryDate: "",
        customerNumber: "",
    }

    useEffect(() => {
        const laundryItem = firebase.firestore().collection('laundryItem');
        laundryItem
            .get()
            .then(querySnapshot => {
                const laundryItems = [];
                querySnapshot.forEach(doc => {
                    const { typeOfServices, laundryItemName, pricingMethod, price, fromPrice, toPrice } = doc.data();
                    if (pricingMethod === "Range") {
                        laundryItems.push({
                            id: doc.id,
                            typeOfServices,
                            laundryItemName,
                            pricingMethod,
                            fromPrice,
                            toPrice,
                        })
                    } else {
                        laundryItems.push({
                            id: doc.id,
                            typeOfServices,
                            laundryItemName,
                            pricingMethod,
                            price,
                        })
                    }
                })
                setLaundryItems(laundryItems)
            })

        const laundryCategory = firebase.firestore().collection('laundryCategory');
        laundryCategory
            .get()
            .then(querySnapshot => {
                const laundryCategories = [];
                querySnapshot.forEach(doc => {
                    const { serviceName } = doc.data();
                    laundryCategories.push({
                        serviceName,
                        // selected: false
                    });
                })
                setLaundryCategories(laundryCategories);
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

    const addToCart = () => {
        // i think adding to cart can be looping through quantity and adding each qty as a line item 
        // to help pinpoint a specific piece in the case of order issue
        // needs a function to calculate the current total to display in the cart segment
        ///*
        const { laundryItemName, typeOfServices, pricingMethod, price, quantity } = createModalData;
        let found = false;
        cart.forEach(item => {
            if(item.laundryItemName === laundryItemName && item.typeOfServices === typeOfServices 
                && item.pricingMethod === pricingMethod && item.price === price) {
                item.quantity += quantity;
                found = true;
                setCart(cart);
            }
        });
        if (!found) {
            setCart(prevCart => [...prevCart, { laundryItemName, typeOfServices, pricingMethod, price, quantity }]);
        }
        
        setCreateModalVisible(false);
        //*/
        console.log("todo add to cart");
        console.log(createModalData);
    }

    const removeFromCart = (item) => {
        const cartCopy = cart.map((x) => x);
        let index = cartCopy.indexOf(item);
        console.log(index);
        cartCopy.splice(index, 1);
        //console.log("cartcopy", cartCopy);
        setCart(cartCopy);
    }

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

    const handleItemClick = (laundryItem) => {
        if (laundryItem.pricingMethod === "Range") {
            setCreateModalData({ ...laundryItem, ["price"]: laundryItem.fromPrice, ["quantity"]: 1 });
        } else {
            setCreateModalData({ ...laundryItem, ["quantity"]: 1 });
        }
        setCreateModalVisible(true);
    }

    const filteredLaundryItemList = laundryItems.filter((laundryItem) => {
        if (selectedButtonFilter && selectedButtonFilter !== laundryItem.typeOfServices) {
            return false;
        }
        return laundryItem.laundryItemName.toLowerCase().includes(searchQuery.toLowerCase())
    });

    const handleMinus = () => {
        setCreateModalData(prevState => {
            if (prevState.quantity >= 2) {
                return {
                    ...prevState,
                    quantity: prevState.quantity - 1
                }
            } else {
                return {
                    ...prevState
                }
            }
        })
    }

    const handlePlus = () => {
        setCreateModalData(prevState => {
            return {
                ...prevState,
                quantity: prevState.quantity + 1
            }
        })
    }

    const handleFilterButtonClick = (serviceName) => {
        if (selectedButtonFilter == serviceName) {
            setSelectedButtonFilter("");
        } else {
            setSelectedButtonFilter(serviceName);
        }
    }

    return (
        <View>
            <View style={styles.orderPage}>
                <View style={styles.filterContainer}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search laundry item"
                        />
                        <View style={styles.buttonContainer}>
                            {
                                laundryCategories.map((category, key) =>
                                    <View key={key} style={{ marginRight: 10 }}>
                                        <TouchableOpacity
                                            onPress={() => handleFilterButtonClick(category.serviceName)}
                                            style={
                                                category.serviceName === selectedButtonFilter
                                                    ? styles.selectedButton
                                                    : styles.filterButton
                                            }
                                        >
                                            <Text style={
                                                category.serviceName === selectedButtonFilter
                                                    ? { color: "white" }
                                                    : { color: "black" }
                                            }>
                                                {category.serviceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                        </View>
                    </View>

                    {filteredLaundryItemList.map((laundryItem, key) =>
                        <View key={key} style={styles.container} >
                            <TouchableOpacity style={styles.card_template} onPress={() => handleItemClick(laundryItem)}>
                                {/* to store url of icon in db */}
                                <Image source={'https://picsum.photos/200'} style={styles.card_image} />
                                <View style={styles.text_container}>
                                    <Text style={styles.card_title}>{laundryItem.typeOfServices} {laundryItem.laundryItemName}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={styles.totalContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Item Type</Text>
                        {/* <Text style={styles.tableHeaderText}>Description</Text> */}
                        <Text style={styles.tableHeaderText}>Item Name</Text>
                        <Text style={styles.tableHeaderText}>Price</Text>
                        <Text style={styles.tableHeaderText}>Qty</Text>
                        {/* <Text style={styles.tableHeaderText}>Qty</Text> */}
                    </View>

                    {/* todo cart display */}
                    <ScrollView style={styles.tableBody}>
                        {cart.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.tableRowText}>{item.typeOfServices}</Text>
                                <Text style={styles.tableRowText}>{item.laundryItemName}</Text>
                                <Text style={styles.tableRowText}>{item.price}</Text>
                                <Text style={styles.tableRowText}>{item.quantity}</Text>
                                <FontAwesome
                                    style={styles.outletIcon}
                                    name="trash-o"
                                    color='red'
                                    onPress={() => removeFromCart(item)}
                                />
                            </View>
                        ))} 
                    </ScrollView>

                    <View style={{ alignItems: "center", marginBottom: "5%", marginLeft: "5%", width: "90%" }}>
                        <TextBox style={styles.textBox} placeholder="Total Price: "  />
                        <Btn onClick={() => addToCart()} title="Checkout" style={{ width: "48%", margin: 5 }} />
                    </View>
                </View>
                
            </View>

            {/* Add to cart modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Add to Cart</Text>
                            <Text style={styles.itemText}> {createModalData.typeOfServices} {createModalData.laundryItemName} </Text>
                            <Text style={styles.itemText}>Pricing Method: {createModalData.pricingMethod} </Text>
                            <Text style={styles.itemText}>Input price: {createModalData.price}</Text>
                            {createModalData != undefined && createModalData.pricingMethod === "Range" &&
                                <View style={styles.rangeText}>
                                    <Slider
                                        onValueChange={text => handleChange(text, "price")}
                                        minimumValue={parseInt(createModalData.fromPrice)}
                                        maximumValue={parseInt(createModalData.toPrice)}
                                        value={parseInt(createModalData.fromPrice)}
                                        step={1}
                                    />
                                </View>
                            }
                            {createModalData != undefined && createModalData.pricingMethod == "Flat" &&
                                <TextBox placeholder="Price" onChangeText={text => handleChange(text, "price")} defaultValue={createModalData.price} />
                            }
                            {createModalData != undefined && createModalData.pricingMethod === "Weight" &&
                                <TextBox placeholder="Price per kg" onChangeText={text => handleChange(text, "price")} defaultValue={createModalData.price} />
                            }
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    onPress={() => handleMinus()}>
                                    <Entypo name="minus" size={24} color="black" />
                                </TouchableOpacity>
                                <View style={styles.quantityBorder}>
                                    <TextInput style={styles.quantityTextBox} placeholder="Quantity" onChangeText={text => handleChange(text, "quantity")} value={createModalData.quantity} />
                                </View>
                                <TouchableOpacity
                                    onPress={() => handlePlus()}>
                                    <Entypo name="plus" size={24} color="black" />
                                </TouchableOpacity>
                            </View >

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => addToCart()} title="Add" style={{ width: "48%" }} />
                                <Btn onClick={() => setCreateModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    rangeText: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        width: "92%",
        margin: 20,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
    },
    quantityBorder: {
        width: "48%",
        margin: 20,
    },
    quantityTextBox: {
        height: 42,
        borderRadius: 25,
        borderColor: "#0B3270",
        borderWidth: 1,
        textAlign: "center",
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
    },
    container: {
        margin: 10,
    },
    card_template: {
        width: 250,
        height: 250,
        boxShadow: "10px 10px 17px -12px rgba(0,0,0,0.75)"
    },
    card_image: {
        width: 250,
        height: 250,
        borderRadius: 10
    },
    text_container: {
        position: "absolute",
        width: 250,
        height: 30,
        bottom: 0,
        padding: 5,
        backgroundColor: "rgba(0,0,0, 0.3)",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    card_title: {
        color: "white",
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    itemText: {
        flex: 1,
        fontSize: 16,
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
    orderPage: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    filterContainer: {
        flexDirection: 'row',
        flex: 5,
        flexWrap: 'wrap',
        margin: 10,
        justifyContent: 'space-evenly',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#0B3270',
        padding: 10,
        borderRadius: 25
    },
    selectedButton: {
        backgroundColor: '#0B3270',

        borderWidth: 1,
        borderColor: '#0B3270',
        padding: 10,
        borderRadius: 25
    },
    totalContainer: {
        flex: 2,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        elevation: 3,
    },
    tableHeader: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    tableHeaderText: {
        fontWeight: "bold",
        fontSize: 12,
        flex: 1,
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom: 20
    },
    tableRowText: {
        marginTop: 8,
        fontSize: 16,
        flex: 1,
    },
    image: {
        width: 200,
        height: 200,
    }
})