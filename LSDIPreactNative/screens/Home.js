import React, { useEffect } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { Entypo } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";

export default function Home({ navigation }) {

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

    const handleSignOut = () => {
        auth.signOut()
            // redundant
            // .then(() => {
            //     navigation.replace("Login")
            // })
            .catch(error => alert(error.message))
    }

    useEffect(() => {
        navigation.setOptions({
            // this replaces the hamburger menu
            // headerLeft: () => (
            //     <FontAwesome name="home" size={24} color={colors.gray} style={{ marginLeft:  }} />
            // ),
            headerRight: () => (
                <Image
                    //source={{ uri: catImageUrl }}
                    source={require('../assets/washin.jpg')}
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
                <View style={styles.loggedInContainer}>
                    <Text>Email: {auth.currentUser?.email}</Text>
                    <TouchableOpacity
                        onPress={handleSignOut}
                        style={styles.signOutContainer}
                    >
                        <Text style={styles.signOutText}>Sign out</Text>
                    </TouchableOpacity>
                </View>
            }

            <OrdersList />

            <View style={styles.chatContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Chat")}
                    style={styles.chatButton}
                >
                    <Entypo name="chat" size={24} color={colors.lightGray} />
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    chatContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        backgroundColor: "#fff",
    },
    loggedInContainer: {
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
    signOutContainer: {
        backgroundColor: '#0782F9',
        width: '60%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 40,
    },
    signOutText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});