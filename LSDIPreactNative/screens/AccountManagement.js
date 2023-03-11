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
                const { email, name, number, role } = doc.data();
                users.push({
                    id: doc.id,
                    email,
                    name,
                    number,
                    role
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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.itemName}>{item.name} </Text>
            </View>
            {expandedItem === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Phone Number: {item.number} </Text>
                        <Text style={styles.itemText}>Email: {item.email} </Text>
                    </View>
                    <View style={styles.cardButtons}>
                        <FontAwesome
                            style={styles.outletIcon}
                            name="edit"
                            color= {colors.green}
                            onPress={() => openModal(item)}
                        />
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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by user's name"
                />
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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by user's name"
                />
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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by user's name"
                />
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
        <FlatList
            data={users.filter(l => l.role === "Disabled")}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
                <Text style={styles.noDataText}>No available items</Text>
            }
        />
    );

    function handleChange(text, eventName) {
        setUpdateModalData(prev => {
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
                    role: updateModalData.role,
                }).then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'User updated',
                    });
                    console.log("Update Success")
                    setUpdateModalVisible(!updateModalVisible);
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
        <View>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={props => <TabBar {...props} style={{ backgroundColor: '#0B3270' }} />}
            />

            {/* Update Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={updateModalVisible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Update Role</Text>
                            <Text style={styles.itemText}>Name: {updateModalData.name} </Text>
                            <Text style={styles.itemText}>Email: {updateModalData.email} </Text>
                            <Text style={styles.itemText}>Phone: {updateModalData.number} </Text>
                            <View style={{
                                width: "100%",
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
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => updateRole()} title="Update" style={{ width: "48%" }} />
                                <Btn onClick={() => setUpdateModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
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
    noDataText: {
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
    tableContainer: {
        marginTop: 20,
        marginBottom: 20,
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        elevation: 3,
        width: "80%",
    },

    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    tableHeaderText: {
        fontWeight: "bold",
        fontSize: 16,
        flex: 1,
    },
    tableBody: {},
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    tableRowText: {
        fontSize: 16,
        flex: 1,
    },

    checkoutButton: {
        backgroundColor: "#0B3270",
        padding: 16,
        borderRadius: 10,
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: 20,
    },
    checkoutButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
    },
    button: {
        height: 60,
        width: "40%",
        backgroundColor: "#0B3270",
        color: "#fff",
        fontSize: 20,
        borderRadius: 25,
        marginTop: 20,
        marginLeft: "auto",
        marginRight: "auto"
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
        width: "60%",
        marginLeft: "auto",
        marginRight: "auto",
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
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
        fontSize: 25,
        margin: 10,
    },
    cardHeaderIcon: {
        flexDirection: 'row',
        padding: 16,
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
});
