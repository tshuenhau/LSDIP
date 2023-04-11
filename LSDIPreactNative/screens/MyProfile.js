import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Alert,
    ScrollView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import TextBox from "../components/TextBox"
import Btn from "../components/Button"
import { firebase } from '../config/firebase'
import { FontAwesome, Entypo } from '@expo/vector-icons';
import alert from '../components/Alert'
import Toast from 'react-native-toast-message';
import colors from '../colors';
import { color } from 'react-native-reanimated'

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
    const [errorMessage, setErrorMessage] = useState('');
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
            updateModalData.number &&
            updateModalData.email) {
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
                    setErrorMessage("");
                    setUpdateModalVisible(!updateModalVisible);
                }).catch((err) => {
                    console.log(err)
                })
        } else {
            setErrorMessage("Please fill up all fields");
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
        if (passwordDetails.currentPassword === "" || passwordDetails.newPassword === "" || passwordDetails.confirmNewPassword === "") {
            alertMsg = "All the fields are required";
        } else if (passwordDetails.newPassword.length <= 5) {
            alertMsg = "Password must contains more than 5 characters";
        } else if (passwordDetails.newPassword != passwordDetails.confirmNewPassword) {
            alertMsg = "Passwords do not match";
        }
        if (alertMsg.length > 0) {
            setErrorMessage(alertMsg);
        } else {
            try {
                reauthenticate(passwordDetails.currentPassword).then(() => {
                    var user = firebase.auth().currentUser;
                    user.updatePassword(passwordDetails.newPassword);
                    Toast.show({
                        type: 'success',
                        text1: 'Password updated',
                    });
                    setErrorMessage("");
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
        <View style={styles.container}>
            <View style={styles.itemContainer}>
                <View style={styles.leftProfileContainer}>
                    {userDetails.role === 'Admin' && (<Image style={styles.image}
                        source={require('../assets/profile.png')}
                    />)}
                    {userDetails.role === 'Staff' && (<Image style={styles.image}
                        source={require('../assets/staffprofile.png')}
                    />)}
                    {userDetails.role === 'Customer' && (<Image style={styles.image}
                        source={require('../assets/customerprofile.png')}
                    />)}
                    {userDetails.role === 'Driver' && (<Image style={styles.image}
                        source={require('../assets/washin.jpg')}
                    />)}
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
                animationType="fade"
                transparent={true}
                visible={updateModalVisible}
            >
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>
                                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Edit Profile</Text>
                                <TextBox placeholder="John Doe" onChangeText={text => handleChange(text, "name")} defaultValue={userDetails.name} />
                                <TextBox placeholder="laundry@email.com" onChangeText={text => handleChange(text, "email")} defaultValue={userDetails.email} />
                                <TextBox placeholder="Phone Number" onChangeText={text => handleChange(text, "number")} defaultValue={userDetails.number} />
                                {errorMessage &&
                                    <View style={styles.errorMessageContainer}>
                                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                                    </View>
                                }
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => updateDetails()} title="Update" style={{ width: "48%" }} />
                                    <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={passwordModalVisible}>
                <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.view}>
                                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Change Password</Text>
                                <TextBox placeholder="Current Password" secureTextEntry={true} onChangeText={text => handlePasswordChange(text, "currentPassword")} />
                                <TextBox placeholder="New Password" secureTextEntry={true} onChangeText={text => handlePasswordChange(text, "newPassword")} />
                                <TextBox placeholder="Confirm New Password" secureTextEntry={true} onChangeText={text => handlePasswordChange(text, "confirmNewPassword")} />
                                {errorMessage &&
                                    <View style={styles.errorMessageContainer}>
                                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                                    </View>
                                }
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                    <Btn onClick={() => changePassword()} title="Update" style={{ width: "48%" }} />
                                    <Btn onClick={() => setPasswordModalVisible(!passwordModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    )
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
        //backgroundColor: colors.themelight,
        alignItems: 'center',
        //marginLeft: 40,
        marginRight: 20,
        borderRadius: 6,
        borderColor: '#c4b5fd',
        //borderColor: '#e0e7ff',
        borderWidth: 2
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
        //marginRight: 40,
        borderRadius: 6,
        borderColor: '#c4b5fd',
        borderWidth: 2
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
        borderRadius: '50%',
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "flex-start",
        marginTop: 20,
        marginHorizontal: 'auto',
        width: '98%'
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
        //backgroundColor: colors.darkBlue,
        backgroundColor: colors.blue700,
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
    },
    container: {
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '4%',
        width: '95%',
        marginBottom: '10%',
        flex:1,
        backgroundColor: colors.white
      },
});