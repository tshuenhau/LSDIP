import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
    TextInput
} from "react-native";
import React, { useState, useEffect } from "react";
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { firebase } from "../config/firebase";
import { SelectList } from 'react-native-dropdown-select-list'
import Toast from 'react-native-toast-message';
import { ScrollView } from "react-native-gesture-handler";
import TextBox from "../components/TextBox";

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AccountManagement() {
    const [index, setIndex] = React.useState(0);
    const userDatabase = firebase.firestore().collection('users');
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedItem, setExpandedItem] = useState(null);
    const [updateModalData, setUpdateModalData] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [values, setValues] = useState(initialValues);
    const auth1 = firebase.auth;
    const firestore = firebase.firestore;

    const initialValues = {
        name: "",
        email: "",
        role: "",
        salary: "",
        overtimeRate: "",
        number: "",
        address: "",
        pwd: "",
        pwd2: ""
    };
    const createRoles = [
        { key: '1', value: 'Admin' },
        { key: '2', value: 'Staff' },
        { key: '3', value: 'Driver' }
    ]

    //for admin to create Admin, Staff, Driver
    //Customer only limit to customer signup on their own
    function SignUp() {
        const { email, pwd, pwd2, name, role, number, salary, overtimeRate, address } = values
        if (pwd == pwd2) {
            auth1().createUserWithEmailAndPassword(email, pwd)
                .then(() => {
                    firestore().collection("users").doc(auth1().currentUser.uid).set({
                        uid: auth1().currentUser.uid,
                        name,
                        role,
                        email,
                        number,
                        salary,
                        overtimeRate,
                        address
                    })
                    Toast.show({
                        type: 'success',
                        text1: 'Account created',
                    });
                    setValues(initialValues);
                    setCreateModalVisible(false);
                })
                .catch((error) => {
                    alert(error.message)
                });
        } else {
            alert("Passwords are different!")
        }
    }

    const roles = [
        { key: '1', value: 'Admin' },
        { key: '2', value: 'Staff' },
        { key: '3', value: 'Driver' },
        { key: '4', value: 'Customer' },
        { key: '4', value: 'Disabled' }
    ]

    useEffect(() => {
        const unsubscribe = userDatabase.onSnapshot(querySnapshot => {
            const users = [];
            querySnapshot.forEach(doc => {
                const { email, name, number, role, address, salary, overtimeRate } = doc.data();
                users.push({
                    id: doc.id,
                    email,
                    name,
                    number,
                    role,
                    address,
                    salary,
                    overtimeRate
                });
            });
            setUsers(users)
        });
        return () => unsubscribe();
    }, []);

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedItem === id) {
            setExpandedItem(null);
        } else {
            setExpandedItem(id);
        }
    };

    const openModal = (users) => {
        console.log(users);
        setUpdateModalData(users);
        setUpdateModalVisible(true);
    }

    //directly change the user role to disabled
    const deleteUser = (users) => {
        userDatabase.doc(users.id)
            .update({
                role: "Disabled"
            }).then(() => {
                Toast.show({
                    type: 'success',
                    text1: 'User Disabled',
                });
                console.log("Update Success")
            }).catch((err) => {
                console.log(err)
            })
    }

    //for list
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style>    {item.role}</Text>
                </View>
                <View style={styles.cardButtons}>
                    <FontAwesome
                        style={styles.outletIcon}
                        name="edit"
                        color={colors.green}
                        onPress={() => openModal(item)}
                    />
                    <FontAwesome
                        style={styles.outletIcon}
                        name="trash-o"
                        color={colors.red}
                        onPress={() => deleteUser(item)}
                    />
                </View>
            </View>
            {expandedItem === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Phone Number: {item.number} </Text>
                        <Text style={styles.itemText}>Email: {item.email} </Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );

    const filteredUserList = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const Admin = () => (
        <View>
            <View style={styles.searchView}>
                <View style={styles.searchContainerWithBtn}>
                    <TextInput
                        autoFocus="autoFocus"
                        style={styles.searchInputWithBtn}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by user's name"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setCreateModalVisible(!createModalVisible)}
                    style={styles.btn}>
                    <Text style={styles.text}>Create User</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredUserList.filter(user => user.role === "Admin")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    const Staff = () => (
        <View>
            <View style={styles.searchView}>
                <View style={styles.searchContainerWithBtn}>
                    <TextInput
                        style={styles.searchInputWithBtn}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by user's name"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setCreateModalVisible(!createModalVisible)}
                    style={styles.btn}>
                    <Text style={styles.text}>Create User</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredUserList.filter(user => user.role === "Staff")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    const Driver = () => (
        <View>
            <View style={styles.searchView}>
                <View style={styles.searchContainerWithBtn}>
                    <TextInput
                        style={styles.searchInputWithBtn}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by user's name"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setCreateModalVisible(!createModalVisible)}
                    style={styles.btn}>
                    <Text style={styles.text}>Create User</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredUserList.filter(user => user.role === "Driver")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    const Customer = () => (
        <View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by user's name"
                />
            </View>
            <FlatList
                data={filteredUserList.filter(user => user.role === "Customer")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    const Disabled = () => (
        <View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by user's name"
                />
            </View>
            <FlatList
                data={users.filter(l => l.role === "Disabled")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    function handleChange(text, eventName) {
        setUpdateModalData(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    //for creating user change
    function handleCreateChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const updateRole = () => {
        if (updateModalData.role.length > 0) {
            userDatabase.doc(updateModalData.id)
                .update({
                    name: updateModalData.name,
                    role: updateModalData.role,
                    salary: updateModalData.salary,
                    overtimeRate: updateModalData.overtimeRate,
                    number: updateModalData.number,
                    address: updateModalData.address,
                }).then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'User updated',
                    });
                    console.log("Update Success")
                    setUpdateModalVisible(false);
                }).catch((err) => {
                    console.log(err)
                })
        }
    }

    const renderScene = SceneMap({
        admin: Admin,
        staff: Staff,
        driver: Driver,
        customer: Customer,
        disabled: Disabled,
    });

    const [routes] = React.useState([
        { key: 'admin', title: 'Admin' },
        { key: 'staff', title: 'Staff' },
        { key: 'driver', title: 'Driver' },
        { key: 'customer', title: 'Customer' },
        { key: 'disabled', title: 'Disabled' },
    ]);

    return (
        <ScrollView>
            <View>

                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    renderTabBar={props => <TabBar {...props} style={{ backgroundColor: colors.darkBlue }} />}
                />

                {/* Update Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={updateModalVisible}
                >
                    <ScrollView style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={styles.view}>
                                    <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Update User</Text>
                                    <TextBox placeholder={updateModalData.name} onChangeText={text => handleChange(text, "name")} />
                                    <View style={{
                                        width: "92%",
                                        borderRadius: 25,
                                        marginTop: 20
                                    }}>
                                        <SelectList
                                            data={roles}
                                            placeholder="Change role to?"
                                            searchPlaceholder="Search role"
                                            setSelected={(val) => handleChange(val, "role")}
                                            save="value"
                                        />
                                    </View>
                                    <TextBox placeholder={updateModalData.salary} onChangeText={text => handleChange(text, "salary")} />
                                    <TextBox placeholder={updateModalData.overtimeRate} onChangeText={text => handleChange(text, "overtimeRate")} />
                                    <TextBox placeholder={updateModalData.number} onChangeText={text => handleChange(text, "number")} />
                                    <TextBox placeholder={updateModalData.address} onChangeText={text => handleChange(text, "address")} />
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                        <Btn onClick={() => updateRole()} title="Update" style={{ width: "48%" }} />
                                        <Btn onClick={() => setUpdateModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: colors.dismissBlue }} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>

                {/*create user modal*/}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={createModalVisible}
                >
                    <ScrollView style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={styles.view}>
                                    <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create User</Text>
                                    <TextBox placeholder="Full Name" onChangeText={text => handleCreateChange(text, "name")} />
                                    <TextBox placeholder="Email Address" onChangeText={text => handleCreateChange(text, "email")} />
                                    <TextBox placeholder="Phone Number" onChangeText={text => handleCreateChange(text, "number")} />
                                    <TextBox placeholder="Address" onChangeText={text => handleCreateChange(text, "address")} />
                                    <View style={{
                                        width: "92%",
                                        borderRadius: 25,
                                        marginTop: 20
                                    }}>
                                        <SelectList
                                            data={createRoles}
                                            placeholder="What is their role?"
                                            searchPlaceholder="Search role"
                                            setSelected={(val) => handleCreateChange(val, "role")}
                                            save="value"
                                        />
                                    </View>
                                    <TextBox placeholder="Salary ($/h)" onChangeText={text => handleCreateChange(text, "salary")} />
                                    <TextBox placeholder="Overtime Rate" onChangeText={text => handleCreateChange(text, "overtimeRate")} />
                                    <TextBox placeholder="Password" secureTextEntry={true} onChangeText={text => handleCreateChange(text, "pwd")} />
                                    <TextBox placeholder="Confirm Password" secureTextEntry={true} onChangeText={text => handleCreateChange(text, "pwd2")} />
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%", }}>
                                        <Btn onClick={() => SignUp()} title="Create User" style={{ width: "48%" }} />
                                        <Btn onClick={() => setCreateModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: colors.dismissBlue }} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: colors.gray,
        paddingHorizontal: 10,
        fontSize: 18,
        backgroundColor: colors.white,
        marginVertical: 10,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    searchContainer: {
        justifyContent: "center",
        alignContent: "center",
        width: "96%",
        marginLeft: 15
    },
    searchView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5
    },
    searchContainerWithBtn: {
        justifyContent: "center",
        alignContent: "center",
        width: "70%",
        marginLeft: 15
    },
    searchInputWithBtn: {
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: colors.gray,
        paddingHorizontal: 10,
        fontSize: 18,
        backgroundColor: colors.white,
        marginVertical: 10,
    },
    noDataText: {
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
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
    card: {
        backgroundColor: colors.white,
        width: "96%",
        marginLeft: 15,
        marginRight: "auto",
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: colors.shadowGray,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
    },
    itemName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    outletIcon: {
        fontSize: 30,
        marginLeft: 20,
        marginRight: 10
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
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
    btn: {
        borderRadius: 10,
        backgroundColor: colors.blue600,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 30,
        marginTop: 5,
        width: '20%',
        height: '75%'
    },
    text: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.white,
    }
});
