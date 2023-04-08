import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { firebase } from "../config/firebase";

export default function AdminRosterOutlet({ navigation }) {

    const [outletList, setOutletList] = useState([]);
    const outlets = firebase.firestore().collection('outlet');
    const [searchQuery, setSearchQuery] = useState("");

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
                {/*<View style={styles.cardButtons}>
                    <FontAwesome
                        style={styles.outletIcon}
                        color="green"
                        name="edit"
                    />
    </View>*/}
            </View>
        </TouchableOpacity>
    );

    const filteredAdminRosteringList = outletList.filter((outlet) =>
        outlet.outletName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.searchText}>Admin Rostering List </Text>
            <View style={styles.header}>
                <View style={styles.searchnfilter}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search by Name"
                        />
                    </View>
                </View>
            </View>
            <View>
                <FlatList
                    data={filteredAdminRosteringList}
                    keyExtractor={outlet => outlet.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.noDataText}>No Data Found!</Text>
                    }
                />
            </View>
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
    container: {
        backgroundColor: colors.lightGray,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '4%',
        width: '95%',
        marginBottom: 20,
    },
    header: {
        width: "97%",
        flexDirection: "row",
        marginTop: 40
    },
    searchnfilter: {
        flexDirection: 'row',
        width: "100%",
        marginLeft: 15
      },
    searchContainer: {
        width: "100%",
        marginVertical: 15,
        marginLeft: "auto",
        marginRight: "auto",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#f5f5f5',
        backgroundColor: colors.themelight,
        alignItems: "center",
        flexDirection: "row"
    },
    searchInput: {
        height: 40,
        fontSize: 18,
        width:'100%',
        marginLeft: 10,
        paddingHorizontal: 10
    },
    searchText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
        float: "left"
    },
})