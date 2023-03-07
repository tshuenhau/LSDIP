import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
} from 'react-native'
import React, { useState, useEffect } from "react";
import { firebase } from "../config/firebase";
import Btn from "../components/Button";

export default function CreateOrder() {

    const [laundryItems, setLaundryItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const laundry_item = firebase.firestore().collection('laundryItem');
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

    const addToCart = () => {
        console.log("todo add to cart");
    }

    const removeFromCart = () => {
        console.log("todo remove from cart");
    }

    return (
        <View style={styles.orderPage}>
            <View style={styles.buttonsContainer}>
                {laundryItems.map((laundryItem, key) =>
                    <View key={key} >
                        <View onClick={() => addToCart()}>
                            <Text>{laundryItem.laundryItemName}</Text>
                            {/* to store url of icon in db */}
                            <Image source={'https://picsum.photos/200'} style={styles.image} />
                            <Text>${laundryItem.price}</Text>
                        </View>

                    </View>
                )}
            </View>
            <View style={styles.totalContainer}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Item Type</Text>
                    <Text style={styles.tableHeaderText}>Description</Text>
                    <Text style={styles.tableHeaderText}>Item Name</Text>
                    <Text style={styles.tableHeaderText}>Price</Text>
                </View>

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
    )
}

const styles = StyleSheet.create({
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