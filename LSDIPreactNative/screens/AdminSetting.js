import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    TextInput,
    LayoutAnimation,
    UIManager,
    Platform,
    ScrollView
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import { auth } from '../config/firebase';
import TextBox from "../components/TextBox"
import alert from '../components/Alert'
import Toast from 'react-native-toast-message';
import Btn from "../components/Button"


if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminSetting({ navigation }) {
    const initialPassword = {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    }
    const auth1 = firebase.auth;
    const currUser = auth1().currentUser.uid;
    const [passwordDetails, setPasswordDetails] = useState(initialPassword);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const reauthenticate = (currentPassword) => {
        console.log("currentPassword = " + currentPassword)
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        return user.reauthenticateWithCredential(cred);
    };

    function handlePasswordChange(text, eventName) {
        setPasswordDetails(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

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

    return (
        <View>
            <View style={styles.buttonView}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.btn}>
                    <Text style={styles.text}>Back</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                <View style={styles.container}>
                    <Text style={styles.searchText}>Setting</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('My Profile')}
                        style={styles.contentBtn}>
                        <Text style={styles.contentText}>Edit My Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Logging')}
                        style={styles.contentBtn}>
                        <Text style={styles.contentText}>Activity Log</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setPasswordModalVisible(!passwordModalVisible)}
                        style={styles.contentBtn}>
                        <Text style={styles.contentText}>Change Password</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/*Update Password Modal */}
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
        </View>


    );
};

const styles = StyleSheet.create({
    cardBody: {
        marginBottom: 20,
        marginLeft: 40,
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
    },
    outletName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 10
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginLeft: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '2%',
        width: '95%',
        marginBottom: 300,
        marginVertical: "50%"
    },
    buttonView: {
        justifyContent: 'space-between',
        marginTop: 30,
        flexDirection: 'row',
    },
    btn: {
        borderRadius: 20,
        backgroundColor: colors.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        width: "20%",
        marginHorizontal: "5%",
    },
    contentBtn: {
        borderRadius: 10,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "45%",
        marginBottom: 10,
        shadowColor: colors.shadowGray,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    contentText: {
        fontSize: 20,
        fontWeight: "600",
        padding: 10
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        padding: 10
    },
    noDataText: {
        fontSize: 20,
        fontWeight: "600",
        alignContent: 'center',
        alignSelf: 'center',
        padding: 10,
        marginTop: 20
    },
    dateTimePicker: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 10,
        width: '100%',
        position: 'relative',
        zIndex: 1,
        marginTop: 10,
    },
    searchText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
        float: "left"
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
})
