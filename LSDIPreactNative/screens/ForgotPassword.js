import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import TextBox from "../components/TextBox"
import Btn from "../components/Button"
import { firebase } from "../config/firebase"
import Toast from 'react-native-toast-message';

export default function ResetPassword({ navigation }) {

    const [email, setEmail] = useState("");

    function handleChange(text, eventName) {
        setEmail(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const resetPassword = () => {
        firebase.auth()
            .sendPasswordResetEmail(email.email)
            .then(() => {
                console.log("Reset password email sent");
                navigation.replace("Login");
                Toast.show({
                    type: 'success',
                    text1: 'Email sent',
                });
            }).catch((err) => {
                navigation.replace("Login");
                console.log(err);
                Toast.show({
                    type: 'success',
                    text1: 'Email sent',
                });
            });
    }

    return (
        <View style={styles.view}>
            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Forgot Password</Text>
            <Text style={{ fontSize: 20, fontWeight: "300", marginBottom: 20 }}>Don't worry, happens to the best of us.</Text>
            <Text style={{ fontSize: 25, fontWeight: "500", width: '80%', textAlign: 'center' }}>An email will be sent to you to reset your password.</Text>
            <TextBox placeholder="Email Address" onChangeText={text => handleChange(text, "email")} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%", }}>
                <Btn onClick={() => resetPassword()} title="Email Link" style={{ width: "48%" }} />
                <Btn onClick={() => navigation.replace("Login")} title="Back" style={{ width: "48%", backgroundColor: "#344869" }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    view: {
        // flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    }
})