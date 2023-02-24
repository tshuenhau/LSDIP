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
import { color } from "react-native-reanimated";
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

    const otherItems = db.collection('laundryItem');

    function showLI() {
        document.getElementById("laundrylist").innerHTML = getLaundrylist(itemList);
        document.getElementById("laundrylineitems").style.display = "block"; 
    }

    function getLaundrylist(itemList) {
        console.log("getlaundrylist function");
        console.log(itemList);
        if (itemList === undefined || itemList.length === 0) {
            return <ul>No Items</ul>;
        }

        const data = itemList.filter(element => element.typeOfServices == 'Wet Wash');
        let result = "<ul>";
        if (data.length === 0) {
            result += "No Items</ul>";
            return result;
        }
        data.forEach(element => {
            result += "<li>";
            result += element.laundryItemName;
            result += "</li>";
        });
        result += "</ul>";
        console.log(data);
        return result;
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

    function hideDI() {
        document.getElementById("drycleanlineitems").style.display = "none";
    }

    function showOI() {
        document.getElementById("otherlist").innerHTML = getOtherList();
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
                <div id="otherlist"></div>
                <button onClick={() => hideOI()}>Hide Other Items</button>
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
    }
})


