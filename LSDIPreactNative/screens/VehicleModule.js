import {
    View,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    LayoutAnimation,
    UIManager,
    Platform,
    ScrollView
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SelectList } from 'react-native-dropdown-select-list';
import { Text, FlatList } from 'react-native-web';
import { doc, addDoc, getFirestore, collection, getDoc, getDocs, QuerySnapshot, deleteDoc, GeoPoint, updateDoc } from "firebase/firestore";
import { firebase } from "../config/firebase";
import colors from '../colors';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import alert from '../components/Alert';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function VehicleModule() {

    //initial vehicle values
    const initialValues = {
        driver: "",
        location: new firebase.firestore.GeoPoint(0, 0),
        mileage: 0,
        numberPlate: "",
        vehicleStatus: "",
    };

    const [modalVisible, setModalVisible] = useState(false);
    const [newValues, setNewValues] = useState(initialValues);
    const [vehicles, setVehicles] = useState([])
    const [expandedVehicle, setExpandedVehicle] = useState(null);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [upvalues, setUpValues] = useState('');
    const [user, setUser] = useState(false);
    const db = firebase.firestore();
    const vehicle = firebase.firestore().collection('vehicles');

    const vehicleStatuses = [
        { key: 1, value: "Operating" },
        { key: 2, value: "Servicing" },
        { key: 3, value: "Broke Down" },
        { key: 4, value: "Inactive" },
    ];

    useEffect(() => {
        db.collection('vehicles')
            .onSnapshot(
                querySnapshot => {
                    const vehicles = []
                    querySnapshot.forEach((doc) => {
                        const { driver, location, mileage, numberPlate, vehicleStatus } = doc.data()
                        vehicles.push({
                            id: doc.id,
                            driver,
                            location,
                            mileage,
                            numberPlate,
                            vehicleStatus,
                        })
                    })
                    setVehicles(vehicles)
                    //console.log(vehicles)
                }
            )
    }, [])

    //set user details for conditional rendering
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

    const createVehicle = () => {
        if (newValues.numberPlate && newValues.vehicleStatus) {
            addDoc(collection(db, "vehicles"), {
                driver: "",
                location: new firebase.firestore.GeoPoint(0, 0),
                mileage: 0,
                numberPlate: newValues.numberPlate,
                vehicleStatus: newValues.vehicleStatus,

            }).then(() => {
                Toast.show({
                    type: 'success',
                    text1: 'Vehicle created',
                });
                setNewValues(initialValues);
                setErrorMessage("");
            }).catch((error) => {
                console.log(error);
            })
            setModalVisible(!modalVisible);
        } else {
            setErrorMessage("Please fill up all fields");
        }
    }

    //delete
    const deleteVehicle = (id) => {
        return alert(
            "Confirmation",
            "Are you sure you want to delete this Vehicle?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        deleteDoc(doc(db, 'vehicles', id))
                            .then(() => {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Vehicle deleted',
                                });
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

    const openModel = (vehicle) => {
        setUpValues(vehicle)
        setUpdateModalVisible(true)
    }

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedVehicle === id) {
            setExpandedVehicle(null);
        } else {
            setExpandedVehicle(id);
        }
    };

    //update values in vehicle modal
    const handleUpdate = (text, eventName) => {
        setUpValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const handleNewVechicleChange = (text, eventName) => {
        setNewValues(prev => {
            return {
                ...prev,
                [eventName]: text,
            }
        })
    }

    function updateVehicle(id) {
        if (id != "") {
            console.log(upvalues)
            vehicle.doc(id).update({
                driver: upvalues.driver,
                location: upvalues.location,
                mileage: upvalues.mileage,
                numberPlate: upvalues.numberPlate,
                vehicleStatus: upvalues.vehicleStatus,
            })
                .then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Vehicle updated',
                    });
                    console.log("Update Success")
                    setUpdateModalVisible(false);
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
                    <Text style={styles.outletName}>{item.numberPlate} </Text>
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
                        onPress={() => deleteVehicle(item.id)}
                    />
                </View>
            </View>
            {expandedVehicle === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Driver: {item.driver} </Text>
                        <Text style={styles.itemText}>Location: {item.location.latitude} ,{item.location.longitude} </Text>
                        <Text style={styles.itemText}>Mileage: {item.mileage} </Text>
                        <Text style={styles.itemText}>Number Plate: {item.numberPlate} </Text>
                        <Text style={styles.itemText}>Status: {item.vehicleStatus} </Text>
                    </View>

                </View>
            )}
        </TouchableOpacity>
    );

    return (

        <View>
            {/* Create Vehicle Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
            >
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>

                                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Vehicle</Text>
                                <TextBox value={newValues.numberPlate} onChangeText={(numberPlate) => handleNewVechicleChange(numberPlate, "numberPlate")} placeholder="Number Plate"></TextBox>
                                <View style={styles.statusSelectList}>
                                    <SelectList
                                        data={vehicleStatuses}
                                        setSelected={(vehicleStatus) => handleNewVechicleChange(vehicleStatus, "vehicleStatus")}
                                        save="value"
                                        search={false}
                                    />
                                </View>
                                {errorMessage &&
                                    <View style={styles.errorMessageContainer}>
                                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                                    </View>
                                }
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => createVehicle()} title="Create" style={{ width: "48%" }} />
                                    <Btn onClick={() => setModalVisible(!modalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal >

            <View style={styles.view}>
                {user.role === "Admin" ?
                    <TouchableOpacity
                        onPress={() => setModalVisible(!modalVisible)}
                        style={styles.btn}>
                        <Text style={styles.text}>Create New Vehicle</Text>
                    </TouchableOpacity>
                    : null
                }

            </View>

            <View style={styles.container}>
                {user.role === "Admin" || user.role === "Staff" ?
                    <View>
                        <FlatList
                            data={vehicles}
                            keyExtractor={item => item.id}
                            renderItem={renderItem}
                            ListEmptyComponent={
                                <Text style={styles.noVehiclesText}>No available timings</Text>
                            }
                        />
                    </View >
                    : null
                }
                {user.role === "Driver" ?
                    <View>
                        <Text> No. </Text>
                    </View >
                    : null
                }
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={updateModalVisible}>
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>
                                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Update Vehicle</Text>
                                <TextBox placeholder={upvalues.numberPlate} onChangeText={text => handleUpdate(text, "numberPlate")} />
                                <View style={styles.statusSelectList}>
                                    <SelectList
                                        placeholder={upvalues.vehicleStatus}
                                        data={vehicleStatuses}
                                        setSelected={(vehicleStatus) => handleUpdate(vehicleStatus, "vehicleStatus")}
                                        save="value"
                                        search={false}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => updateVehicle(upvalues.id)} title="Update" style={{ width: "48%" }} />
                                    <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >

    );

}

const styles = StyleSheet.create({
    errorMessageContainer: {
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
        width: '100%',
    },
    errorMessage: {
        color: colors.red,
        fontStyle: 'italic',
        fontSize: 16,
    },
    statusSelectList: {
        // flex: 1,
        marginTop: 20,
        width: "92%",
    },
    noVehiclesText: {
        fontStyle: 'italic',
        textAlign: 'center',
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
        alignItems: "center",
        padding: 20
    },
    view2: {
        width: "40%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        padding: 10,
        borderRadius: 25,
        //backgroundColor: "#0B3270",
        backgroundColor: colors.blue700,
        justifyContent: "center",
        alignItems: "center",
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
        width: "50%",
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