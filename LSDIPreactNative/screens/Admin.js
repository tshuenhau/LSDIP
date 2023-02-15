import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal, Alert, FlatList, Pressable } from "react-native";
// import OutletList from "../components/OutletList";
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import { firebase } from "../config/firebase";

export default function Admin({ navigation }) {

    const [modalVisible, setModalVisible] = useState(false);
    const [outletList, setOutletList] = useState([]);
    const [values, setValues] = useState(initialValues);

    useEffect(() => {
        outlets.onSnapshot(querySnapshot => {
            const outletList = [];
            querySnapshot.forEach(doc => {
                const { outletAddress, outletEmail, outletName, outletNumber } = doc.data();
                outletList.push({
                    id: doc.id,
                    outletName,
                    outletAddress,
                    outletNumber,
                    outletEmail
                });
            });
            setOutletList(outletList);
        });
    }, []);

    const outlets = firebase.firestore().collection('outlet');

    const initialValues = {
        outletName: "",
        outletAddress: "",
        outletNumber: "",
        outletEmail: ""
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

    function createOutlet() {
        outlets.add(values)
            .then(() => {
                setModalVisible(!modalVisible);
                clearState;
                console.log("Success");
            }).catch((err) => {
                console.log(err);
            })
    }

    function deleteOutlet(outlet) {
        outlets.doc(outlet.id)
            .delete()
            .then(() => {
                alert("Deleted Successfully");
            }).catch((err) => {
                console.log(err);
            })
    }

    return (
        <View>

            <View style={styles.view}>
                <TouchableOpacity
                    onPress={() => setModalVisible(!modalVisible)}
                    style={styles.btn}>
                    <Text style={styles.text}>Create Outlet</Text>
                </TouchableOpacity>
            </View>

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
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Outlet</Text>
                            <TextBox placeholder="Outlet Name" onChangeText={text => handleChange(text, "outletName")} />
                            <TextBox placeholder="Outlet Address" onChangeText={text => handleChange(text, "outletAddress")} />
                            <TextBox placeholder="Outlet Number" onChangeText={text => handleChange(text, "outletNumber")} />
                            <TextBox placeholder="Outlet Email" onChangeText={text => handleChange(text, "outletEmail")} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => createOutlet()} title="Create" style={{ width: "48%" }} />
                                <Btn onClick={() => setModalVisible(!modalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <View>
                {!(outletList.length > 0) && <Text> No Data Found! </Text>}
                <View>
                    <FlatList
                        data={outletList}
                        keyExtractor={outlet => outlet.id}
                        renderItem={({ item }) => (
                            <Pressable style={styles.outletRecord}>
                                <View style={styles.cards}>
                                    <Text>Name: {item.outletName} </Text>
                                    <Text>Address: {item.outletAddress} </Text>
                                    <Text>Number: {item.outletNumber} </Text>
                                    <Text>Email: {item.outletEmail} </Text>
                                </View>
                                <FontAwesome
                                    style={styles.deleteIcon}
                                    name="trash-o"
                                    color='red'
                                    onPress={() => deleteOutlet(item)}
                                />
                            </Pressable>
                        )}
                    />
                </View >
            </View>

        </View>

    )
}

const styles = StyleSheet.create({
    cards: {
        marginBottom: 10,
        marginLeft: '2%',
        width: '85%'
    },
    outletRecord: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',

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
})

