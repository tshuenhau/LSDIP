import { View,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    LayoutAnimation,
    UIManager,
    Platform, } from 'react-native';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { Text, FlatList, TextInput } from 'react-native-web';
import { doc, addDoc, getFirestore, collection, getDoc, getDocs, QuerySnapshot, deleteDoc, GeoPoint, updateDoc } from "firebase/firestore";
import { firebase } from "../config/firebase";
import { useNavigation } from '@react-navigation/native';
import colors from '../colors';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


export default function VehicleModule() {

	const [modalVisible, setModalVisible] = useState(false);
    const [values, setValues] = useState(initialValues);
    const vehicle = firebase.firestore().collection('vehicles');
    const [numberPlate, setNumberPlate] = useState("");
    const [vehicleStatus, setVehicleStatus] = useState("");
	const [vehicles, setVehicles] = useState([])
	const db = firebase.firestore()
    const [expandedVehicle, setExpandedVehicle] = useState(null);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [upvalues, setUpValues] = useState('');
    const [user, setUser] = useState(false); 
    

    //initial vehicle values
    const initialValues = {
        location: new firebase.firestore.GeoPoint(0,0),
        mileage: 0,
        numberPlate: "",
        vehicleStatus: "",
    };

    //console.log(values)
	//Create data method 1
	function createVehicle() {
		addDoc(collection(db, "vehicles"), {
            location: new firebase.firestore.GeoPoint(0,0),
            mileage: 0,
			numberPlate: numberPlate,
			vehicleStatus: vehicleStatus,

		}).then(() => {
			console.log("Creation Success");
		}).catch((error) => {
			console.log(error);
		})
        clearState();
	}

    //create data method 2
    /*function createVehicle() {
        console.log(values)
        vehicle.add(values)
            .then(() => {
                setModalVisible(!modalVisible);
                clearState;
                console.log("Creation Success");
            }).catch((err) => {
                console.log(err);
            })
    }*/

	//delete
	function deleteVehicle(id) {
		deleteDoc(doc(db, 'vehicles', id))
	}

    //clear state method 1
    function clearState() {
        setNumberPlate("")
        setVehicleStatus("")
    }

    //clear state method 2
    /*const clearState = () => {
        setValues({ ...initialValues });
    }*/

    const openModel = (vehicle) => {
        setUpValues(vehicle)
        setUpdateModalVisible(!updateModalVisible)

    }

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedVehicle === id) {
            setExpandedVehicle(null);
        } else {
            setExpandedVehicle(id);
        }
    };

	//read all vehicle data
	// function getAllVehicle() {
	//   getDocs(collection(db,"vehicles")).then(docSnap => {
	//     const vehicles = [];
	//     docSnap.forEach((doc) => {
	//       vehicles.push({ ...doc.data(), id:doc.id})
	//     })
	//     console.log(vehicles)
	//   })
	// }

	//read all vehicle data method 2
	useEffect(() => {
		db.collection('vehicles')
			.onSnapshot(
				querySnapshot => {
					const vehicles = []
					querySnapshot.forEach((doc) => {
						const { location, mileage, numberPlate, vehicleStatus } = doc.data()
						vehicles.push({
							id: doc.id,
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
	},[])

    //set user details for conditional rendering
    useEffect(() => {
		try {
            const getUserId = async () => {
                try {
                    const id = await AsyncStorage.getItem('userId');
                    if (id !== null) {
                        getDoc(doc(db, "users", id)).then(docData => {
                            if(docData.exists()) {
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
	},[])

    //alt user function 2
    {/*async function setUserDetails(){
        try {
            const user = await getUserId();
            getDoc(doc(db, "users", user)).then(docData => {
                if(docData.exists()) {
                    //console.log(docData.data())
                    setUser(docData.data())
                }
            })
        } catch (e) {
            console.log("User Id does not exist in DB")
        }
		
	}*/}

    //change values in create vehicle modal
    function handleChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    //update values in vehicle modal
    function handleUpdate(text, eventName) {
        setUpValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }
    //Create data
	/*function createVehicle() {
		addDoc(collection(db, "vehicles"), {
			numberPlate: numberPlate,
			vehicleStatus: vehicleStatus,

		}).then(() => {
			console.log("veh created");
		}).catch((error) => {
			console.log(error);
		})
	}*/

    function updateVehicle(id) {
        if (id != "") {
            console.log(upvalues)
            vehicle.doc(id).update({
                location: upvalues.location,
                mileage: upvalues.mileage,
                numberPlate: upvalues.numberPlate,
                vehicleStatus: upvalues.vehicleStatus,
            })
            .then(() => {
                console.log("Update Success")
                setUpdateModalVisible(!updateModalVisible);
            }).catch((err) => {
                console.log(err)
            })
        }
    }

    {/*const getUserId = async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            if (id !== null) {
                return id;
            }
        } catch (e) {
            console.log(e);
        }
    };*/}

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
                        <Text style={styles.itemText}>Location: {item.location.latitude} ,{item.location.longitude} </Text>
                        <Text style={styles.itemText}>Mileage: {item.mileage} </Text>
                        <Text style={styles.itemText}>Number Plate: {item.numberPlate} </Text>
                        <Text style={styles.itemText}>Status: {item.vehicleStatus} </Text>
                    </View>

                </View>
            )}
        </TouchableOpacity>
    );
    

    //alt user function 2
    //setUserDetails()


	return (

        //Create Vehicle Modal
        <View>
            {/*for create vehicleitem*/}
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

                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Vehicle</Text>
                            {/*<TextBox placeholder="Vehicle Number Plate" onChangeText={text => handleChange(text, "numberPlate")} />
                            <TextBox placeholder="Vehicle Status" onChangeText={text => handleChange(text, "vehicleStatus")} />*/}
                            <TextBox value = {numberPlate} onChangeText = {(numberPlate) => {setNumberPlate(numberPlate)}} placeholder="Number Plate"></TextBox>
                            <TextBox value = {vehicleStatus} onChangeText = {(vehicleStatus) => {setVehicleStatus(vehicleStatus)}} placeholder="Vehicle Status"></TextBox>

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => createVehicle()} title="Create" style={{ width: "48%" }} />
                                <Btn onClick={() => setModalVisible(!modalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
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
                {user.role === "Admin" || "Staff" ?
                    <View>
                        {!(vehicles.length > 0) && <Text> No Data Found! </Text>}
                        <FlatList
                            data={vehicles}
                            keyExtractor={item => item.id}
                            renderItem={renderItem}
                        />
                    </View >
                    :null
                }
                {user.role === "Admin" || "Staff" ?
                    <View>
                        <Text> No. </Text>
                    </View >
                    :null
                }
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={updateModalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Update Vehicle</Text>
                            <TextBox placeholder={upvalues.numberPlate} onChangeText={text => handleUpdate(text, "numberPlate")} />
                            <TextBox placeholder={upvalues.vehicleStatus} onChangeText={text => handleUpdate(text, "vehicleStatus")} />
                            <Btn onClick={() => updateVehicle(upvalues.id)} title="Update" style={{ width: "48%" }} />
                            <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                        </View>
                    </View>
                </View>
            </Modal>              
        </View >

	);

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
		backgroundColor: "#0B3270",
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