import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    UIManager,
    Platform,
    ScrollView,
} from "react-native";
import colors from '../colors';
import { firebase } from "../config/firebase";
import { doc, addDoc, getFirestore, collection, getDoc, getDocs, QuerySnapshot, deleteDoc, GeoPoint, updateDoc } from "firebase/firestore";
import LaundryList from "../components/LaundryItemList";
import AsyncStorage from '@react-native-async-storage/async-storage';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LaundryItem({ navigation }) {

    const [user, setUser] = useState(false);
    const db = firebase.firestore()

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



    return (
        <ScrollView>
            <View style={styles.buttonView}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.btn}>
                    <Text style={styles.text}>Back</Text>
                </TouchableOpacity>
            </View>
            <View>
                <LaundryList />
            </View>
        </ScrollView >
    )
}

const styles = StyleSheet.create({
    rangeText: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        width: "92%",
    },
    rangeTextContainer: {
        height: 42,
        width: "48%",
        borderRadius: 25,
        marginTop: 20,
    },
    rangeTextBox: {
        height: 42,
        borderRadius: 25,
        borderColor: "#0B3270",
        borderWidth: 1,
        paddingLeft: 15
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    deleteIcon: {
        fontSize: 25,
    },
    view: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    view2: {
        width: "92%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        flexDirection: 'row',

    },
    btn: {
        borderRadius: 20,
        backgroundColor: colors.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        width: "20%",
        marginLeft: "2.5%",
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
    buttonView: {
        justifyContent: 'space-between',
        marginTop: 30,
        flexDirection: 'row',
    },
    btn: {
        borderRadius: 20,
        backgroundColor: colors.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        width: "20%",
        marginLeft: "2.5%",
    },
})