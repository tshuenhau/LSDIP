import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation, } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import CustomerOrderList from "../components/CustomerOrderList";
import colors from '../colors';
import OrderDetails from "../components/OrderDetails";

export default function Home({ navigation }) {
    const firestore = firebase.firestore;
    const auth1 = firebase.auth;

    const [user, setUser] = useState(null) // This user
    const orders = firebase.firestore().collection('orders');
    const users = firebase.firestore().collection('users');
    // const [orderList, setOrderList] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    // const [customer, setCustomer] = useState(null) // This user

    useEffect(() => {
        users.doc(auth1().currentUser.uid)
            .get()
            .then(user => {
                setUser(user.data())
                console.log(user)
            })
    }, [])

    // useEffect(() => {
    //     users.doc(auth1().currentUser.uid)
    //         .get()
    //         .then(user => {
    //             setCustomer(user.data())
    //             console.log(user)
    //         })
    // }, [])

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Image
                    source={require('../assets/washin.jpg')}
                    style={{
                        width: 40,
                        height: 40,
                        marginRight: 15,
                    }}
                />
            ),
        });
    }, [navigation]);

    // useEffect(() => {
    //     users.doc(auth1().currentUser.uid)
    //         .get()
    //         .then(user => {
    //             setUser(user.data())
    //             console.log(user + "entire user")
    //             console.log(user.data().phone)

    //             orders.where("customerPhone", "==", user.data().phone)
    //                 .get()
    //                 .then(querySnapshot => {
    //                     const orderList = [];
    //                     querySnapshot.forEach((doc) => {
    //                         const {
    //                             customerName,
    //                             customerPhone,
    //                             date,
    //                             orderItems,
    //                             outletId,
    //                             orderStatus,
    //                             totalPrice } = doc.data();
    //                         orderList.push({
    //                             isSelected: false,
    //                             id: doc.id,
    //                             customerName,
    //                             customerPhone,
    //                             date,
    //                             orderItems,
    //                             outletId,
    //                             orderStatus,
    //                             totalPrice,
    //                         });
    //                     });
    //                     setOrderList(orderList);
    //                 });
    //         })

    // }, []);

    // const formatOrderNumber = (id) => {
    //     return '#' + id.slice(0, 4).toUpperCase();
    // };

    // const formatOrderDate = (date) => {
    //     //return date.toDate().toLocaleString();
    //     return date;
    // };

    // const toggleExpand = (id) => {
    //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    //     if (expandedOrder === id) {
    //         setExpandedOrder(null);
    //     } else {
    //         setExpandedOrder(id);
    //     }
    // };

    // const renderItem = ({ item: order }) => (
    //     <TouchableOpacity
    //         style={styles.card}
    //         onPress={() => toggleExpand(order.id)}
    //         activeOpacity={0.8}>
    //         <View style={styles.cardHeader}>
    //             <Text style={styles.orderNumber}>{formatOrderNumber(order.id)}</Text>
    //             <Text style={styles.orderDate}>{formatOrderDate(order.date)}</Text>
    //             <Text style={styles.orderNumber}>{order.orderStatus}</Text>
    //         </View>
    //         {expandedOrder === order.id && (
    //             <View style={styles.cardBody}>
    //                 <Text style={styles.orderNumber}>Name: {order.customerName}</Text>
    //                 <Text style={styles.orderNumber}>Number: {order.customerPhone}</Text>
    //                 <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
    //                 <Text style={styles.orderNumber}>Total Price: {order.totalPrice}</Text>
    //                 <OrderDetails data={order.id}></OrderDetails>
    //             </View>
    //         )}
    //     </TouchableOpacity>
    // );

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                {user?.role === "Staff" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <Text>Staff Home</Text>
                        <OrdersList navigation={navigation} />
                    </View>
                    : null
                }
                {user?.role === "Admin" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <Text>Admin Home</Text>
                        <OrdersList navigation={navigation} />

                    </View>
                    : null
                }
                {user?.role === "Customer" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5 }}>Welcome {user?.name}</Text>
                        <View style={{ paddingLeft: 5 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <Text> </Text>
                        <Text style={styles.listtext}>My Orders</Text>
                        {/* <FlatList
                            style={styles.list}
                            data={orderList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            ListEmptyComponent={
                                <Text style={styles.noDataText}>No Data Found!</Text>
                            }
                        /> */}
                        <CustomerOrderList curUser={user} />
                    </View>
                    : null
                }
                {user?.role === "Driver" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <Text>Hi im Driver</Text>
                    </View>
                    : null
                }

                {/*<OrdersList navigation={navigation} />*/}

                {/* <View style={styles.chatContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Chat")}
                    style={styles.chatButton}
                >
                    <Entypo name="chat" size={24} color={colors.lightGray} />
                </TouchableOpacity>
            </View> */}

            </ScrollView>
        </View>

    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    ordersListContainer: {
        flex: 1,
        padding: 10,
    },
    chatButtonContainer: {
        position: "absolute",
        bottom: 20,
        right: 20,
    },
    chatButton: {
        backgroundColor: colors.primary,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: .9,
        shadowRadius: 8,
    },
    button: {
        marginTop: "20"
    },
    createOrderContainer: {
        alignSelf: "center",
    },
    list: {
        flex: 1,
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
    orderNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    orderDate: {
        fontSize: 14,
        color: colors.gray,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    cardBody: {
        backgroundColor: colors.lightGray,
        padding: 16,
    },
    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
    },
});