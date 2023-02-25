import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
} from 'react-native'
import alert from '../components/Alert'
import React, { useState, useEffect } from 'react'
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";
import { MultipleSelectList } from 'react-native-dropdown-select-list';

export default function OutletDetail({ route, navigation }) {

    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [allocateModalVisible, setAllocateModalVisible] = useState(false);
    const [updateModalData, setUpdateModalData] = useState(route.params.item);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [allocatedStaffList, setAllocateStaffList] = useState([]);
    const outlets = firebase.firestore().collection('outlet');
    const users = firebase.firestore().collection('users');
    const outletStaff = firebase.firestore().collection('outlet_staff');

    useEffect(() => {
        users.where("role", "==", "Staff")
            .get()
            .then(querySnapshot => {
                const staffList = [];
                querySnapshot.forEach(doc => {
                    staffList.push({
                        key: doc.id,
                        value: doc.data().name,
                        number: doc.data().number
                    });
                });
                setStaffList(staffList);
                outletStaff.where("outletID", "==", updateModalData.id)
                    .get()
                    .then(querySnapshot => {
                        const allocatedStaffList = [];
                        querySnapshot.forEach(doc => {
                            allocatedStaffList.push({
                                id: doc.id,
                                staffID: doc.data().staffID,
                                name: staffList.find(s => s.key === doc.data().staffID).value,
                                number: staffList.find(s => s.key === doc.data().staffID).number
                            })
                        })
                        setAllocateStaffList(allocatedStaffList);
                    })
            });
    }, []);

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

    const allocateStaff = () => {
        let allocateArr = [];
        for (let i = 0; i < selectedStaff.length; i++) {
            allocateArr.push({ outletID: updateModalData.id, staffID: selectedStaff[i] });
        }
        console.log(allocateArr);
        const batch = firebase.firestore().batch();
        allocateArr.forEach((doc) => {
            const newDocRef = outletStaff.doc();
            batch.set(newDocRef, doc);
        })
        batch.commit()
            .then(() => {
                console.log("Allocated Staff");
                setAllocateModalVisible(!allocateModalVisible);
                outletStaff.where("outletID", "==", updateModalData.id)
                    .get()
                    .then(querySnapshot => {
                        const allocatedStaffList = [];
                        querySnapshot.forEach(doc => {
                            allocatedStaffList.push({
                                id: doc.id,
                                staffID: doc.data().staffID,
                                name: staffList.find(s => s.key === doc.data().staffID).value,
                                number: staffList.find(s => s.key === doc.data().staffID).number
                            })
                        })
                        setAllocateStaffList(allocatedStaffList);
                    })
            }).catch((err) => {
                console.log(err);
            })
    }

    const showConfirmDiaglog = (item) => {
        return alert("Confirmation", "Are you sure you want to remove staff from this outlet?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        outletStaff.doc(item.id)
                            .delete()
                            .then(() => {
                                console.log("Deallocated")
                                const temp = allocatedStaffList.filter(x => x.id != item.id)
                                setAllocateStaffList(temp);
                            }).catch((err) => {
                                console.log(err)
                            })
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => {
                        console.log("Cancelled");
                    }
                }
            ])
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.outletName}>{item.name} </Text>
            </View>
            <View style={styles.itemContainer}>
                <View style={styles.cardBody}>
                    <Text style={styles.itemText}>Number: {item.number} </Text>
                </View>
                <View style={styles.cardButtons}>
                    <FontAwesome
                        style={styles.staffIcon}
                        color="red"
                        name="remove"
                        onPress={() => showConfirmDiaglog(item)}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );

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
            <View style={styles.btmButtons}>
                <TouchableOpacity
                    onPress={() => setAllocateModalVisible(!allocateModalVisible)}
                    style={styles.btn}>
                    <Text style={styles.text}>Allocate Staff</Text>
                </TouchableOpacity>
            </View>

            <View>
                <FlatList
                    data={allocatedStaffList}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.noStaffText}>No staff allocated</Text>
                    }
                />
            </View>

            {/* Update Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={updateModalVisible}>
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

            {/* Allocate Staff Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={allocateModalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Allocate Staff</Text>
                            <MultipleSelectList
                                setSelected={(val) => setSelectedStaff(val)}
                                data={staffList}
                                save="key"
                                label='Staff'
                            />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => allocateStaff()} title="Allocate" style={{ width: "48%" }} />
                                <Btn onClick={() => setAllocateModalVisible(!allocateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
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
    staffIcon: {
        fontSize: 25,
        margin: 10,
    },
    topButtons: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginVertical: 10,
    },
    btmButtons: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginVertical: 10,
    },
    noStaffText: {
        fontSize: 20,
        fontWeight: "600",
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