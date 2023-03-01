import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation, } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import CustomerOrderList from "../components/CustomerOrderList";
import colors from '../colors';

export default function Home({ navigation }) {

    const auth1 = firebase.auth;

    const [user, setUser] = useState(null) // This user
    const users = firebase.firestore().collection('users');

    useEffect(() => {
        users.doc(auth1().currentUser.uid)
            .get()
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

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                {user?.role === "Staff" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5,marginLeft:10 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5,marginLeft:10 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <OrdersList navigation={navigation} />
                    </View>
                    : null
                }
                {user?.role === "Admin" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5,marginLeft:10 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5,marginLeft:10 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <OrdersList navigation={navigation} />

                    </View>
                    : null
                }
                {user?.role === "Customer" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5,marginLeft:10 }}>Welcome {user?.name}</Text>
                        <View style={{ paddingLeft: 5,marginLeft:10 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <Text> </Text>
                        <Text style={styles.listtext}>My Orders</Text>
                        <CustomerOrderList curUser={user} />
                    </View>
                    : null
                }
                {user?.role === "Driver" ?
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "800", padding: 5,marginLeft:10 }}>Welcome {user?.role} {user?.name}</Text>
                        <View style={{ paddingLeft: 5,marginLeft:10 }}>
                            <Text>Email: {auth.currentUser?.email}</Text>
                        </View>
                        <Text>Hi im Driver</Text>
                    </View>
                    : null
                }

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