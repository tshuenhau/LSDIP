import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    ScrollView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import TextBox from "../components/TextBox"
import Btn from "../components/Button"
import { firebase } from '../config/firebase'
import { Entypo } from '@expo/vector-icons';
import alert from '../components/Alert'
import Toast from 'react-native-toast-message';
import colors from '../colors';
import { ProgressBar } from "react-milestone";
import { AntDesign } from '@expo/vector-icons';

export default function CustomerProfile() {
    const initialValues = {
        email: "",
        name: "",
        number: "",
        role: "",
        expenditure: "",
        points: "",
        membership_tier: ""
    };
    const initialPassword = {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    }

    const initialTier = {
        discount: "0",
        expenditure: "0",
        name: "NA"
    }

    const [userDetails, setUserDetails] = useState(initialValues);
    const [membershipList, setMembershipList] = useState([]);
    const [currentTier, setCurrentTier] = useState(initialTier);
    const [nextTier, setNextTier] = useState(initialTier);
    const [passwordDetails, setPasswordDetails] = useState(initialPassword);
    const [updateModalData, setUpdateModalData] = useState(initialValues);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const users = firebase.firestore().collection('users');
    const membership_tier = firebase.firestore().collection('membership_tier');
    const auth = firebase.auth;

    useEffect(() => {
        users.doc(auth().currentUser.uid)
            .get()
            .then(doc => {
                const userdata = doc.data();
                setUserDetails(doc.data());
                membership_tier
                    .get()
                    .then(querySnapshot => {
                        const membershipList = [];
                        querySnapshot.forEach((doc) => {
                            membershipList.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                        membershipList.sort((a, b) => a.expenditure - b.expenditure);
                        setMembershipList(membershipList);
                        let tempList = membershipList.filter(record => record.expenditure <= userdata.expenditure);
                        let current = initialTier;
                        if (tempList.length > 0) {
                            current = tempList[tempList.length - 1]
                        } else {
                            current = initialTier;
                            next = membershipList[0];
                        }

                        let next;
                        if (current.expenditure === membershipList[membershipList.length - 1].expenditure) {
                            next = initialTier;
                        }
                        else {
                            next = membershipList.find(tier => tier.expenditure > current.expenditure);
                        }
                        setCurrentTier(current);
                        setNextTier(next);
                    })
                console.log(membership_tier);
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
        if (updateModalData.name &&
            updateModalData.number &&
            updateModalData.address) {
            users.doc(updateModalData.uid)
                .update({
                    address: updateModalData.address,
                    name: updateModalData.name,
                    number: updateModalData.number,
                }).then(() => {
                    console.log("Update Success")
                    setUserDetails({
                        address: updateModalData.address,
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

    function handlePasswordChange(text, eventName) {
        setPasswordDetails(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
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

    const ProfileDetail = ({ label, text }) => {
        return (
            <View style={styles.profileDetailContainer}>
                <Text style={styles.itemLabel}>{label}</Text>
                <Text style={styles.itemText}>{text}</Text>
            </View >
        );
    }

    return (
        <ScrollView style={{ backgroundColor: colors.themelight, flex: 1 }}>
            <View style={styles.itemContainer}>
                <View style={styles.leftProfileContainer}>
                    <Image style={styles.image}
                        source={require('../assets/defaultProfilePicture.png')}
                    />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.mainNameText}>{userDetails.name}</Text>
                        <Text style={styles.mainRoleText}>{userDetails.role}</Text>
                    </View>

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
                        <ProfileDetail label={"Email"} text={userDetails.email} />
                        <ProfileDetail label={"Number"} text={userDetails.number} />
                    </View>
                </View>

                <View style={styles.rightProfileContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: "bold", fontSize: 24 }}>Membership</Text>
                    </View>

                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Current Tier"} text={currentTier.name} />
                        <ProfileDetail label={"Discount"} text={currentTier.discount + "%"} />
                    </View>

                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Total Expenditure"} text={userDetails.expenditure} />
                    </View>

                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Reward Points"} text={userDetails.points} />
                    </View>

                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Next Tier"} text={nextTier.name} />
                        <ProfileDetail label={"Discount"} text={nextTier.discount + "%"} />
                    </View>
                    <View style={styles.profileDetailRow}>
                        <ProfileDetail label={"Expenditure to reach next Tier"} text={"$" + (nextTier.expenditure - userDetails.expenditure > 0 ? nextTier.expenditure - userDetails.expenditure : "NA")} />
                    </View>

                    <ProgressBar
                        style={{ margin: 30 }}
                        percentage={100 * ((userDetails.expenditure - currentTier.expenditure) / (nextTier.expenditure - currentTier.expenditure))}
                        color={colors.blue600}
                        transitionSpeed={1000}
                        Milestone={() => <AntDesign name="star" size={26} color={colors.blue300} />}
                        CurrentMilestone={() => <AntDesign name="star" size={26} color={colors.blue600} />}
                        CompletedMilestone={() => <AntDesign name="star" size={26} color={colors.blue900} />}
                        milestoneCount={2}
                    />

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
                                <TextBox placeholder="Address" onChangeText={text => handleChange(text, "address")} defaultValue={userDetails.address} />
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
        </ScrollView >
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
        // flex: 1,
        flexDirection: 'row',
    },
    profileDetailContainer: {
        flex: 1,
        marginVertical: 20,
        borderBottomColor: colors.shadowGray,
        borderBottomWidth: 1,
    },
    leftProfileContainer: {
        padding: 16,
        width: "90%",
        flexDirection: 'row',
        backgroundColor: colors.white,
        justifyContent: 'space-between',
        borderRadius: 25,
        marginBottom: 20,
        // flex: 1,
        // alignItems: 'center',
        // marginLeft: 20,
        // marginRight: 20,
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
        // flex: 2,
        width: "90%",
        padding: 25,
        backgroundColor: colors.white,
        marginBottom: 25,
        // marginRight: 40,
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
        height: 50,
        width: 50,
        borderRadius: 50,
    },
    itemContainer: {
        flex: 1,
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: "center",
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
        fontSize: 15,
        fontWeight: "400",
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
        width: '90%',
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