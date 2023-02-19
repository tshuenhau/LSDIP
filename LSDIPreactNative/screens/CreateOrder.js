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
import Bbtn from "../components/BigButton";
import colors from '../colors';
import { firebase } from "../config/firebase";
import OutletDetail from './OutletDetail';


export default function CreateOrder() {
    return (
        <View>
            <Text>Create Order Page Placeholder</Text>
            <Bbtn>Show Laundry Items</Bbtn>
        </View>
    )
}


/*
export default function CreateOrder() {

    const db = firebase.firestore();
    const customer = useState("");
    const order = useState("");
    const cart = useState("");
    const laundryItems = db.collection('laundryItem');
    const drycleanItems = db.collection('laundryItem');

    return (
        <View>
            <Text>create order</Text>
            <Bbtn id="btn_show" onClick={document.getElementById("laundrylineitems").style
                .display = "block"}>Show Laundry Line Items</Bbtn>
            <div id="laundrylineitems" class="dropdown-items" style="display: none"> 
                <ul>
                    for test only
                    <li>item 1</li>
                    <li>item 2</li>
                </ul>
                <Bbtn id="btn_hide" onClick={document.getElementById("laundrylineitems").style
                .display = "none"}>Hide Laundry Line Items</Bbtn>
            </div>
            <Bbtn id="btn_show" onClick={document.getElementById("drycleanlineitems").style
                .display = "block"}>Show Dry Clean Line Items</Bbtn>
            <div id="drycleanlineitems" class="dropdown-items" style="display: none"> 
                <ul>
                    for test only
                    <li>item 3</li>
                    <li>item 4</li>
                </ul>
                <Bbtn id="btn_hide" onClick={document.getElementById("drycleanlineitems").style
                .display = "none"}>Hide Dry Clean Line Items</Bbtn>
            </div>
        </View>
    );
}
*/