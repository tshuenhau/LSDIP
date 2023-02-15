import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, FlatList } from "react-native";
import { firebase } from "../config/firebase";
import colors from '../colors';

export default function OrdersList() {
  const [orderlist, setOrderList] = useState([]);
  
  useEffect(() => {
    const orders = firebase.firestore().collection('orders');
    const unsubscribe = orders.onSnapshot(querySnapshot => {
      const orderlist = [];
      querySnapshot.forEach(doc => {
        const { date, items } = doc.data();
        orderlist.push({
          id: doc.id,
          date,
          items,
        });
      });
      setOrderList(orderlist);
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <View style={styles.container}>
      {!(orderlist.length > 0) && <Text>No data found!</Text>}
      <View style={styles.ordersContainer}>
        <FlatList
          data={orderlist}
          keyExtractor={order => order.id}
          renderItem={({ item: order }) => (
            <View style={styles.orderCard}>
              <View style={styles.statusContainer} />
              <View style={styles.orderDetails}>
                <Text style={styles.orderDate}>{formatDate(new Date(order.date.toMillis()))}</Text>
                <FlatList
                  data={order.items}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                      <Text style={styles.itemName}>{item.text}</Text>
                      {/* <Text>Item Quantity: {item.quantity}</Text>
                      <Text>Item Price: {item.price}</Text> */}
                    </View>
                  )}
                />
              </View>
            </View>
          )}
        />
        <View style={styles.refreshContainer}>
          <TouchableOpacity onPress={() => setOrderList([])} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      height: 50,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    title: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    ordersListContainer: {
      flex: 1,
      margin: 10,
    },
    orderCard: {
      backgroundColor: '#fff',
      marginBottom: 10,
      marginLeft: '2%',
      width: '96%',
      shadowColor: '#000',
      shadowOpacity: 1,
      shadowOffset: {
        width: 3,
        height: 3,
      },
      flexDirection: 'row',
    },
    statusContainer: {
      backgroundColor: colors.primary,
      height: '100%',
      width: 10,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
    },
    orderDetails: {
      padding: 10,
      flex: 1,
    },
    orderNumber: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
    },
    orderDate: {
      color: '#666',
      fontSize: 14,
      marginBottom: 10,
    },
    orderItemsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    orderItem: {
      backgroundColor: '#eee',
      padding: 5,
      margin: 5,
      borderRadius: 5,
    },
    orderItemText: {
      fontSize: 12,
    },
    refreshContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshButton: {
      backgroundColor: colors.primary,
      width: '60%',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 40,
    },
    refreshButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noDataText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  });