import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation, } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import colors from '../colors';
import OrderDetails from "../components/OrderDetails";





export default function Home({ navigation }) {
    const firestore = firebase.firestore;
    const auth1 = firebase.auth;

    const [user, setUser] = useState(null) // This user
    const orders = firebase.firestore().collection('orders');
    const users = firebase.firestore().collection('users');
    const [orderList, setOrderList] = useState([]);
    const [customer, setCustomer] = useState([]);



    useEffect(() => {
        firestore().collection("users").doc(auth1().currentUser.uid).get()
            .then(user => {
                setUser(user.data())
                console.log(user)
            })

    }, [])


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

    const newList = (user) => {
        const customer = [];
        if (user.phone === orders.customerPhone) {



            setCustomer(customer)
        }
    }



    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                {user?.role === "Staff" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <Text>Hi im Staff</Text>
                    </View>
                    : null
                }
                {user?.role === "Admin" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>

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
                        <Text>Hi im customer</Text>
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
});