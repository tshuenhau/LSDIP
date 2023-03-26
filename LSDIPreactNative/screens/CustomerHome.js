import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation, } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import CustomerOrderList from "../components/CustomerOrderList";
import CustomerAvailableOrderList from "../components/CustomerAvailableOrderList";
import colors from '../colors';

export default function CustomerHome({ user }) {
    return (
        <View>
            <View style={{ paddingLeft: 5, marginLeft: 10 }}>
                <Text style={[
                    {
                        flexDirection: 'row',
                        flex: 2,
                        margin: 5,
                        fontSize: 24,
                        fontWeight: "800"

                    },
                ]}><Ionicons name="ios-person-outline" size={24} onPress={() => alert("clicked")} /> <FontAwesome5 name="coins" size={24} /> 100 ($1) { }</Text>

            </View>
            <Text>  </Text>
            <View style={[
                {
                    flexDirection: 'row',
                    alignSelf: 'center',

                },
            ]}>
                <TouchableOpacity style={styles.NavButton} >
                    <Text style={styles.NavButtonText}>Order History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.NavButton} >
                    <Text style={styles.NavButtonText}>Pick Up</Text>
                </TouchableOpacity>
            </View>
            <View style={[
                {
                    // Try setting `flexDirection` to `"row"`.
                    flexDirection: 'row',
                    alignSelf: 'center',
                },
            ]}>
                <TouchableOpacity style={styles.NavButton} >
                    <Text style={styles.NavButtonText}>Membership</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.NavButton} >
                    <Text style={styles.NavButtonText}>Rewards</Text>
                </TouchableOpacity>
            </View>
            {/* <Text style={styles.listtext}>My Orders</Text>
            <CustomerOrderList curUser={user} /> */}
            <Text style={styles.listtext}>Available for Delivery</Text>
            <CustomerAvailableOrderList navigation={navigation} curUser={user} />
        </View>
    )
}

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
    selectedTimesContent: {
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'gray',
        paddingVertical: 10,
    },
    selectedTimesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    selectedTimeCard: {
        width: "97%",
        alignItems: 'left',
        backgroundColor: colors.white,
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginLeft: 15
    },
    selectedTimeText: {
        flex: 1,
        fontSize: 16,
    },
    selectedTimesContainer: {
        marginTop: 20,
        marginBottom: 20,
        height: 300,
    },
    selectedTimesList: {
        flex: 1,
    },
    removeButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginRight: 10
    },
    removeButtonText: {
        color: 'red',
        fontSize: 15
    },
    NavButton: {
        backgroundColor: colors.primary,
        padding: 20,
        borderRadius: 5,
        margin: 2,
        alignSelf: 'center',
    },
    NavButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        alignSelf: 'center',
    },
    cardText: {
        fontSize: 20,
        color: '#333333',
        marginBottom: 15,
        marginLeft: 10
    },
    cardTitle: {
        fontSize: 20,
        marginBottom: 4,
        marginLeft: 10
    },
    noOrdersText: {
        fontSize: 16,
        color: '#333333',
        marginLeft: 10
    },
    orderText: {
        fontSize: 16,
        color: '#333333',
        marginLeft: 10
    }
});