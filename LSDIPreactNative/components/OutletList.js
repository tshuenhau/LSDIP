import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { firebase } from "../config/firebase";

export default function OutletList() {

    const [outletList, setOutletList] = useState([]);

    useEffect(() => {
        const outlets = firebase.firestore().collection('outlet');
        const unsubscribe = outlets.onSnapshot(querySnapshot => {
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
        return () => unsubscribe();
    }, []);

    return (
        <View>
            {!(outletList.length > 0) && <Text> No Data Found! </Text>}
            <View>
                <FlatList
                    data={outletList}
                    keyExtractor={outlet => outlet.id}
                    renderItem={({ item }) => (
                        <View style={styles.cards}>
                            <Text>Name: {item.outletName} </Text>
                            <Text>Address: {item.outletAddress} </Text>
                            <Text>Number: {item.outletNumber} </Text>
                            <Text>Email: {item.outletEmail} </Text>
                        </View>
                    )}
                />
            </View >
        </View>
    )
}

const styles = StyleSheet.create({
    cards: {
        backgroundColor: '#fff',
        marginBottom: 10,
        marginLeft: '2%',
        width: '96%',
        shadowColor: '#000',
        shadowOpacity: 1,
        shadowOffset: {
            width: 3,
            height: 3,
        }
    }
})