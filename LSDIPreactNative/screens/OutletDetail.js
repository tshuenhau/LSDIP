import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    Alert
} from 'react-native'
import React, { useState } from 'react'
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";

export default function OutletDetail({ route, navigation }) {

    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [updateModalData, setUpdateModalData] = useState(route.params.item);
    const outlets = firebase.firestore().collection('outlet');

    function handleChange(text, eventName) {
        setUpdateModalData(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const updateOutlet = () => {
        if (updateModalData.outletName.length > 0 &&
            updateModalData.outletAddress.length > 0 &&
            updateModalData.outletNumber.length > 0 &&
            updateModalData.outletEmail.length > 0) {
            // update in DB
            outlets.doc(updateModalData.id)
                .update({
                    outletName: updateModalData.outletName,
                    outletAddress: updateModalData.outletAddress,
                    outletNumber: updateModalData.outletNumber,
                    outletEmail: updateModalData.outletEmail
                }).then(() => {
                    console.log("Update Success")
                    setUpdateModalVisible(!updateModalVisible);
                }).catch((err) => {
                    console.log(err)
                })
        }
    }

    return (
        <View>
            <View style={styles.topButtons}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.btn}>
                    <Text style={styles.text}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setUpdateModalVisible(!updateModalVisible)}
                    style={styles.btn}>
                    <Text style={styles.text}>Edit Outlet</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.itemContainer}>
                <View style={styles.cardBody}>
                    <Text style={styles.outletName}>Name: {updateModalData.outletName} </Text>
                    <Text style={styles.itemText}>Address: {updateModalData.outletAddress} </Text>
                    <Text style={styles.itemText}>Number: {updateModalData.outletNumber} </Text>
                    <Text style={styles.itemText}>Email: {updateModalData.outletEmail} </Text>
                </View>
            </View>

            {/* Update Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={updateModalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setUpdateModalVisible(!updateModalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Update Outlet</Text>
                            <TextBox placeholder="Outlet Name" onChangeText={text => handleChange(text, "outletName")} defaultValue={updateModalData.outletName} />
                            <TextBox placeholder="Outlet Address" onChangeText={text => handleChange(text, "outletAddress")} defaultValue={updateModalData.outletAddress} />
                            <TextBox placeholder="Outlet Number" onChangeText={text => handleChange(text, "outletNumber")} defaultValue={updateModalData.outletNumber} />
                            <TextBox placeholder="Outlet Email" onChangeText={text => handleChange(text, "outletEmail")} defaultValue={updateModalData.outletEmail} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => updateOutlet()} title="Update" style={{ width: "48%" }} />
                                <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
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
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
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
    outletIcon: {
        fontSize: 25,
        margin: 10,
    },
    topButtons: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
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