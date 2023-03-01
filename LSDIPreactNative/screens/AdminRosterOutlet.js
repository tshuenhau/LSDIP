import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { firebase } from "../config/firebase";

export default function AdminRosterOutlet({ navigation }) {

    const [outletList, setOutletList] = useState([]);
    const outlets = firebase.firestore().collection('outlet');

    useEffect(() => {
        outlets.onSnapshot(querySnapshot => {
            const outletList = [];
            querySnapshot.forEach(doc => {
                const { outletAddress, outletEmail, outletName, outletNumber } = doc.data();
                outletList.push({
                    id: doc.id,
                    outletName,
                    outletAddress,
                    outletNumber,
                    outletEmail
                });
            });
            setOutletList(outletList);
        });
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Outlet Scheduling', { item })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.outletName}>{item.outletName} </Text>
            </View>
            <View style={styles.itemContainer}>
                <View style={styles.cardBody}>
                    <Text style={styles.itemText}>Address: {item.outletAddress} </Text>
                    <Text style={styles.itemText}>Number: {item.outletNumber} </Text>
                    <Text style={styles.itemText}>Email: {item.outletEmail} </Text>
                </View>
                <View style={styles.cardButtons}>
                    <FontAwesome
                        style={styles.outletIcon}
                        color="green"
                        name="edit"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View>
            <FlatList
                data={outletList}
                keyExtractor={outlet => outlet.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No Data Found!</Text>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    outletName: {
        fontSize: 20,
        fontWeight: 'bold',
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
    cardBody: {
        padding: 16,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    outletIcon: {
        fontSize: 25,
        margin: 10,
    },
    noDataText: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    // view: {
    //     width: "100%",
    //     justifyContent: "center",
    //     alignItems: "center"
    // },
    // text: {
    //     fontSize: 20,
    //     fontWeight: "600",
    //     color: "#fff"
    // },
    // centeredView: {
    //     flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     marginTop: 22,
    // },
    // modalView: {
    //     margin: 20,
    //     backgroundColor: 'white',
    //     borderRadius: 20,
    //     padding: 35,
    //     alignItems: 'center',
    //     shadowColor: '#000',
    //     shadowOffset: {
    //         width: 0,
    //         height: 2,
    //     },
    //     shadowOpacity: 0.25,
    //     shadowRadius: 4,
    //     elevation: 5,
    // }
})