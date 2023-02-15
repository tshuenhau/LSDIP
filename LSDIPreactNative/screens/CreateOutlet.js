import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import TextBox from "../components/TextBox"
import Btn from "../components/Button"
import { firebase } from "../config/firebase";

export default function CreateOutlet({ navigation }) {

    const firestore = firebase.firestore();

    const initialValues = {
        outletName: "",
        outletAddress: "",
        outletNumber: "",
        outletEmail: ""
    };

    const [values, setValues] = useState(initialValues);

    // const clearState = () => {
    //     setValues({ ...initialValues });
    // }

    function handleChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    function createOutlet() {
        firestore.collection('outlet')
            .add(values)
            .then(() => {
                console.log("Success")
            }).catch((err) => {
                console.log(err)
            })

    }

    return (
        <View style={styles.view}>
            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Outlet</Text>
            <TextBox placeholder="Outlet Name" onChangeText={text => handleChange(text, "outletName")} />
            <TextBox placeholder="Outlet Address" onChangeText={text => handleChange(text, "outletAddress")} />
            <TextBox placeholder="Outlet Number" onChangeText={text => handleChange(text, "outletNumber")} />
            <TextBox placeholder="Outlet Email" onChangeText={text => handleChange(text, "outletEmail")} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                <Btn onClick={() => createOutlet()} title="Create" style={{ width: "48%" }} />
                <Btn onClick={() => navigation.goBack()} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    }
})