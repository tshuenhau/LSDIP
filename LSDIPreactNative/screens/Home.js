import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { Entypo } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { firebase } from "../config/firebase";
import {Card} from 'react-native-paper';
//const catImageUrl = "https://i.guim.co.uk/img/media/26392d05302e02f7bf4eb143bb84c8097d09144b/446_167_3683_2210/master/3683.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=49ed3252c0b2ffb49cf8b508892e452d";

const DATA = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      title: 'First Item',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Second Item',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Third Item',
    },
  ];
  
const Item = ({title}) => (
    <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
    </View>
);

const Home = () => {

    const navigation = useNavigation();

    const handleSignOut = () => {
        auth
          .signOut()
          .then(() => {
            navigation.replace("Login")
          })
          .catch(error => alert(error.message))
      }

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <FontAwesome name="home" size={24} color={colors.gray} style={{marginLeft: 15}}/>
            ),
            headerRight: () => (
                <Image
                    //source={{ uri: catImageUrl }}
                    source = {require('../assets/washin.jpg')}
                    style={{
                        width: 40,
                        height: 40,
                        marginRight: 15,
                    }}
                />
            ),
        });
    }, [navigation]);
    const OrdersList = () => {
        const [orderlist, setOrderList] = useState([]);
        const orders = firebase.firestore().collection('orders');
        orders.onSnapshot(
            querySnapshot => {
                const orderlist= []
                querySnapshot.forEach((doc) => {
                    const {date, items} = doc.data()
                    orderlist.push({
                        id: doc.id,
                        date,
                        items,
                    })
                })
                setOrderList(orderlist);
            }
        )
        // return <FlatList
        //     data={orderlist}
        //     renderItem={({item}) => <Item style={styles.items} title={item.id} />}
        //     keyExtractor={item => item.id}
        // />
        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
          }
          
          function formatDate(date) {
            return (
              [
                padTo2Digits(date.getMonth() + 1),
                padTo2Digits(date.getDate()),
                date.getFullYear(),
              ].join('/') +
              ' ' +
              [
                padTo2Digits(date.getHours()),
                padTo2Digits(date.getMinutes()),
                padTo2Digits(date.getSeconds()),
              ].join(':')
            );
          }
          
        return <FlatList
                data={orderlist}
                keyExtractor={order => order.id}
                renderItem={({ item: order }) => (
                    <Card>
                        <View>
                            <Text>Order Date: {formatDate(new Date(order.date.toMillis()))}</Text>
                            <FlatList
                            data={order.items}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <View>
                                <Text>Item Name: {item}</Text>
                                {/* <Text>Item Quantity: {item.quantity}</Text>
                                <Text>Item Price: {item.price}</Text> */}
                                </View>
                            )}
                            />
                        </View>
                    </Card>
                )}
            />
        console.log(orderlist);
        console.log("here");
        
        // ({ orderlist }) => () =>{
        //     return (
        //     <FlatList
        //         data={orderlist}
        //         keyExtractor={order => order.id}
        //         renderItem={({ item: order }) => (
        //         <View>
        //             <Text>Order Date: {order.date}</Text>
        //             <FlatList
        //             data={order.items}
        //             keyExtractor={item => item.id}
        //             renderItem={({ item }) => (
        //                 <View>
        //                 <Text>Item Name: {item.text}</Text>
        //                 {/* <Text>Item Quantity: {item.quantity}</Text>
        //                 <Text>Item Price: {item.price}</Text> */}
        //                 </View>
        //             )}
        //             />
        //         </View>
        //         )}
        //     />
        //     );
        // };
        
    }
    function showOrders() {
        console.log("in method");
        ({ orderlist }) => {
            return (
            <FlatList
                data={orderlist}
                keyExtractor={order => order.id}
                renderItem={({ item: order }) => (
                <View>
                    <Text>Order Date: {order.date}</Text>
                    <FlatList
                    data={order.items}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View>
                        <Text>Item Name: {item.text}</Text>
                        {/* <Text>Item Quantity: {item.quantity}</Text>
                        <Text>Item Price: {item.price}</Text> */}
                        </View>
                    )}
                    />
                </View>
                )}
            />
            );
        };
    }
    return (
        <View>
            {/* <VegaScrollList
                distanceBetweenItem={12} // Add distance between item. Need to calculate animated
                data={DATA}
                keyExtractor={item => item.id}
                renderItem={({item}) => <Item title={item.title} />}
            /> */}
            {!DATA && <Text> No Data found! </Text>}
            {DATA && 
                <View style={styles.container1}>   
                    <Text>Email: {auth.currentUser?.email}</Text>
                    <TouchableOpacity
                        onPress={handleSignOut}
                        style={styles.button1}
                    >
                        <Text style={styles.buttonText1}>Sign out</Text>
                    </TouchableOpacity>      
                    <FlatList
                        data={DATA}
                        renderItem={({item}) => <Item style={styles.items} title={item.title} />}
                        keyExtractor={item => item.id}
                    />
                    {/* <FlatList
                        data={orderlist}
                        renderItem={({item}) => {
                            console.log(item)
                            let items = [];
                            if(item.items.length > 0) {
                                item.newRow.map(row => {
                                return <Text>{row}</Text>
                              })
                            } 
                            <Item style={styles.items} title={item.id} />
                            {items}
                        }}
                        keyExtractor={order => order.id}
                    /> */}
                    <OrdersList/>
                    <TouchableOpacity onPress={showOrders} style={styles.button1}>
                        <Text style={styles.buttonText1}>Show Orders</Text>
                    </TouchableOpacity>
                </View>
            }
            <View style={styles.container}>
                <TouchableOpacity 
                    onPress={() => navigation.navigate("Chat")}
                    style={styles.chatButton}
                >
                    <Entypo name="chat" size={24} color={colors.lightGray} />
                </TouchableOpacity>
            </View>
            <OrdersList/>
        </View>
    );
    };

    export default Home;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            backgroundColor: "#fff",
        },
        container1: { 
            width: '100%',
            alignItems: 'center', 
            justifyContent: 'center'
            //alignItems: "center",
            //alignContent: "center",
        },
        chatButton: {
            backgroundColor: colors.primary,
            height: 50,
            width: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: .9,
            shadowRadius: 8,
            marginRight: 20,
            marginBottom: 50,
        },
        items: {
            // backgroundColor: "#0782F9",
            // borderWidth: 1,
            // borderColor: "#333",
            // padding: 25,
            marginTop: 20,
            marginBottom: 20,
            // marginLeft: 20,
            // marginRight: 20,
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#CCCCCC',
            backgroundColor: '#FFFFFF',
            borderRadius: 40,
            width: '100%',
        },
        itemsText: {
            fontSize: 20,
            textAlign: 'center',
        },
        container2: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          },
        button1: {
            backgroundColor: '#0782F9',
            width: '60%',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 40,
          },
          buttonText1: {
            color: 'white',
            fontWeight: '700',
            fontSize: 16,
          },
    });