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
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

export default function OrderDetails(props) {
    const orderId = props.data;
    const [orderItemsList, setOrderItemsList] = useState([]);
    useEffect(() => {
      const orderItem = firebase.firestore().collection('orderItem');
      const unsubscribe = orderItem.onSnapshot((querySnapshot) => {
        const orderItemsList = [];
        querySnapshot.forEach((doc) => {
          const { description, laundryItemName, orderId, price } = doc.data();
            orderItemsList.push({
            id: doc.id,
            description, laundryItemName, orderId, price,
          });
        });
        setOrderItemsList(orderItemsList);
      });
      return () => unsubscribe();
    }, []);

    const data = orderItemsList.filter(element => element.orderId == orderId);
  
    return (
        <FlatList
          style={styles.cardBody} 
          data={data} 
          keyExtractor={(item) => item.id} 
          renderItem={({ item }) => ( 
            <View style={styles.itemContainer}> 
              <Text style={styles.itemText}>Laundry Item Name: {item.laundryItemName} Description: {item.description} Price: {item.price}</Text> 
              {/* <Text style={styles.itemPrice}>${item.price}</Text>  */}
            </View> 
          )} 
        /> 
    );
}

const styles = StyleSheet.create({
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
  });