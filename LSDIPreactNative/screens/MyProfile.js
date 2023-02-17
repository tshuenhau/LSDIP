import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Alert
} from 'react-native'
import React, { useState, useEffect } from 'react'
import TextBox from "../components/TextBox"
import Btn from "../components/Button"
import { firebase } from '../config/firebase'
import { FontAwesome } from '@expo/vector-icons'

export default function MyProfile() {
    const auth = firebase.auth;

    const initialValues = {
        email: "",
        name: "",
        number: "",
        role: "",
    };

    const [userDetails, setUserDetails] = useState(initialValues);
    const [updateModalData, setUpdateModalData] = useState(initialValues);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const users = firebase.firestore().collection('users');

    useEffect(() => {
        users.doc(auth().currentUser.uid)
            .get()
            .then(doc => {
                setUserDetails(doc.data());
                setUpdateModalData(doc.data());
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    function handleChange(text, eventName) {
        setUpdateModalData(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const updateDetails = () => {
        if (updateModalData.email.length > 0 &&
            updateModalData.name.length > 0 &&
            updateModalData.number.length &&
            updateModalData.role.length > 0) {
            console.log(updateModalData.email)
            console.log(updateModalData.name)
            console.log(updateModalData.number)
            // update in DB
            users.doc(updateModalData.uid)
                .update({
                    email: updateModalData.email,
                    name: updateModalData.name,
                    number: updateModalData.number,
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
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <Image style={styles.image}
                        source={require('../assets/defaultProfilePicture.png')}
                    />
                    <View>
                        <Text style={styles.mainText}>
                            {userDetails.name}
                        </Text>
                        <Text style={styles.textLabel}>
                            Name
                        </Text>
                    </View>
                    <FontAwesome
                        style={styles.editIcon}
                        color="black"
                        name="edit"
                        onPress={() => setUpdateModalVisible(!updateModalVisible)}
                    />
                </View>
                <Text style={styles.emailText}>
                    {userDetails.email}
                </Text>

                <View style={styles.view}>
                    <TouchableOpacity
                        // onPress={() => setCreateModalVisible(!createModalVisible)}
                        style={styles.btn}>
                        <Text style={styles.text}>Change Password</Text>
                    </TouchableOpacity>
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
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Edit Profile</Text>
                            {/* <Text>{updateModalData.uid}</Text> */}
                            <TextBox placeholder="John Doe" onChangeText={text => handleChange(text, "name")} defaultValue={userDetails.name} />
                            <TextBox placeholder="laundry@email.com" onChangeText={text => handleChange(text, "email")} defaultValue={userDetails.email} />
                            <TextBox placeholder="Phone Number" onChangeText={text => handleChange(text, "number")} defaultValue={userDetails.number} />
                            <TextBox placeholder="Admin, Driver, Staff" onChangeText={text => handleChange(text, "role")} defaultValue={userDetails.role} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => updateDetails()} title="Update" style={{ width: "48%" }} />
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
    container: {
        backgroundColor: 'white',
        height: '100%',
    },
    image: {
        height: 60,
        width: 60,
        backgroundColor: 'grey',
        borderRadius: 50,
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginLeft: 10,
    },
    mainText: {
        fontWeight: '400',
        fontSize: 20,
        color: 'blue',
        paddingHorizontal: 10,
    },
    textLabel: {
        fontSize: 20,
        color: 'grey',
        paddingHorizontal: 10,
    },
    emailText: {
        fontSize: 18,
        color: 'black',
        paddingHorizontal: 10,
        marginTop: 10,
        fontWeight: 'bold',
        marginBottom: 20,
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
    editIcon: {
        fontSize: 25,
        margin: 10,
        // alignSelf: 'flex-end',
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