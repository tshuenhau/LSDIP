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
import { FontAwesome, Entypo } from '@expo/vector-icons';
import alert from '../components/Alert'
import Toast from 'react-native-toast-message';
import colors from '../colors';

export default function MyProfile() {

    const initialValues = {
        email: "",
        name: "",
        number: "",
        role: "",
    };
    const initialPassword = {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    }

    const [userDetails, setUserDetails] = useState(initialValues);
    const [passwordDetails, setPasswordDetails] = useState(initialPassword);
    const [updateModalData, setUpdateModalData] = useState(initialValues);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const users = firebase.firestore().collection('users');
    const auth = firebase.auth;

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

    function handlePasswordChange(text, eventName) {
        setPasswordDetails(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const updateDetails = () => {
        if (updateModalData.name &&
            updateModalData.number) {
            users.doc(updateModalData.uid)
                .update({
                    email: updateModalData.email,
                    name: updateModalData.name,
                    number: updateModalData.number,
                }).then(() => {
                    console.log("Update Success")
                    setUserDetails({
                        role: updateModalData.role,
                        email: updateModalData.email,
                        number: updateModalData.number,
                        name: updateModalData.name
                    })
                    Toast.show({
                        type: 'success',
                        text1: 'Profile Updated',
                    });
                    setUpdateModalVisible(!updateModalVisible);
                }).catch((err) => {
                    console.log(err)
                })
        } else {
            alert(
                "Information", "All the fields are required",
                [
                    {
                        text: "Yes",
                        onPress: () => { }
                    }
                ]
            )
        }
    }

    const reauthenticate = (currentPassword) => {
        console.log("currentPassword = " + currentPassword)
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        return user.reauthenticateWithCredential(cred);
    };

    const changePassword = () => {
        let alertMsg = "";
        if (passwordDetails.currentPassword === "" || passwordDetails.newPassword === "") {
            alertMsg = "All the fields are required";
        } else if (passwordDetails.newPassword.length <= 5) {
            alertMsg = "Password must contains more than 5 characters";
        } else if (passwordDetails.newPassword != passwordDetails.confirmNewPassword) {
            alertMsg = "Passwords do not match";
        }
        if (alertMsg.length > 0) {
            alert(
                "Information", alertMsg,
                [
                    {
                        text: "Yes",
                        onPress: () => { }
                    }
                ]
            )
        } else {
            try {
                reauthenticate(passwordDetails.currentPassword).then(() => {
                    var user = firebase.auth().currentUser;
                    user.updatePassword(passwordDetails.newPassword);
                    Toast.show({
                        type: 'success',
                        text1: 'Password updated',
                    });
                    setPasswordModalVisible(!passwordModalVisible);
                    setPasswordDetails(initialPassword);
                })
            } catch (error) {
                console.log(error);
                alert(error);
            }
        }
    };

    const LeftCardDetails = ({ label, text }) => {
        return (
            <View style={styles.leftCardDetailsContainer}>
                <Text style={styles.leftCardLabel}>{label}</Text>
                <Text style={styles.leftCardText}>{text}</Text>
            </View>
        )
    }

    const ProfileDetail = ({ label, text }) => {
        return (
            <View style={styles.profileDetailContainer}>
                <Text style={styles.itemLabel}>{label}</Text>
                <Text style={styles.itemText}>{text}</Text>
            </View >
        );
    }

    return (
        <View style={{ backgroundColor: colors.background, flex: 1 }}>
            <View style={styles.itemContainer}>
                <View style={styles.leftProfileContainer}>
                    <Image style={styles.image}
                        source={require('../assets/defaultProfilePicture.png')}
                    />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.mainNameText}>{userDetails.name}</Text>
                        <Text style={styles.mainRoleText}>{userDetails.role}</Text>
                    </View>
                    <LeftCardDetails label={"Salary ($/h)"} text={userDetails.salary} />
                    <LeftCardDetails label={"Overtime Rate"} text={userDetails.overtimeRate} />

                    <TouchableOpacity
                        onPress={() => setPasswordModalVisible(!passwordModalVisible)}
                        style={styles.btn}>
                        <Text style={styles.password}>Change Password</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.rightProfileContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: "bold", fontSize: 24 }}>Profile</Text>
                        <TouchableOpacity
                            onPress={() => setUpdateModalVisible(!updateModalVisible)}
                            style={styles.editBtn}
                        >
                            <Entypo name="edit" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Name"} text={userDetails.name} />
                        <ProfileDetail label={"Role"} text={userDetails.role} />
                    </View>
                    <ProfileDetail label={"Address"} text={userDetails.address} />
                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Salary ($/h)"} text={userDetails.salary} />
                        <ProfileDetail label={"Overtime Rate"} text={userDetails.overtimeRate} />
                    </View>
                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Email"} text={userDetails.email} />
                        <ProfileDetail label={"Number"} text={userDetails.number} />
                    </View>
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
                            <TextBox placeholder="John Doe" onChangeText={text => handleChange(text, "name")} defaultValue={userDetails.name} />
                            <TextBox placeholder="laundry@email.com" onChangeText={text => handleChange(text, "email")} defaultValue={userDetails.email} />
                            <TextBox placeholder="Phone Number" onChangeText={text => handleChange(text, "number")} defaultValue={userDetails.number} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => updateDetails()} title="Update" style={{ width: "48%" }} />
                                <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={passwordModalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Change Password</Text>
                            <TextBox placeholder="Current Password" secureTextEntry={true} onChangeText={text => handlePasswordChange(text, "currentPassword")} />
                            <TextBox placeholder="New Password" secureTextEntry={true} onChangeText={text => handlePasswordChange(text, "newPassword")} />
                            <TextBox placeholder="Confirm New Password" secureTextEntry={true} onChangeText={text => handlePasswordChange(text, "confirmNewPassword")} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => changePassword()} title="Update" style={{ width: "48%" }} />
                                <Btn onClick={() => setPasswordModalVisible(!passwordModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    profileDetailRow: {
        flex: 1,
        flexDirection: 'row',
    },
    profileDetailContainer: {
        flex: 1,
        marginVertical: 20,
        borderBottomColor: colors.shadowGray,
        borderBottomWidth: 1,
    },
    leftProfileContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.white,
        alignItems: 'center',
        marginLeft: 40,
        marginRight: 40,
        borderRadius: 25,
    },
    leftCardDetailsContainer: {
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
    },
    leftCardLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    leftCardText: {
        fontSize: 16,
    },
    rightProfileContainer: {
        flex: 2,
        padding: 25,
        backgroundColor: colors.white,
        marginRight: 40,
        borderRadius: 25,
    },
    itemLabel: {
        color: colors.shadowGray,
        fontWeight: "400",
        fontSize: 16,
    },
    itemText: {
        fontSize: 20,
        fontWeight: '500',
    },
    image: {
        height: 250,
        width: 250,
        borderRadius: 50,
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "flex-start",
        marginTop: 20,
    },
    mainNameText: {
        fontWeight: '400',
        fontSize: 32,
    },
    mainRoleText: {
        color: colors.shadowGray,
        fontWeight: "400",
        fontSize: 16,
    },
    textLabel: {
        fontSize: 20,
        color: 'grey',
        paddingHorizontal: 10,
    },
    roleText: {
        fontSize: 18,
        color: 'black',
        paddingHorizontal: 10,
        marginTop: 10,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 18,
        color: 'black',
        paddingHorizontal: 10,
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    btn: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: colors.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
    },
    password: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff"
    },
    editIcon: {
        fontSize: 25,
        margin: 10,
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
    }
});