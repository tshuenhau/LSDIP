import React, { useState } from "react";
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert, Platform } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { firebase } from "../config/firebase";
const backImage = require("../assets/backImage.jpg");
import Toast from 'react-native-toast-message';

export default function Login({ navigation }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth1 = firebase.auth;
  const firestore = firebase.firestore;
  const [user, setUser] = useState(null)

  const onHandleLogin = () => {
    if (email !== "" && password !== "") {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          firestore().collection("users").doc(auth1().currentUser.uid).get()
            .then(user => {
              setUser(user.data())
              console.log(user.data().role)
              if (user.data().role === "Disabled") {
                Toast.show({
                  type: 'info',
                  text1: 'Account is disabled',
                });
                navigation.navigate("Login")
              }
            })
        })
        .catch((err) => {
          console.log("Login error")
          const errorCode = err.code;
          console.log(errorCode);
          if (errorCode === 'auth/wrong-password') {
            //alert('Wrong Password');
            Toast.show({
              type: 'error',
              text1: 'Wrong Password',
          });
          } else {
            //alert("Login error", err)
            Toast.show({
              type: 'error',
              text1: 'Login error',
          });
          }
        });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        {Platform.OS === 'android' &&
          <Text style={styles.title1}>Log In</Text>
        }
        {Platform.OS === 'web' &&
          <Text style={styles.title}>Log In</Text>
        }

        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={onHandleLogin}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Log In</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={{ color: '#0782F9', fontWeight: '600', fontSize: 14 }}> Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', alignSelf: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={{ color: '#0782F9', fontWeight: '600', fontSize: 14 }}> Forgot Password</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "#0782F9",
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingBottom: 24,
    marginTop: 30,
  },
  title1: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "#0782F9",
    paddingRight: 30,
    paddingLeft: 30,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 40,
    marginTop: 30,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  backImage: {
    width: "100%",
    height: 340,
    position: "absolute",
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#0782F9',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
