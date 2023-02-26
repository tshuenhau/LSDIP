import React, { useState, useEffect } from "react";
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
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CO() {

    const initialValues = {
        laundryItemName: "",
        typeofServices: "",
        upperPricing: "",
        lowerPricing: "",
        pricingMethod: ""
    };

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [values, setValues] = useState(initialValues);
    const [expandedItem, setExpandedItem] = useState(null);
    const allItems = firebase.firestore().collection('laundryItem');
    const orderItems = firebase.firestore().collection('orderItem');
    const orders = firebase.firestore().collection("orders");
    const outlet = "";
    const customer = "";

    useEffect(() => {
        allItems.onSnapshot(querySnapshot => {
            const itemList = [];
            querySnapshot.forEach(doc => {
                const { laundryItemName, typeOfServices, upperPricing, lowerPricing, pricingMethod } = doc.data();
                itemList.push({
                    id: doc.id,
                    laundryItemName,
                    typeOfServices,
                    upperPricing,
                    lowerPricing,
                    pricingMethod
                });
            });
            setItemList(itemList);
        });
       }, []);

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedItem === id) {
            setExpandedItem(null);
        } else {
            setExpandedItem(id);
        }
    };

    const clearState = () => {
        setValues({ ...initialValues });
    }

    function handleChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    function getLaundrylist(itemList) {
        console.log("getlaundrylist function");
        console.log(itemList);
        if (itemList === undefined || itemList.length === 0) {
            return <ul>No Items</ul>;
        }
        const data = itemList.filter(element => element.typeOfServices == 'Wet Wash');
        console.log(data);
        return data;
        //return result;
    }

    function getDrycleanlist(itemList) {    
        console.log("getdrycleanlist function");
        if (itemList === undefined || itemList.length === 0) {
            return <ul>No Items</ul>;
        }
        return itemList.filter(element => element.typeOfServices == 'Dry Clean');
    }

    function getOtherlist() {
        console.log("getotherlist function");
        console.log(itemList);
        if (itemList === undefined || itemList.length === 0) {
            return <ul>No Items</ul>;
        }
        return itemList.filter(element => element.typeOfServices != 'Wet Wash' && 
            element.typeOfServices != 'Dry Clean');
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
                        <Text style={styles.itemText}>Upper Pricing: {item.upperPricing} </Text>
                        <Text style={styles.itemText}>Lower Pricing: {item.lowerPricing} </Text>
                    </View>
                    <View style={styles.cardButtons}>
                        <FontAwesome
                            style={styles.outletIcon}
                            color="black"
                            name="add"
                            onPress={() => addItem(item)}
                        />
                    </View>
                </View>
            )}

        </TouchableOpacity>
    );

    return (
        <View>

            <View style={styles.view}>
                <Text>Outlet Name: </Text>
            </View>

            {/* Create Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setCreateModalVisible(!createModalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Outlet</Text>
                            <TextBox placeholder="Outlet Name" onChangeText={text => handleChange(text, "outletName")} />
                            <TextBox placeholder="Outlet Address" onChangeText={text => handleChange(text, "outletAddress")} />
                            <TextBox placeholder="Outlet Number" onChangeText={text => handleChange(text, "outletNumber")} />
                            <TextBox placeholder="Outlet Email" onChangeText={text => handleChange(text, "outletEmail")} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => createOutlet()} title="Create" style={{ width: "48%" }} />
                                <Btn onClick={() => setCreateModalVisible(!createModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <View>
                {!(itemList.length > 0) && <Text> No Data Found! </Text>}
                <View>
                    <button style={styles.button} >Show Laundry Items</button>
                    <FlatList 
                        data = {getLaundrylist(itemList)}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                    />
                    <button style={styles.button} >Show Dry Clean Items</button>
                    <FlatList
                        data = {getDrycleanlist(itemList)}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                    />
                    <button style={styles.button} >Show Other Items</button>
                    <FlatList
                        data = {getOtherlist(itemList)}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                    />
                </View >
            </View>

        </View>

    )
}

const styles = StyleSheet.create({
    button: {
        height: 60,
        width: "80%",
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
    }
})