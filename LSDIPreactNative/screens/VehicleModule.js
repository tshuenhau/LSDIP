import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { FlatList, TextInput } from 'react-native-web';
import { doc, addDoc , getFirestore, collection, getDoc, getDocs, QuerySnapshot, deleteDoc} from "firebase/firestore";
import { firebase } from "../config/firebase";
import { useNavigation } from '@react-navigation/native';


export default function VehicleModule() {     

    const [numberPlate, setNumberPlate] = useState('')
    const [vehicleStatus, setVehicleStatus] = useState('')
    const [vehicles, setVehicles] = useState([])
    const db = firebase.firestore()
    const navigation = useNavigation();

    //Create data
    function createVehicle() {
        addDoc(collection(db, "vehicles"), {
            numberPlate: numberPlate,
            vehicleStatus: vehicleStatus,

        }).then(() => {
            console.log("veh created");
        }).catch((error) => {
            console.log(error);
        })
    }

    //delete
    function deleteVehicle(id) {
      deleteDoc(doc(db, 'vehicles', id))
    }

    //read all vehicle data
    // function getAllVehicle() {
    //   getDocs(collection(db,"vehicles")).then(docSnap => {
    //     const vehicles = [];
    //     docSnap.forEach((doc) => {
    //       vehicles.push({ ...doc.data(), id:doc.id})
    //     })
    //     console.log(vehicles)
    //   })
    // }

    //read all vehicle data method 2
    useEffect(()=>{
      db.collection('vehicles')
      .onSnapshot(
        querySnapshot => {
          const vehicles = []
          querySnapshot.forEach((doc) => {
            const {numberPlate, vehicleStatus} = doc.data()
            vehicles.push({
              id: doc.id,
              numberPlate,
              vehicleStatus,
            })
          })
          setVehicles(vehicles)
        }
      )
    })



      return (
        <View style={styles.container}>
          <Text>Vehicle Management Module</Text>
          <View style={{marginTop:30}}>
            <FlatList
              style={{}}
              data = {vehicles}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <Pressable
                style={{}}>
                  <View style={{}}>
                    <Text style={{}}>{item.numberPlate}</Text>
                    <Text style={{}}>{item.vehicleStatus}</Text>
                    <button onClick = {()=>deleteVehicle(item.id)}>Delete Vehicle</button>
                    
                  </View> 
                  <br></br>
                </Pressable>
                
              )}
               />
          </View>
          <TextInput value = {numberPlate} onChangeText = {(numberPlate) => {setNumberPlate(numberPlate)}} placeholder="Number Plate" style={styles.items}></TextInput>
          <TextInput value = {vehicleStatus} onChangeText = {(vehicleStatus) => {setVehicleStatus(vehicleStatus)}} placeholder="Vehicle Status" style={styles.items}></TextInput>
        
          <button onClick = {createVehicle}>Create New Vehicle</button>
        </View>
      );
    }

    const styles = StyleSheet.create({
          container: {
            backgroundColor: '#fff',
            alignItems: 'left',
            borderWidth:1
          },
          items: {
            marginTop: 20,
            marginBottom: 20,
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#CCCCCC',
            backgroundColor: '#FFFFFF',
            borderRadius: 40,
            width: '100%',
          },
          innerContainer:{
            alignItems:'left',
            borderWidth:1,
            padding:10
          },
          itemHeading:{
            fontWeight:'bold'
          },
        });