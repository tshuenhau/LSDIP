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
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Btn from "../components/Button";
import TextBox from "../components/TextBox";
import colors from '../colors';
import { firebase } from "../config/firebase";
import alert from "../components/Alert";

const SCREEN_WIDTH = Dimensions.get('window').width * 0.8;
const SCREEN_HEIGHT = Dimensions.get('window').height - 120;

export default function CreateOrder({ navigation }) {

    const [laundryItems, setLaundryItems] = useState([]);
    const [laundryCategories, setLaundryCategories] = useState([]);
    const [createModalData, setCreateModalData] = useState({});
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
    const [customerNumber, setCustomerNumber] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedButtonFilter, setSelectedButtonFilter] = useState("");
    const [cart, setCart] = useState([]);
    const [subTotal, setSubTotal] = useState(0);

    useEffect(() => {
        const laundryItem = firebase.firestore().collection('laundryItem');
        laundryItem
            .onSnapshot(querySnapshot => {
                const laundryItems = [];
                querySnapshot.forEach(doc => {
                    const { typeOfServices, laundryItemName, pricingMethod, price, fromPrice, toPrice, url } = doc.data();
                    if (pricingMethod === "Range") {
                        laundryItems.push({
                            id: doc.id,
                            typeOfServices,
                            laundryItemName,
                            pricingMethod,
                            fromPrice,
                            toPrice,
                            url,
                        })
                    } else {
                        laundryItems.push({
                            id: doc.id,
                            typeOfServices,
                            laundryItemName,
                            pricingMethod,
                            price,
                            url,
                        })
                    }
                })
                setLaundryItems(laundryItems)
            })

        const laundryCategory = firebase.firestore().collection('laundryCategory');
        laundryCategory
            .onSnapshot(querySnapshot => {
                const laundryCategories = [];
                querySnapshot.forEach(doc => {
                    const { serviceName } = doc.data();
                    laundryCategories.push({
                        serviceName,
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

    const addToCart = () => {
        const { laundryItemName, typeOfServices, pricingMethod, price, quantity, weight } = createModalData;
        if (pricingMethod === "Weight") {
            const displayQuantity = weight + "kg";
            const displayPrice = price * weight;
            console.log(subTotal);
            //setSubTotal(subTotal + (price * weight));
            setSubTotal(prevSubTotal => prevSubTotal + (price * weight));
            console.log(subTotal);
            setCart(prevCart => [...prevCart, { laundryItemName, typeOfServices, pricingMethod, ["price"]: displayPrice, ["quantity"]: displayQuantity, weight }]);
        } else {
            let found = false;
            cart.forEach(item => {
                if (item.laundryItemName === laundryItemName && item.typeOfServices === typeOfServices
                    && item.pricingMethod === pricingMethod && item.price === price) {
                    item.quantity += quantity;
                    found = true;
                    setCart(cart);
                }
            });
            if (!found) {
                setCart(prevCart => [...prevCart, { laundryItemName, typeOfServices, pricingMethod, price, quantity }]);
            }
            //setSubTotal(subTotal + (price * quantity));
            console.log(subTotal);
            setSubTotal(prevSubTotal => prevSubTotal + (price * quantity));
            console.log(subTotal);
        }

        setCreateModalVisible(false);
    }

    const removeFromCart = (item) => {
        const cartCopy = cart.filter((x) => x != item);
        if (item.pricingMethod === "Weight") {
            setSubTotal(subTotal - (item.price));
        } else {
            setSubTotal(subTotal - (item.price * item.quantity));
        }

        setCart(cartCopy);
    }

    const handleItemClick = (laundryItem) => {
        if (laundryItem.pricingMethod === "Range") {
            setCreateModalData({ ...laundryItem, ["price"]: laundryItem.fromPrice, ["quantity"]: 1, ["edit"]: false });
        } else if (laundryItem.pricingMethod === "Weight") {
            // minimum load for weight is 3kg
            setCreateModalData({ ...laundryItem, ["weight"]: 3, ["quantity"]: 1 });
        } else {
            setCreateModalData({ ...laundryItem, ["quantity"]: 1, ["edit"]: false });
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

    const handleNavigateToSummary = () => {
        if (cart.length == 0) {
            alert("Cart is empty!", "", [
                {
                    text: "Ok",
                    onPress: () => {
                        console.log("Closed");
                    },
                },
            ]);
        } else {
            setCheckoutModalVisible(false);
            console.log(subTotal);
            navigation.navigate('Order Summary', { cart: cart, subTotal: subTotal, customerNumber: customerNumber })
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
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
                                    <Image source={laundryItem.url} style={styles.card_image} />
                                    <View style={styles.text_container}>
                                        <Text style={styles.card_title}>{laundryItem.typeOfServices} {laundryItem.laundryItemName}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <View style={styles.totalContainer}>
                        {/* cart headers */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Service</Text>
                            <Text style={styles.tableHeaderText}>Name</Text>
                            <Text style={styles.tableHeaderText}>Price</Text>
                            <Text style={styles.tableHeaderText}>Qty</Text>
                            <Text style={styles.tableHeaderText}>Action</Text>
                        </View>
                        {/* cart display */}
                        <ScrollView style={styles.tableBody}>
                            {cart.map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableRowText}>{item.typeOfServices}</Text>
                                    <Text style={styles.tableRowText}>{item.laundryItemName}</Text>
                                    <Text style={styles.tableRowText}>{item.price}</Text>
                                    <Text style={styles.tableRowText}>{item.quantity}</Text>
                                    <FontAwesome
                                        style={styles.deleteIcon}
                                        name="trash-o"
                                        color='red'
                                        onPress={() => removeFromCart(item)}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.checkoutSection}>
                            <TextBox style={styles.textBox} value={"Total Price: $" + subTotal} />
                            <Btn onClick={() => setCheckoutModalVisible(true)} title="Checkout" style={{ width: "48%", margin: 5 }} />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Add to cart modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={createModalVisible}
            >
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>

                                <Text style={{ fontSize: 38, fontWeight: "800", marginBottom: 20 }}>Add to Cart</Text>
                                <View style={styles.textView}>
                                    <Text style={styles.itemText}><b>Item Name:</b> {createModalData.typeOfServices} {createModalData.laundryItemName} </Text>
                                    <Text style={styles.itemText}><b>Pricing Method:</b> {createModalData.pricingMethod} </Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                                        {createModalData != undefined && createModalData.pricingMethod !== "Weight"
                                            ? <Text style={styles.itemText}><b>Price:</b> {createModalData.price}</Text>
                                            : <Text style={styles.itemText}><b>Input weight:</b> {createModalData.weight} kg</Text>
                                        }
                                        {createModalData != undefined && createModalData.pricingMethod !== "Weight" &&
                                            < FontAwesome
                                                style={styles.editIcon}
                                                name="edit"
                                                color='green'
                                                onPress={() => handleChange(true, "edit")}
                                            />
                                        }
                                    </View>
                                </View>

                                {createModalData != undefined && createModalData.pricingMethod === "Range" && createModalData.edit &&
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
                                {createModalData != undefined && createModalData.pricingMethod == "Flat" && createModalData.edit &&
                                    <TextBox placeholder="Price" onChangeText={text => handleChange(text, "price")} defaultValue={createModalData.price} />
                                }
                                {createModalData != undefined && createModalData.pricingMethod === "Weight" &&
                                    <TextBox placeholder="kg" onChangeText={text => handleChange(text, "weight")} defaultValue={createModalData.weight} />
                                }

                                {createModalData != undefined && createModalData.pricingMethod !== "Weight" &&
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
                                    </View>
                                }

                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => addToCart()} title="Add" style={{ width: "48%" }} />
                                    <Btn onClick={() => setCreateModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: colors.dismissBlue }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Customer Number */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={checkoutModalVisible}
            >
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>

                                <Text style={{ fontSize: 38, fontWeight: "800", marginBottom: 20 }}>Customer Details</Text>

                                <TextBox placeholder="Phone number" onChangeText={text => setCustomerNumber(text)} defaultValue={customerNumber} />

                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => handleNavigateToSummary()} title="Checkout" style={{ width: "48%" }} />
                                    <Btn onClick={() => setCheckoutModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: colors.dismissBlue }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    editIcon: {
        fontSize: 25,
        marginLeft: 20,
    },
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
        borderColor: colors.darkBlue,
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
        width: 200,
        height: 200,
        boxShadow: "10px 10px 17px -12px rgba(0,0,0,0.75)"
    },
    card_image: {
        width: 200,
        height: 200,
        borderRadius: 10
    },
    text_container: {
        position: "absolute",
        width: 200,
        height: 50,
        bottom: 0,
        padding: 5,
        backgroundColor: "rgba(0,0,0, 0.3)",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    textBox: {
        fontWeight: "bold",
        fontSize: 14,
    },
    deleteIcon: {
        fontSize: 20,
        margin: 10,
    },
    card_title: {
        color: "white",
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    textView: {
        width: "100%",
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        marginLeft: 40
    },
    itemText: {
        // flex: 1,
        fontSize: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        width: '50%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'justify',
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
        flex: 4,
        flexWrap: 'wrap',
        margin: 10,
        justifyContent: 'space-evenly',
        alignContent: 'flex-start',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.darkBlue,
        padding: 10,
        borderRadius: 25
    },
    selectedButton: {
        backgroundColor: colors.darkBlue,
        borderWidth: 1,
        borderColor: colors.darkBlue,
        padding: 10,
        borderRadius: 25
    },
    totalContainer: {
        position: 'sticky',
        flex: 2,
        top: 10,
        height: SCREEN_HEIGHT,
        marginTop: 20,
        marginBottom: 20,
        marginRight: 15,
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
    checkoutSection: {
        alignItems: "center",
        marginBottom: "5%",
        width: "90%",
        padding: 14
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
        flex: 1,
        fontSize: 12
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom: 20
    },
    tableRowText: {
        marginTop: 8,
        flex: 1,
        fontSize: 12
    },
    image: {
        width: 200,
        height: 200,
    }
})