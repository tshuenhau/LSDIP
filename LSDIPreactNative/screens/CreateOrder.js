import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    Alert,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";
import OutletDetail from './OutletDetail';
import { color, greaterThan } from "react-native-reanimated";
import { where, query, collection, QuerySnapshot } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";
import { DrawerContentScrollView } from "@react-navigation/drawer";
//import { SlideFromRightIOS } from "@react-navigation/stack/lib/typescript/src/TransitionConfigs/TransitionPresets";


export default function CreateOrder() {
    const db = firebase.firestore();
    const customer = useState("");
    const order = useState("");
    const cart = useState("");
    const [itemList, setItemList] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const allItems = db.collection('laundryItem');
    
    //showthelist(allItems);

    useEffect(() => {
        allItems.onSnapshot(querySnapshot => {
            querySnapshot.forEach(doc => {
                const { laundryItemName, typeOfServices, upperPricing, lowerPricing, pricingMethod } = doc.data();
                itemList.push({
                    id: doc.id,
                    laundryItemName,
                    typeOfServices,
                    upperPricing,
                    lowerPricing,
                    pricingMethod
                });
            });
            setItemList(itemList);
        });
       }, []);

    function showthelist(allItems) {
        const items = allItems.get().then(QuerySnapshot => {
            QuerySnapshot.docs.map(doc => {
                console.log(doc.data());
                return doc.data();
            });
        });
        return items;
    }

    function showLI() {
        //document.getElementById("laundrylist").innerHTML = getLaundrylist(itemList);
        const styles = StyleSheet.create({       
            card: {
                backgroundColor: '#fff',
                marginVertical: 10,
                borderRadius: 10,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowOffset: {
                    width: 0,
                    height: 3,
                },
                elevation: 3,
                height: 40,
                marginLeft: "auto",
                marginRight: "auto"
            },
        })
        document.getElementById("laundrylist").innerHTML = "<View id='ll'><Text>Hi</Text></View>";
        document.getElementById("ll").styles = {styles};
        /*
        document.getElementById("ll").style.backgroundColor = '#fff';
        document.getElementById("ll").style.marginVertical = 10;
        document.getElementById("ll").style.borderRadius = 10;
        document.getElementById("ll").style.shadowColor = '#000';
        document.getElementById("ll").style.shadowOpacity = 0.2;
        document.getElementById("ll").style.shadowOffset = {width: 0, height: 3,};
        document.getElementById("ll").style.elevation = 3;
        document.getElementById("ll").style.marginLeft = 'auto';
        document.getElementById("ll").style.marginRight = 'auto';
        document.getElementById("ll").style.height = 40;
        */
        
        document.getElementById("laundrylineitems").style.display = "block"; 
    }

    function getLaundrylist(itemList) {
        console.log("getlaundrylist function");
        console.log(itemList);
        if (itemList === undefined || itemList.length === 0) {
            return <ul>No Items</ul>;
        }
/*
        const data = itemList.filter(element => element.typeOfServices == 'Wet Wash');
        let result = "";
        if (data.length === 0) {
            result += "<ul>No Items</ul>";
            return result;
        }
        data.forEach(element => {
            result += "<View style={styles.card}><Text style={styles.itemText}>";
            result += element.laundryItemName;
            result += "</Text></View>";
        });
        console.log(data);
        return result;
        */
        return "<card>test  </card>";
    }

    function hideLI() {
        document.getElementById("laundrylineitems").style.display = "none";
    }

    function showDI() {
        document.getElementById("drycleanlist").innerHTML = getDrycleanList();
        document.getElementById("drycleanlineitems").style.display = "block";
    }

    function getDrycleanList() {    
        console.log("getdrycleanlist function");
        console.log(itemList);
        if (itemList === undefined || itemList.length === 0) {
            return <ul>No Items</ul>;
        }

        const data = itemList.filter(element => element.typeOfServices == 'Dry Clean');
        let result = "<ul>";
        data.forEach(element => {
            result += "<li style='color:red;'>";
            result += element.laundryItemName;
            result += "</li>";
        });
        if (data.length === 0) {
            result += "No Items</ul>";
            return result;
        }
        result += "</ul>";
        console.log(data);
        return result;
    }

    function hideDI() {
        document.getElementById("drycleanlineitems").style.display = "none";
    }

    function showOI() {
        //document.getElementById("otherlist").innerHTML = getOtherList();
        document.getElementById("otherlineitems").style.display = "block";
    }

    function getOtherList() {
        console.log("getotherlist function");
        console.log(itemList);
        if (itemList === undefined || itemList.length === 0) {
            return <ul>No Items</ul>;
        }

        const data = itemList.filter(element => element.typeOfServices != 'Wet Wash' && 
            element.typeOfServices != 'Dry Clean');
        let result = "<ul>";
        data.forEach(element => {
            result += "<li>";
            result += element.laundryItemName;
            result += "</li>";
        });
        if (data.length === 0) {
            result += "No Items</ul>";
            return result;
        }
        result += "</ul>";
        console.log(data);
        return result;
    }

    function hideOI() {
        document.getElementById("otherlineitems").style.display = "none";
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text>render item text</Text>
            </View>
            {expandedItem === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Name: {item.laundryItemName} </Text>
                    </View>
                    <View style={styles.cardButtons}>
                        <FontAwesome
                            color="black"
                            name="edit"
                            onPress={() => navigation.navigate()}
                        />
                    </View>
                </View>
            )}

        </TouchableOpacity>
    );

    return (
        <View>
            <Text>Outlet Name: </Text>
            <button style={styles.button} onClick={() => showLI()}>Show Laundry Items</button>
            <div id="laundrylineitems" style={styles.div}>
                <div id="laundrylist"></div>
                <button onClick={() => hideLI()}>Hide Laundry Items</button>
            </div>
            <button style={styles.button} onClick={() => showDI()}>Show Dry Clean Items</button>
            <div id="drycleanlineitems" class="dropdown-items" style={styles.div}> 
               <div id="drycleanlist"></div>
                <button onClick={() => hideDI()}>Hide Dry Clean Items</button>
            </div>
            <button style={styles.button} onClick={() => showOI()}>Show Other Items</button>
            <div id="otherlineitems" class="dropdown-items" style={styles.div}> 
                <div id="otherlist">
                    <View style={styles.card}>
                        Name:  
                    </View>
                    <View style={styles.card}>item1</View>
                </div>
                <button onClick={() => hideOI()}>Hide Other Items</button>
            </div>
            <div>
            <View style={styles.card}>
                Name:  
            </View>
            </div>
            
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
       height: 60,
       width: "80%",
       backgroundColor: "#0B3270",
       color: "#fff",
       fontSize: 20,
       borderRadius: 25,
       marginTop: 20,
       marginLeft: "auto",
       marginRight: "auto"
    },

    div: {
        marginLeft: "auto",
        marginRight: "auto",
        display: "none"
    },

    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },

    card: {
        backgroundColor: '#fff',
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
        height: 40,
        marginLeft: "auto",
        marginRight: "auto"
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },

    itemContainer: {
        backgroundColor: colors.lightGray,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        paddingVertical: 8,
        paddingRight: 20,
    },

    itemText: {
        flex: 1,
        fontSize: 16,
    },

    text: {
        color: "#0B3270"
    }
})


