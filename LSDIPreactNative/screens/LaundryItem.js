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
    ScrollView,
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";
import { doc, addDoc, getFirestore, collection, getDoc, getDocs, QuerySnapshot, deleteDoc, GeoPoint, updateDoc } from "firebase/firestore";
import { SelectList } from 'react-native-dropdown-select-list'
import LaundryList from "../components/LaundryItemList";
import AsyncStorage from '@react-native-async-storage/async-storage';


if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LaundryItem({ navigation }) {

    const [modalVisible, setModalVisible] = useState(false);
    const [values, setValues] = useState(initialValues);
    const laundryItem = firebase.firestore().collection('laundryItem');
    const laundryCItem = firebase.firestore().collection('laundryCategory');
    const [data, setData] = useState([]);
    const [user, setUser] = useState(false);
    const db = firebase.firestore()


    //for getting user
    const getUserRole = async () => {
        try {
            const role = await AsyncStorage.getItem('role');
            if (role !== null) {
                return id;
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        try {
            const getUserId = async () => {
                try {
                    const id = await AsyncStorage.getItem('userId');
                    if (id !== null) {
                        getDoc(doc(db, "users", id)).then(docData => {
                            if (docData.exists()) {
                                //console.log(docData.data())
                                setUser(docData.data())
                            }
                        })
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            getUserId();
        } catch (e) {
            console.log("User Id does not exist in DB")
        }
    }, [])

    const pricingMethods = [
        { key: '1', value: 'Flat' },
        { key: '2', value: 'Range' },
        { key: '3', value: 'Weight' },
    ]

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

    //for laundry Item
    const initialValues = {
        typeOfServices: "",
        laundryItemName: "",
        pricingMethod: "",
        price: "",
    };

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedOutlet === id) {
            setExpandedService(null);
        } else {
            setExpandedService(id);
        }
    };

    //for laundry item
    const clearState = () => {
        setValues({ ...initialValues });
    }

    //for laundry items
    function handleChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }


    function createLaundryItem() {
        laundryItem.add(values)
            .then(() => {
                setModalVisible(!modalVisible);
                clearState;
                console.log("Success");
            }).catch((err) => {
                console.log(err);
            })
    }

    return (
        <ScrollView>
            <View>
                {/*for create laundry item*/}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                        setModalVisible(!modalVisible);
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>

                                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Laundry Item</Text>
                                <TextBox placeholder="Laundry Item Name" onChangeText={text => handleChange(text, "laundryItemName")} />
                                {/*<TextBox placeholder="Laundry Category" onChangeText={text => handleChange(text, "typeOfServices")} />*/}
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
                                        setSelected={(val) => handleChange(val, "typeOfServices")}
                                        save="value"
                                    />
                                    {/*<SelectList
                                    data={initialServices}
                                    setSelected={(val) => handleChange(val, "typeOfServices")}
                                    save="value"
                        />*/}
                                </View>
                                {/*<TextBox placeholder="Pricing Method (Flat, Range, Weight)" onChangeText={text => handleChange(text, "pricingMethod")} /> */}
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
                                        setSelected={(val) => handleChange(val, "pricingMethod")}
                                        save="value"
                                    />
                                </View>
                                <TextBox placeholder="Price" onChangeText={text => handleChange(text, "price")} />

                                {/*<TextBox placeholder="Lower Price (For Range Only)" onChangeText={text => handleChange(text, "lowerPrice")} />
                            <TextBox placeholder="Price (Upper for Range Only)" onChangeText={text => handleChange(text, "upperPrice")} />*/}
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => createLaundryItem()} title="Create" style={{ width: "48%" }} />
                                    <Btn onClick={() => setModalVisible(!modalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal >


                <View style={styles.view2}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(!modalVisible)}
                        style={styles.btn}>
                        <Text style={styles.text}>Create Laundry Item</Text>
                    </TouchableOpacity>
                    {/* {user.role ==="Admin" ?
                <View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Service")}
                    style={styles.btn}>
                    <Text style={styles.text}>Services</Text>
                </TouchableOpacity>
                </View>
                :null
                } */}
                </View>

                <View>
                    <Text style={styles.listtext}>Laundry Item List</Text>
                    <LaundryList />
                </View>

            </View >
        </ScrollView>
    )
}

const styles = StyleSheet.create({
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    deleteIcon: {
        fontSize: 25,
    },
    view: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    view2: {
        width: "92%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        flexDirection: 'row',

    },
    btn: {
        padding: 10,
        borderRadius: 25,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10
    },
    btn2: {
        padding: 5,
        height: 100,
        width: 250,
        borderRadius: 25,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        padding: 10
    },
    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
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