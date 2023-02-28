import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { firebase } from '../config/firebase';
import OrderDetails from "../components/OrderDetails";
import colors from '../colors';
import OrderPage from '../screens/OrderPage';
import { FontAwesome } from '@expo/vector-icons';
//import SearchBar from "react-native-elements";
import SearchBar from './SearchBar';
import { TextInput } from 'react-native-gesture-handler';
import TextBox from './TextBox';
import { setStatusBarNetworkActivityIndicatorVisible } from 'expo-status-bar';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrdersList({ navigation }) {
  const [orderList, setOrderList] = useState([]);
  const [originalOrders, setOriginalOrders] = useState([]);
  //for search bar
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  
  useEffect(() => {
    const orders = firebase.firestore().collection('orders');
    const unsubscribe = orders.onSnapshot((querySnapshot) => {
      const orderList = [];
      querySnapshot.forEach((doc) => {
        const { customerName,
          date,
          orderItems,
          outletId,
          orderStatus,
          totalPrice } = doc.data();
        orderList.push({
          id: doc.id,
          customerName,
          date,
          orderItems,
          outletId,
          orderStatus,
          totalPrice,
        });
        originalOrders.push({
          id: doc.id,
          customerName,
          date,
          orderItems,
          outletId,
          orderStatus,
          totalPrice,
        });
      });
      setOrderList(orderList);
      setOriginalOrders(originalOrders);
    });
    return () => unsubscribe();
  }, []);


  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedOrder === id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(id);
    }
  };

  const formatOrderNumber = (id) => {
    return '#' + id.slice(0, 4).toUpperCase();
  };

  const formatOrderDate = (date) => {
    //return date.toDate().toLocaleString();
    return date;
  };

  function filterOrder(text) {
    const filteredOrders = originalOrders.filter(l => l.customerName.toUpperCase().includes(text.toUpperCase().trim().replace(/\s/g, "")));
    console.log("seacrhing");
    //console.log(originalOrders);
    //console.log(filteredOrders);
    orderList.splice(0, orderList.length, ...filteredOrders);
    //console.log(orderList);
    if (orderList.length === 0) {
      renderItem;
    }
    toggleExpand(orderList[0].id);
    //renderItem2;
  }
  
  const renderItem = ({ item: order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => toggleExpand(order.id)}
      activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{formatOrderNumber(order.id)}</Text>
        {/* date display todo */}
        {/* <Text style={styles.orderDate}>{formatOrderDate(order)}</Text> */}
        <Text style={styles.orderNumber}>{order.orderStatus}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('OrderPage', { orderId: order.id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      {expandedOrder === order.id && (
        <View style={styles.cardBody}>
          <Text style={styles.orderNumber}>Customer: {order.customerName}</Text>
          <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
          <Text style={styles.orderNumber}>Total Price: {order.totalPrice}</Text>
          <OrderDetails data={order.id}></OrderDetails>
          {/* <FlatList */}
          {/* style={styles.cardBody} */}
          {/* data={order.orderItems} */}
          {/* keyExtractor={(item) => item.id} */}
          {/* renderItem={({ item }) => ( */}
          {/* <View style={styles.itemContainer}> */}
          {/* <Text style={styles.itemText}>{item}</Text> */}
          {/* <Text style={styles.itemPrice}>${item.price}</Text> */}
          {/* </View> */}
          {/* )} */}
          {/* /> */}
        </View>
      )}
    </TouchableOpacity>
  );

  /*
  const _onChangeText(text) {
    if (text) {
      this.setState({inputValue: text});
      clearTimeout(this.settimeId);
      this.settimeId = setTimeout(() => {
        var jsonData = {
          "sessionId": global.appInfo.sessionId,
          "merchName": text,
        };
        console.log(jsonData);
        Utils.fetchData('OrdersList', jsonData, this.searchCallback)}, 1000);
        console.log("id: " + this.settimeId);
    } else {
      this.setState({inputValue: ''})
    }
  }
  */


  return (
    <View style={styles.container}>
      {/*
        <SafeAreaView style={styles.root}>
        <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            clicked={clicked}
            setClicked={setClicked}
            onChangeText = {(text) => searchOrder(text)}
        />
        
  </SafeAreaView> */}
      <View style = {styles.searchbarContainer}>
        <View style={styles.searchbar}>
          <FontAwesome name="search" size={21} color="black" style={{marginTop: "auto", marginBottom: "auto"}}/>
          <TextBox placeholder="Search Order" underlineColorAndroid={"transparent"} style={{marginLeft: 20, width: 150}}
            onChangeText={text => filterOrder(text)} />
          <TouchableOpacity onPress={Keyboard.dismiss()}>
            <Text style={{color: '#0391ff', fontSize: 14}}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {/*<View style={styles.searchbar}>
          <FontAwesome name="search" size={21} color="black" style={{marginTop: "auto", marginBottom: "auto"}}/>
          <TextInput placeholder="Search Order" underlineColorAndroid={"transparent"} style={{marginLeft: 20, width: 150}}
            onChangeText={this._onChangeText.bind(this)} 
            value = {this.state.inputValue}
            ref = "keyWordInput"
            onSubmitEditing={() => {this.refs.keyWordInput.blur()}}/>
          <TouchableOpacity onPress={Keyboard.dismiss()}>
            <Text style={{color: '#0391ff', fontSize: 14}}>Cancel</Text>
          </TouchableOpacity>
        </View>*/}
      </View>
      <FlatList
        style={styles.list}
        data={orderList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No Data Found!</Text>
        }
      />
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => setExpandedOrder(null)}
        activeOpacity={0.8}>
        <Text style={styles.refreshButtonText}>Refresh Orders</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  noDataText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: colors.gray,
  },
  cardBody: {
    backgroundColor: colors.lightGray,
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkBlue,
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  refreshButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    alignSelf: 'center',
    marginTop: 32,
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchbarContainer: {
    paddingRight: "15",
    paddingLeft: "15",
    marginTop: 10,
    marginRight: "20%",
    width: "80%"
  },
  searchbar: {
    height: 40, 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    paddingLeft: 25, 
    flexDirection: 'row', 
    alignItems: 'center'
  }
});