import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import colors from '../colors';

export default function Home({ navigation }) {
    const firestore = firebase.firestore;
    const auth1 = firebase.auth;

    const [user, setUser] = useState(null) // This user

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

    return (
        <View>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>Welcome {user?.role}</Text>
            <View style={styles.loggedInContainer}>
                <Text>Email: {auth.currentUser?.email}</Text>
            </View>

            <OrdersList />

            <View style={styles.chatContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Chat")}
                    style={styles.chatButton}
                >
                    <Entypo name="chat" size={24} color={colors.lightGray} />
                </TouchableOpacity>
            </View>
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
  });