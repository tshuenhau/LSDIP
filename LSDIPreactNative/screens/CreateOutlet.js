import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import TextBox from "../components/TextBox"
import Btn from "../components/Button"

export default function CreateOutlet({ navigation }) {
    const [values, setValues] = useState({
        outletName: "",
        outletAddress: "",
        outletNumber: "",
        outletEmail: ""
    })

    function handleChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    function createOutlet() {
        console.log("Function todo")
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