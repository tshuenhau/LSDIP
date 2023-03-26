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

            <View style={
                {
                    flexDirection: 'row',
                    // alignSelf: 'center',
                    justifyContent: "center",
                    flexWrap: 'wrap',

                }
            }>
                <TouchableOpacity style={styles.NavButton} >
                    <Text style={styles.NavButtonText}>Order History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.NavButton} >
                    <Text style={styles.NavButtonText}>Pick Up</Text>
                </TouchableOpacity>
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
    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
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
});