import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { firebase } from '../config/firebase';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import TextBox from "../components/TextBox"
import alert from '../components/Alert'
import Btn from "../components/Button"
import Toast from 'react-native-toast-message';

export default function MembershipTier() {

    const initialValues = {
        name: "",
        expenditure: "",
        discount: "",
    }

    const [newTierValues, setNewTierValues] = useState(initialValues);
    const [existingTiers, setExistingTiers] = useState([]);
    const [createErrorMessage, setCreateErrorMessage] = useState('');
    const [editErrorMessage, setEditErrorMessage] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editModalData, setEditModalData] = useState({});
    const membershipTier = firebase.firestore().collection('membership_tier');

    useEffect(() => {
        membershipTier
            .get()
            .then(querySnapshot => {
                const existingTiers = [];
                querySnapshot.forEach((doc) => {
                    existingTiers.push({ id: doc.id, ...doc.data() });
                })
                const sortedTiers = existingTiers.sort((a, b) => a.expenditure - b.expenditure);
                setExistingTiers(sortedTiers);
            })
    }, [])

    function handleNewChange(text, eventName) {
        setNewTierValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    function handleEditChange(text, eventName) {
        setEditModalData(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const createTier = () => {
        console.log("create");
        if (newTierValues.name && newTierValues.expenditure && newTierValues.discount) {
            membershipTier.add(newTierValues)
                .then((docRef) => {
                    Toast.show({
                        type: 'success',
                        text1: 'Membership tier created',
                    });
                    existingTiers.push({ ...newTierValues, id: docRef.id });
                    const sortedTiers = existingTiers.sort((a, b) => a.expenditure - b.expenditure);
                    setExistingTiers(sortedTiers);
                    setNewTierValues(initialValues);
                    setCreateErrorMessage("");
                }).catch((err) => {
                    console.log(err)
                })
        } else {
            setCreateErrorMessage("Please fill up all fields.");
        }
    }

    const handleEditPress = (existingTier) => {
        setEditModalData(existingTier);
        setEditModalVisible(true);
    }

    const editTier = () => {
        if (editModalData.name && editModalData.expenditure && editModalData.discount) {
            membershipTier.doc(editModalData.id).update({
                name: editModalData.name,
                expenditure: editModalData.expenditure,
                discount: editModalData.discount,
            }).then(() => {
                console.log("Update success");
                const indexToUpdate = existingTiers.findIndex(tier => tier.id === editModalData.id);
                existingTiers[indexToUpdate] = editModalData;
                const sortedTiers = existingTiers.sort((a, b) => a.expenditure - b.expenditure);
                setExistingTiers(sortedTiers);
                Toast.show({
                    type: 'success',
                    text1: 'Tier Updated',
                });
                setEditModalData({});
                setEditErrorMessage("");
                setEditModalVisible(false);
            }).catch((err) => {
                console.log(err)
            })
        } else {
            setEditErrorMessage("Please fill up all fields");
        }
    }

    const deleteTier = (existingTier) => {
        return alert(
            "Confirmation",
            "Are you sure you want to delete this Membership Tier?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        membershipTier.doc(existingTier.id)
                            .delete()
                            .then(() => {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Membership Tier deleted',
                                });
                                const newTiers = existingTiers.filter(tier => tier.id != existingTier.id);
                                setExistingTiers(newTiers);
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

    const TierDetail = ({ label, text }) => {
        return (
            <View style={styles.tierDetailContainer}>
                <Text style={styles.tierDetailLabel}>{label}</Text>
                <Text style={styles.tierDetailText}>{text}</Text>
            </View >
        );
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <View style={styles.createCard}>
                    <Text style={styles.cardTitle}>Create Tier</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Tier Name</Text>
                        <TextInput
                            style={styles.input}
                            value={newTierValues.name}
                            onChangeText={text => handleNewChange(text, "name")}
                        />
                    </View >
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Expenditure</Text>
                        <TextInput
                            style={styles.input}
                            value={newTierValues.expenditure}
                            placeholder={"Amount"}
                            onChangeText={text => handleNewChange(text, "expenditure")}
                        />
                    </View >
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Discount (%)</Text>
                        <TextInput
                            style={styles.input}
                            value={newTierValues.discount}
                            placeholder={"0% - 100%"}
                            onChangeText={text => handleNewChange(text, "discount")}
                        />
                    </View >
                    {createErrorMessage &&
                        <View style={styles.errorMessageContainer}>
                            <Text style={styles.errorMessage}>{createErrorMessage}</Text>
                        </View>
                    }
                    <TouchableOpacity style={styles.button} onPress={createTier}>
                        <Text style={styles.buttonText}>Create Tier</Text>
                    </TouchableOpacity>
                </View>
                {/*<TouchableOpacity style={styles.button} onPress={createTier}>
                    <Text style={styles.buttonText}>Create Tier</Text>
                </TouchableOpacity>*/}
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView style={{ margin: 30 }}>
                    {existingTiers &&
                        existingTiers.map((existingTier, index) => (
                            <View style={styles.tierContainer} key={index}>
                                <View>
                                    <Text style={styles.tierTitle}>{existingTier.name}</Text>
                                    <TierDetail label={"Expenditure"} text={existingTier.expenditure} />
                                    <TierDetail label={"Discount"} text={existingTier.discount + "%"} />
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <FontAwesome
                                        style={styles.actionButton}
                                        name="edit"
                                        color='green'
                                        onPress={() => handleEditPress(existingTier)}
                                    />
                                    <FontAwesome
                                        style={styles.actionButton}
                                        name="trash-o"
                                        color='red'
                                        onPress={() => deleteTier(existingTier)}
                                    />
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>
            </View>

            {/* Update Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={editModalVisible}
            >
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>
                                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Edit Profile</Text>
                                <TextBox placeholder="Tier Name" onChangeText={text => handleEditChange(text, "name")} defaultValue={editModalData.name} />
                                <TextBox placeholder="Expenditure" onChangeText={text => handleEditChange(text, "expenditure")} defaultValue={editModalData.expenditure} />
                                <TextBox placeholder="Discount 0% - 100%" onChangeText={text => handleEditChange(text, "discount")} defaultValue={editModalData.discount} />
                                {editErrorMessage &&
                                    <View style={styles.errorMessageContainer}>
                                        <Text style={styles.errorMessage}>{editErrorMessage}</Text>
                                    </View>
                                }
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => editTier()} title="Update" style={{ width: "48%" }} />
                                    <Btn onClick={() => setEditModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: '#f5f5f5',
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '4%',
        width: '95%',
        marginBottom: 20,
    },
    tierContainer: {
        backgroundColor: colors.white,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    tierTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
    tierText: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 4,
    },
    createCard: {
        // flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 15,
        margin: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        marginLeft: 10
    },
    inputContainer: {
        // flexDirection: 'row',
        // alignItems: 'center',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '400',
        opacity: "60%",
        marginHorizontal: 10,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        // backgroundColor: '#f0f0f0',
        borderRadius: 5,
        padding: 5,
        marginHorizontal: 10,
        // height: 15,
        fontSize: 14,
        borderColor: colors.darkBlue,
        borderWidth: 1,
        // textAlign: 'center',
    },
    button: {
        backgroundColor: colors.blue600,
        padding: 10,
        borderRadius: 25,
        width: '40%',
        // margin: 10,
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
    errorMessageContainer: {
        padding: 10,
        alignItems: "center",
        marginBottom: 10,
        width: '100%',
    },
    errorMessage: {
        color: colors.red,
        fontStyle: 'italic',
        fontSize: 16,
    },
    actionButton: {
        fontSize: 25,
        margin: 10,
    },
    tierDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tierDetailLabel: {
        color: colors.shadowGray,
        fontWeight: "400",
        fontSize: 16,
        marginRight: 10,
    },
    tierDetailText: {
        fontSize: 20,
        fontWeight: '500',
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
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: colors.shadowGray,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
});