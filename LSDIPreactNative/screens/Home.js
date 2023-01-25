import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { Entypo } from '@expo/vector-icons';
import { database } from "../config/firebase";
import VegaScrollList from 'react-native-vega-scroll-list';
//const catImageUrl = "https://i.guim.co.uk/img/media/26392d05302e02f7bf4eb143bb84c8097d09144b/446_167_3683_2210/master/3683.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=49ed3252c0b2ffb49cf8b508892e452d";

//const DATA = [];
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
    <View style={styles.items}>
        <Text style={styles.itemsText}>{title}</Text>
    </View>
);

const Home = () => {

    const navigation = useNavigation();

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
                    <FlatList
                        data={DATA}
                        renderItem={({item}) => <Item style={styles.items} title={item.title} />}
                        keyExtractor={item => item.id}
                    />
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
            // backgroundColor: "#75c4f3",
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
        }
    });