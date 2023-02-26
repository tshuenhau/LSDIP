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
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { TabView, SceneMap } from 'react-native-tab-view';
import { firebase } from "../config/firebase";

export default function CreateOrder() {

    const [index, setIndex] = React.useState(0);
    const [expandedItem, setExpandedItem] = useState(null);
    const [laundryItems, setLaundryItems] = useState([]);
    const laundry_item = firebase.firestore().collection('laundryItem');

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

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedItem === id) {
            setExpandedItem(null);
        } else {
            setExpandedItem(id);
        }
    };

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
                        <Text style={styles.itemText}>Upper Pricing: {item.price} </Text>
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
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
        />
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