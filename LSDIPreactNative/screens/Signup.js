// import React, { useState } from 'react';
// import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../config/firebase';
// const backImage = require("../assets/backImage.jpg");

// export default function Signup({ navigation }) {

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const onHandleSignup = () => {
//     if (email !== '' && password !== '') {
//       createUserWithEmailAndPassword(auth, email, password)
//         .then(() => console.log('Signup success'))
//         .catch((err) => Alert.alert("Login error", err.message));
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Image source={backImage} style={styles.backImage} />
//       <View style={styles.whiteSheet} />
//       <SafeAreaView style={styles.form}>
//         <Text style={styles.title}>Sign Up</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter email"
//           autoCapitalize="none"
//           keyboardType="email-address"
//           textContentType="emailAddress"
//           autoFocus={true}
//           value={email}
//           onChangeText={(text) => setEmail(text)}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Enter password"
//           autoCapitalize="none"
//           autoCorrect={false}
//           secureTextEntry={true}
//           textContentType="password"
//           value={password}
//           onChangeText={(text) => setPassword(text)}
//         />
//         <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
//           <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Sign Up</Text>
//         </TouchableOpacity>
//         <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
//           <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Don't have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate("Login")}>
//             <Text style={{ color: '#0782F9', fontWeight: '600', fontSize: 14 }}> Log In</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//       <StatusBar barStyle="light-content" />
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: "#0782F9",
//     alignSelf: "center",
//     paddingBottom: 24,
//   },
//   input: {
//     backgroundColor: "#F6F7FB",
//     height: 58,
//     marginBottom: 20,
//     fontSize: 16,
//     borderRadius: 10,
//     padding: 12,
//   },
//   backImage: {
//     width: "100%",
//     height: 340,
//     position: "absolute",
//     top: 0,
//     resizeMode: 'cover',
//   },
//   whiteSheet: {
//     width: '100%',
//     height: '75%',
//     position: "absolute",
//     bottom: 0,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 60,
//   },
//   form: {
//     flex: 1,
//     justifyContent: 'center',
//     marginHorizontal: 30,
//   },
//   button: {
//     backgroundColor: '#0782F9',
//     height: 58,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 40,
//   },
// });
import React, { useState } from 'react'
import { Text, View, StyleSheet } from "react-native"
import TextBox from "../components/TextBox"
import Btn from "../components/Button"
import { firebase } from "../config/firebase";
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignUpScreen({ navigation }) {

    const firestore = firebase.firestore;
    const auth1 = firebase.auth;

    const [values, setValues] = useState({
        name: "",
        role: "",
        email: "",
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

        const { email, pwd, pwd2, name, role } = values

        if (pwd == pwd2) {
            auth1().createUserWithEmailAndPassword(email, pwd)
                .then(() => {
                    firestore().collection("users").doc(auth1().currentUser.uid).set({
                        uid: auth1().currentUser.uid,
                        name,
                        role,
                        email
                    })
                })
                .catch((error) => {
                    alert(error.message)
                    // ..
                });
        } else {
            alert("Passwords are different!")
        }
    }

    return <View style={styles.view}>
        <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Sign Up</Text>
        <TextBox placeholder="Full Name" onChangeText={text => handleChange(text, "name")} />
        <TextBox placeholder="Email Address" onChangeText={text => handleChange(text, "email")} />
        <TextBox placeholder="Who are you? (Admin, Staff, Driver or User)" onChangeText={text => handleChange(text, "role")}/>
        <TextBox placeholder="Password" secureTextEntry={true}  onChangeText={text => handleChange(text, "pwd")}/>
        <TextBox placeholder="Confirm Password" secureTextEntry={true}  onChangeText={text => handleChange(text, "pwd2")}/>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%", }}>
            <Btn onClick={() => SignUp()} title="Sign Up" style={{ width: "48%" }} />
            <Btn onClick={() => navigation.replace("Login")} title="Login" style={{ width: "48%", backgroundColor: "#344869" }} />
        </View>
    </View>
}

const styles = StyleSheet.create({
  view: {
      // flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center"
  }
})