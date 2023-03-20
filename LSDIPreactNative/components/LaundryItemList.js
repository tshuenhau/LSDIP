import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    TextInput,
    LayoutAnimation,
    UIManager,
    Platform,
    ScrollView
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
    const [upvalues, setUpValues] = useState({});
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [values, setValues] = useState({});
    const [modalVisible, setModalVisible] = useState(false);


    const pricingMethods = [
        { key: '1', value: 'Flat' },
        { key: '2', value: 'Range' },
        { key: '3', value: 'Weight' },
    ]

    useEffect(() => {
        laundryItem.onSnapshot(querySnapshot => {
            const laundryItemList = [];
            querySnapshot.forEach(doc => {
                const { typeOfServices, laundryItemName, pricingMethod, price, fromPrice, toPrice } = doc.data();
                if (pricingMethod === "Range") {
                    laundryItemList.push({
                        id: doc.id,
                        typeOfServices,
                        laundryItemName,
                        pricingMethod,
                        fromPrice,
                        toPrice,
                    })
                } else {
                    laundryItemList.push({
                        id: doc.id,
                        typeOfServices,
                        laundryItemName,
                        pricingMethod,
                        price,
                    })
                }
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

    const filteredLaundryItemList = laundryItemList.filter((laundry) =>
        laundry.laundryItemName.toLowerCase().includes(searchQuery.toLowerCase())
    );

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


    function handleChange(text, eventName) {
        setValues(prev => {
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
            if (upvalues.pricingMethod === "Range") {
                laundryItem.doc(upvalues.id)
                    .update({
                        typeOfServices: upvalues.typeOfServices,
                        laundryItemName: upvalues.laundryItemName,
                        pricingMethod: upvalues.pricingMethod,
                        fromPrice: upvalues.fromPrice,
                        toPrice: upvalues.toPrice,
                    }).then(() => {
                        setUpValues({});
                        console.log("Update Success")
                        Toast.show({
                            type: 'success',
                            text1: 'Laundry updated',
                        });
                        setUpdateModalVisible(false);
                    }).catch((err) => {
                        console.log(err)
                    })
            } else {
                laundryItem.doc(upvalues.id)
                    .update({
                        typeOfServices: upvalues.typeOfServices,
                        laundryItemName: upvalues.laundryItemName,
                        pricingMethod: upvalues.pricingMethod,
                        price: upvalues.price,
                    }).then(() => {
                        setUpValues({});
                        console.log("Update Success")
                        Toast.show({
                            type: 'success',
                            text1: 'Laundry updated',
                        });
                        setUpdateModalVisible(false);
                    }).catch((err) => {
                        console.log(err)
                    })
            }
        }
    }

    function createLaundryItem() {
        laundryItem.add(values)
            .then(() => {
                setModalVisible(false);
                setValues({});
                Toast.show({
                    type: 'success',
                    text1: 'Laundry item created',
                });
                console.log("Success");
            }).catch((err) => {
                console.log(err);
            })
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
                    <Text style={styles.smallText}>Service: {item.typeOfServices} </Text>
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
                        <Text style={styles.itemText}><b>Laundry Item Name: </b>{item.laundryItemName} </Text>
                        <Text style={styles.itemText}><b>Laundry Category: </b>{item.typeOfServices} </Text>
                        <Text style={styles.itemText}><b>Pricing Method: </b>{item.pricingMethod} </Text>
                        {item.pricingMethod === "Range"
                            ?
                            <View>
                                <Text style={styles.itemText}><b>From Price: </b>S${item.fromPrice} </Text>
                                <Text style={styles.itemText}><b>To Price: </b>S${item.toPrice} </Text>
                            </View>
                            :
                            <Text style={styles.itemText}><b>Price: </b>S${item.price} </Text>
                        }
                    </View>

                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View>
            <View style={styles.header}>
                <View style={styles.searchnfilter}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search by Name"
                        />
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setModalVisible(!modalVisible)}
                    style={styles.createBtn}>
                    <Text style={styles.text}>Create Laundry Item</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.listtext}>Laundry Item List</Text>

            <View>
                <FlatList
                    data={filteredLaundryItemList}
                    keyExtractor={laundryItem => laundryItem.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.noDataText}>No Data Found!</Text>
                    }
                />
            </View >

            {/*for create laundry item*/}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
            >
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>
                                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Laundry Item</Text>
                                <TextBox placeholder="Laundry Item Name" onChangeText={text => handleChange(text, "laundryItemName")} />
                                <View style={{
                                    // height: 42,
                                    width: "92%",
                                    borderRadius: 25,
                                    marginTop: 20
                                }}>
                                    <SelectList
                                        data={data}
                                        placeholder="Choose service"
                                        searchPlaceholder="Search service"
                                        search={false}
                                        setSelected={(val) => handleChange(val, "typeOfServices")}
                                        save="value"
                                    />
                                </View>
                                <View style={{
                                    // height: 42,
                                    width: "92%",
                                    borderRadius: 25,
                                    marginTop: 20
                                }}>
                                    <SelectList
                                        data={pricingMethods}
                                        placeholder="Choose pricing method"
                                        searchPlaceholder="Search pricing method"
                                        search={false}
                                        setSelected={(val) => handleChange(val, "pricingMethod")}
                                        save="value"
                                    />
                                </View>
                                {values != undefined && values.pricingMethod === "Range" &&
                                    <View style={styles.rangeText}>
                                        <View style={styles.rangeTextContainer}>
                                            <TextInput style={styles.rangeTextBox} placeholder="From price" onChangeText={text => handleChange(text, "fromPrice")} />
                                        </View>
                                        <View style={styles.rangeTextContainer}>
                                            <TextInput style={styles.rangeTextBox} placeholder="To price" onChangeText={text => handleChange(text, "toPrice")} />
                                        </View>
                                    </View>
                                }
                                {values != undefined && values.pricingMethod == "Flat" &&
                                    <TextBox placeholder="Price" onChangeText={text => handleChange(text, "price")} />
                                }
                                {values != undefined && values.pricingMethod === "Weight" &&
                                    <TextBox placeholder="Price per kg" onChangeText={text => handleChange(text, "price")} />
                                }
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => createLaundryItem()} title="Create" style={{ width: "48%" }} />
                                    <Btn onClick={() => setModalVisible(!modalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal >

            {/* update laundry item */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={updateModalVisible}>
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
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
                                {upvalues != undefined && upvalues.pricingMethod === "Range" &&
                                    <View style={styles.rangeText}>
                                        <View style={styles.rangeTextContainer}>
                                            <TextInput style={styles.rangeTextBox} placeholder="From price" onChangeText={text => handleChange(text, "fromPrice")} defaultValue={upvalues.fromPrice} />
                                        </View>
                                        <View style={styles.rangeTextContainer}>
                                            <TextInput style={styles.rangeTextBox} placeholder="To price" onChangeText={text => handleChange(text, "toPrice")} defaultValue={upvalues.toPrice} />
                                        </View>
                                    </View>
                                }
                                {upvalues != undefined && upvalues.pricingMethod == "Flat" &&
                                    <TextBox placeholder="Price" onChangeText={text => handleChange(text, "price")} defaultValue={upvalues.price} />
                                }
                                {upvalues != undefined && upvalues.pricingMethod === "Weight" &&
                                    <TextBox placeholder="Price per kg" onChangeText={text => handleChange(text, "price")} defaultValue={upvalues.price} />
                                }
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => updateLaundry()} title="Update" style={{ width: "48%" }} />
                                    <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal >
        </View>


    );
}

const styles = StyleSheet.create({
    rangeText: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        width: "92%",
    },
    rangeTextContainer: {
        height: 42,
        width: "48%",
        borderRadius: 25,
        marginTop: 20,
    },
    rangeTextBox: {
        height: 42,
        borderRadius: 25,
        borderColor: "#0B3270",
        borderWidth: 1,
        paddingLeft: 15
    },
    selectList: {
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
    smallText: {
        fontSize: 15,
        fontWeight: 'light',
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
    createBtn: {
        borderRadius: 5,
        backgroundColor: colors.blue600,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 30,
        marginTop: 6,
        width: '23%',
        height: '74%'
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
        width: '50%',
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
    searchnfilter: {
        flexDirection: 'row',
        marginLeft: 10,
        width: "78%",
    },
    searchContainer: {
        marginVertical: 15,
        marginLeft: 30,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: '#f5f5f5',
        backgroundColor: '#f5f5f5',
        alignItems: "center",
        flexDirection: "row",
        alignContent: "space-between"
    },
    searchInput: {
        height: 40,
        fontSize: 18,
        marginLeft: 60,
        paddingHorizontal: 10
    },
    searchbaricon: {
        height: 40
    }, searchInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: colors.gray,
        paddingHorizontal: 10,
        fontSize: 18,
        backgroundColor: colors.white,
        marginVertical: 10,
    },
    searchContainer: {
        justifyContent: "center",
        alignContent: "center",
        width: "96%",
        marginLeft: 10
    },
    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
    },
    header: {
        width: "97%",
        flexDirection: "row",
        marginTop: 40
    }
});