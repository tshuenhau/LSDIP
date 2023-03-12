import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
    Modal,
    TextInput,
    Button,
    ScrollView,
    Image
} from 'react-native';
import { firebase } from '../config/firebase';
import OrderDetails from "../components/OrderDetails";
import colors from '../colors';
import { FontAwesome } from '@expo/vector-icons';
import Checkbox from "expo-checkbox";
import { SelectList } from "react-native-dropdown-select-list";
import Btn from "../components/Button";
import alert from "../components/Alert";
import QR from "../components/QR";
import { Entypo } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import CustomerOrderList from "../components/CustomerOrderList";

export default function Orders({ navigation }) {

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
        <View>
            <View style={styles.container}>
                <Text>Email: </Text>
            </View>
        </View>

    )
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 5,
        alignSelf: 'center',
        marginTop: '5%',
        width: '80%'
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