import React, { useState } from 'react'
import { Text, View, StyleSheet } from "react-native"
import TextBox from "../components/TextBox"
import Btn from "../components/Button"
import { SelectList } from 'react-native-dropdown-select-list'
import { firebase } from "../config/firebase";
import Toast from 'react-native-toast-message';

export default function SignUpScreen({ navigation }) {

    const firestore = firebase.firestore;
    const auth1 = firebase.auth;

    const [values, setValues] = useState({
        name: "",
        role: "Customer",
        email: "",
        number: "",
        address: "",
        points: 0,
        expenditure: 0,
        pwd: "",
        pwd2: ""
    })

    function handleChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    function SignUp() {
        const { email, pwd, pwd2, name, role, number, address, points, expenditure } = values
        if (pwd == pwd2) {
            auth1().createUserWithEmailAndPassword(email, pwd)
                .then(() => {
                    firestore().collection("users").doc(auth1().currentUser.uid).set({
                        uid: auth1().currentUser.uid,
                        name,
                        role,
                        email,
                        address,
                        points,
                        expenditure,
                        number
                    })
                    Toast.show({
                        type: 'success',
                        text1: 'Account created',
                    });
                    navigation.navigate("Login")
                })
                .catch((error) => {
                    //alert(error.message)
                    Toast.show({
                        type: 'error',
                        text1: error.message,
                    });
                });

            
        } else {
            //alert("Passwords are different!")
            Toast.show({
                type: 'error',
                text1: 'Passwords are different!',
            });
        }
    }

    return <View style={styles.view}>
        <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Sign Up</Text>
        <TextBox placeholder="Full Name" onChangeText={text => handleChange(text, "name")} />
        <TextBox placeholder="Email Address" onChangeText={text => handleChange(text, "email")} />
        <TextBox placeholder="Phone Number" onChangeText={text => handleChange(text, "number")} />
        <TextBox placeholder="Address" onChangeText={text => handleChange(text, "address")} />
        <TextBox placeholder="Password" secureTextEntry={true} onChangeText={text => handleChange(text, "pwd")} />
        <TextBox placeholder="Confirm Password" secureTextEntry={true} onChangeText={text => handleChange(text, "pwd2")} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%", }}>
            <Btn onClick={() => SignUp()} title="Sign Up" style={{ width: "48%" }} />
            <Btn onClick={() => navigation.replace("Login")} title="Back" style={{ width: "48%", backgroundColor: "#344869" }} />
        </View>
    </View>
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    }
})
