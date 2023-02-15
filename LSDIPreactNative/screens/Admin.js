import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import OutletList from "../components/OutletList";

export default function Admin({ navigation }) {

    return (
        <View>
            <View style={styles.view}>
                <TouchableOpacity onPress={() => navigation.navigate('CreateOutlet')}
                    style={styles.btn}>
                    <Text style={styles.text}>Create Outlet</Text>
                </TouchableOpacity>
            </View>
            <OutletList />
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
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    btn: {
        height: 42,
        width: "48%",
        borderRadius: 25,
        marginTop: 20,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff"
    }
})

