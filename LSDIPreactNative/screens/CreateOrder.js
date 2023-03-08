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
import Slider from '@react-native-community/slider';
import Btn from "../components/Button";
import TextBox from "../components/TextBox";
import colors from '../colors';
import { firebase } from "../config/firebase";

export default function CreateOrder() {

    const [laundryItems, setLaundryItems] = useState([]);
    // const [laundryCategories, setLaundryCategories] = useState([]);
    const [createModalData, setCreateModalData] = useState({});
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

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

        // const laundryCategory = firebase.firestore().collection('laundryCategory');
        // laundryCategory
        //     .get()
        //     .then(querySnapshot => {
        //         const laundryCategories = [];
        //         querySnapshot.forEach(doc => {
        //             const { serviceName } = doc.data();
        //             laundryCategories.push(serviceName);
        //         })
        //         setLaundryCategories(laundryCategories);
        //     })
    }, [])

    function handleChange(text, eventName) {
        setCreateModalData(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const addToCart = () => {
        // i think adding to cart can be looping through quantity and adding each qty as a line item 
        // to help pinpoint a specific piece in the case of order issue
        // needs a function to calculate the current total to display in the cart segment
        console.log("todo add to cart");
        console.log(createModalData);
    }

    const removeFromCart = () => {
        console.log("todo remove from cart");
    }

    const handleItemClick = (laundryItem) => {
        if (laundryItem.pricingMethod === "Range") {
            setCreateModalData({ ...laundryItem, ["price"]: laundryItem.fromPrice, ["quantity"]: 1 });
        } else {
            setCreateModalData({ ...laundryItem, ["quantity"]: 1 });
        }
        setCreateModalVisible(true);
    }

    const filteredLaundryItemList = laundryItems.filter((laundryItem) =>
        laundryItem.laundryItemName.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <View>
            <View style={styles.orderPage}>
                <View style={styles.buttonsContainer}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search laundry item"
                        />
                    </View>
                    <View>

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
                    </View>

                    {/* todo cart display */}
                    {/* {cart.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableRowText}>item type</Text>
                        <Text style={styles.tableRowText}>item desc</Text>
                        <Text style={styles.tableRowText}>item name</Text>
                        <Text style={styles.tableRowText}>price</Text>
                        <FontAwesome
                            style={styles.outletIcon}
                            name="trash-o"
                            color='red'
                            onPress={() => deleteItem(item)}
                        />
                    </View>
                ))} */}
                    <Btn onClick={() => addToCart()} title="Checkout" style={{ width: "48%", margin: 5 }} />
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
                            {/* <TextBox placeholder="Description" onChangeText={text => handleChange(text, "description")} defaultValue={createModalData.description} /> */}
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
    buttonsContainer: {
        flexDirection: 'row',
        flex: 5,
        flexWrap: 'wrap',
        margin: 10,
        justifyContent: 'space-evenly',
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
        alignContent: "center",
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