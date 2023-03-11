import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import { FontAwesome } from '@expo/vector-icons';
import alert from '../components/Alert'
import Btn from "../components/Button";
import TextBox from "../components/TextBox";
import { SelectList } from 'react-native-dropdown-select-list'
import Toast from 'react-native-toast-message';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LaundryItemList() {

    const [laundryItemList, setLaundryItemList] = useState([]);
    const [expandedLaundryItem, setExpandedLaundryItem] = useState(null);
    const laundryItem = firebase.firestore().collection('laundryItem');
    const laundryCItem = firebase.firestore().collection('laundryCategory');
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [upvalues, setUpValues] = useState('');
    const [data, setData] = useState([]);

    const pricingMethods = [
        { key: '1', value: 'Flat' },
        { key: '2', value: 'Range' },
        { key: '3', value: 'Weight' },
    ]

    useEffect(() => {
        laundryItem.onSnapshot(querySnapshot => {
            const laundryItemList = [];
            querySnapshot.forEach(doc => {
                const { typeOfServices, laundryItemName, pricingMethod, price } = doc.data();
                laundryItemList.push({
                    id: doc.id,
                    typeOfServices,
                    laundryItemName,
                    pricingMethod,
                    price
                });
            });
            setLaundryItemList(laundryItemList);
        });
    }, []);

    useEffect(() => {
        laundryCItem.onSnapshot(querySnapshot => {
            const data = [];
            querySnapshot.forEach(doc => {
                const { serviceName } = doc.data();
                data.push({
                    key: doc.id,
                    value: serviceName,
                });
            });
            setData(data);
        });
    }, []);

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedLaundryItem === id) {
            setExpandedLaundryItem(null);
        } else {
            setExpandedLaundryItem(id);
        }
    };

    const deleteLaundryItem = (laundry) => {
        return alert(
            "Confirmation",
            "Are you sure you want to delete this Laundry Item?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        laundryItem.doc(laundry.id)
                            .delete()
                            .then(() => {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Laundry Item deleted',
                                });
                            }).catch((err) => {
                                console.log(err);
                            })
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancelled`"),
                    style: "cancel"
                }
            ]
        );
    }

    const openModel = (laundry) => {
        setUpValues(laundry)
        setUpdateModalVisible(!updateModalVisible)

    }

    function handleChange(text, eventName) {
        setUpValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const updateLaundry = () => {
        if (upvalues.typeOfServices.length > 0 &&
            upvalues.laundryItemName.length > 0 &&
            upvalues.pricingMethod.length > 0) {
            laundryItem.doc(upvalues.id)
                .update({
                    typeOfServices: upvalues.typeOfServices,
                    laundryItemName: upvalues.laundryItemName,
                    pricingMethod: upvalues.pricingMethod,
                    price: upvalues.price,
                }).then(() => {
                    console.log("Update Success")
                    Toast.show({
                        type: 'success',
                        text1: 'Laundry updated',
                    });
                    setUpdateModalVisible(!updateModalVisible);
                }).catch((err) => {
                    console.log(err)
                })
        }
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeader2}>
                    <Text style={styles.outletName}>{item.laundryItemName} </Text>
                    <Text style={styles.itemText}> /Service: {item.typeOfServices} </Text>
                </View>
                <View style={styles.cardHeaderIcon}>
                    <FontAwesome
                        style={styles.outletIcon}
                        name="edit"
                        color='green'
                        onPress={() => openModel(item)}
                    />
                    <FontAwesome
                        style={styles.outletIcon}
                        name="trash-o"
                        color='red'
                        onPress={() => deleteLaundryItem(item)}
                    />
                </View>
            </View>
            {expandedLaundryItem === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Laundry Item Name: {item.laundryItemName} </Text>
                        <Text style={styles.itemText}>Laundry Category: {item.typeOfServices} </Text>
                        <Text style={styles.itemText}>Pricing Method: {item.pricingMethod} </Text>
                        <Text style={styles.itemText}>Price: S${item.price} </Text>
                    </View>

                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View>
            <View style={styles.container}>
                <View>
                    <FlatList
                        data={laundryItemList}
                        keyExtractor={laundryItem => laundryItem.id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.noDataText}>No Data Found!</Text>
                        }
                    />
                </View >
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={updateModalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Update Laundry Item</Text>
                            <TextBox placeholder={upvalues.laundryItemName} onChangeText={text => handleChange(text, "laundryItemName")} />
                            <View style={styles.selectList}>
                                <SelectList
                                    placeholder={upvalues.typeOfServices}
                                    data={data}
                                    setSelected={(val) => handleChange(val, "typeOfServices")}
                                    save="value"
                                />
                            </View>
                            <View style={styles.selectList}>
                                <SelectList
                                    data={pricingMethods}
                                    placeholder={upvalues.pricingMethod}
                                    setSelected={(val) => handleChange(val, "pricingMethod")}
                                    save="value"
                                />
                            </View>
                            <TextBox placeholder={upvalues.price} onChangeText={text => handleChange(text, "price")} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => updateLaundry()} title="Update" style={{ width: "48%" }} />
                                <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal >
        </View >
    );
}

const styles = StyleSheet.create({
    selectList: {
        // flex: 1,
        marginTop: 20,
        width: "92%",
    },
    noDataText: {
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
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
        fontSize: 16,
        fontWeight: 'light',
        paddingTop: 4
    },
    card: {
        backgroundColor: '#fff',
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
    },
    outletName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    outletIcon: {
        fontSize: 25,
        margin: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    cardHeader2: {
        flexDirection: 'row',
        padding: 20,
    },
    cardHeaderIcon: {
        flexDirection: 'row',
        padding: 16,
    },
    deleteIcon: {
        fontSize: 25,
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
});