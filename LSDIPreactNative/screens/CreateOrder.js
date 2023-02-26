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
import React, { useState, useEffect } from "react";
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { TabView, SceneMap } from 'react-native-tab-view';
import { firebase } from "../config/firebase";
import moment from "moment";

export default function CreateOrder() {

    const [index, setIndex] = React.useState(0);
    const [expandedItem, setExpandedItem] = useState(null);
    const [laundryItems, setLaundryItems] = useState([]);
    const laundry_item = firebase.firestore().collection('laundryItem');
    const [createModalData, setCreateModalData] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const today = moment().format("YYYY-MM-DD");

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
        console.log(today);
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
                        <FontAwesome
                            style={styles.outletIcon}
                            color="black"
                            name="add"
                            onPress={() => openModal(item)}
                        />
                    </View>
                </View>
            )}

        </TouchableOpacity>
    );

    const Laundry = () => (
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
        laundry: Laundry,
        dryClean: DryClean,
        others: Others
    });

    const [routes] = React.useState([
        { key: 'laundry', title: 'Laundry' },
        { key: 'dryClean', title: 'Dry Clean' },
        { key: 'others', title: 'Others' },
    ]);

    return (
        <View>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
            />
            <Text>This is the placeholder for the summary</Text>


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
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Add Item to Cart</Text>
                            <Text style={styles.itemText}>Address: {createModalData.laundryItemName} </Text>
                            <Text style={styles.itemText}>Address: {createModalData.typeOfServices} </Text>
                            <Text style={styles.itemText}>Address: {createModalData.pricingMethod} </Text>
                            <TextBox placeholder="Price" onChangeText={text => handleChange(text, "price")} defaultValue={createModalData.price} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => addToCart()} title="Create" style={{ width: "48%" }} />
                                <Btn onClick={() => setCreateModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
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