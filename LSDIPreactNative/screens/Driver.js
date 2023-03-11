import {
    View,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    LayoutAnimation,
    UIManager,
    Platform,
    TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SelectList } from 'react-native-dropdown-select-list';
import { Text, FlatList } from 'react-native-web';
import { doc, addDoc, getFirestore, collection, getDoc, getDocs, QuerySnapshot, deleteDoc, GeoPoint, updateDoc } from "firebase/firestore";
import { firebase } from "../config/firebase";
import colors from '../colors';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import alert from '../components/Alert'

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Driver() {

    const [index, setIndex] = React.useState(0);
    const [orders, setOrders] = useState([])
    const [user, setUser] = useState(false);
    const db = firebase.firestore()
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const statuses = [
        { key: 4, value: "Pending Delivery" },
        { key: 5, value: "Out for Delivery" },
        { key: 6, value: "Closed" },
      ];

    const roles = [
        { key: '1', value: 'Pending Delivery' },
        { key: '2', value: 'Out for Delivery' },
        { key: '3', value: 'Closed' },
    ]

    //read all order data method
    useEffect(() => {
        db.collection('orders')
            .onSnapshot(
                querySnapshot => {
                    const orders = []
                    querySnapshot.forEach((doc) => {
                        const {
                            customerName,
                            customerNumber,
                            date,
                            orderItems,
                            outletId,
                            orderStatus,
                            totalPrice,
                            } = doc.data();
                            orders.push({
                            id: doc.id,
                            customerName,
                            customerNumber,
                            date,
                            orderItems,
                            outletId,
                            orderStatus,
                            totalPrice,
                            });
                    })
                    setOrders(orders)
                    //console.log(vehicles)
                }
            )
    }, [])

    //set user details for conditional rendering
    useEffect(() => {
        try {
            const getUserId = async () => {
                try {
                    const id = await AsyncStorage.getItem('userId');
                    if (id !== null) {
                        getDoc(doc(db, "users", id)).then(docData => {
                            if (docData.exists()) {
                                //console.log(docData.data())
                                setUser(docData.data())
                            }
                        })
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            getUserId();
        } catch (e) {
            console.log("User Id does not exist in DB")
        }
    }, [])

    //search bar function
    const filteredOrderList = orders.filter((order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const PendingDelivery = () => (
        <View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by order number (First 4 char)"
                />
            </View>
            <FlatList
                data={filteredOrderList.filter(item => item.orderStatus === "Pending Delivery")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    const OutForDelivery = () => (
        <View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by order number (First 4 char)"
                />
            </View>
            <FlatList
                data={filteredOrderList.filter(item => item.orderStatus === "Out for Delivery")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    const Closed = () => (
        <View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by order number (First 4 char)"
                />
            </View>
            <FlatList
                data={filteredOrderList.filter(item => item.orderStatus === "Closed")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No available items</Text>
                }
            />
        </View>
    );

    const renderScene = SceneMap({
        pendingDelivery: PendingDelivery,
        outForDelivery: OutForDelivery,
        closed: Closed
    });

    const [routes] = React.useState([
        { key: 'pendingDelivery', title: 'Pending Delivery' },
        { key: 'outForDelivery', title: 'Out For Delivery' },
        { key: 'closed', title: 'Closed' },
    ]);

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedOrder === id) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(id);
        }
    };

    const formatOrderNumber = (id) => {
        return "#" + id.slice(0, 4).toUpperCase();
      };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardHeader2}>
                    <Text style={styles.orderNumber}>{formatOrderNumber(item.id)}</Text>
                    <Text style={styles.orderNumber}>{item.orderStatus}</Text>
                </View>
                <View style={styles.cardHeaderIcon}>
                    <MaterialCommunityIcons 
                    style={styles.outletIcon} 
                    name="truck-delivery" size={24} 
                    color="black"
                    onPress={() => deleteVehicle(item.id)} 
                    />
                </View>
            </View>
            {expandedOrder === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Address: </Text>
                        <Text style={styles.itemText}>Items: </Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );




    return (
        
        <View style={styles.container}>
                <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={props => <TabBar {...props} style={{ backgroundColor: '#0B3270' }} />}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    statusSelectList: {
        // flex: 1,
        marginTop: 20,
        width: "92%",
    },
    noVehiclesText: {
        fontStyle: 'italic',
        textAlign: 'center',
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
    itemText: {
        fontSize: 16,
        fontWeight: 'light',
        paddingTop: 4
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
    outletIcon: {
        fontSize: 25,
        margin: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    cardHeaderIcon: {
        flexDirection: 'row',
        padding: 16,
    },
    deleteIcon: {
        fontSize: 25,
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    view2: {
        width: "40%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        padding: 10,
        borderRadius: 25,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
    },
    btn2: {
        padding: 5,
        height: 100,
        width: 250,
        borderRadius: 25,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        padding: 10
    },
    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
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
    },
    orderNumber: {
        fontSize: 20,
        fontWeight: "bold",
    },
    searchContainer: {
        justifyContent: "center",
        alignContent: "center",
        width: "96%",
        marginLeft: 15
    },
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
});
