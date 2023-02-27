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
import OrderDetails from "../components/OrderDetails";
import colors from '../colors';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrdersList({ navigation }) {

  const [orderList, setOrderList] = useState([]);
  const orders = firebase.firestore().collection('orders');

  useEffect(() => {

    const unsubscribe = orders.onSnapshot((querySnapshot) => {
      const orderList = [];
      querySnapshot.forEach((doc) => {
        const {
          customerName,
          customerNumber,
          date,
          orderItems,
          outletId,
          orderStatus,
          totalPrice } = doc.data();
        orderList.push({
          id: doc.id,
          customerName,
          customerNumber,
          date,
          orderItems,
          outletId,
          orderStatus,
          totalPrice,
        });
      });
      setOrderList(orderList);
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
          <Text style={styles.orderNumber}>Name: {order.customerName}</Text>
          <Text style={styles.orderNumber}>Number: {order.customerNumber}</Text>
          <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
          <Text style={styles.orderNumber}>Total Price: {order.totalPrice}</Text>
          <OrderDetails data={order.id}></OrderDetails>
        </View>
      )}
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      {orderList.length > 0 ? (
        <FlatList
          style={styles.list}
          data={orderList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noDataText}>No Data Found!</Text>
      )}
    </View>
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
  noDataText: {
    alignSelf: 'center',
    marginTop: 32,
    fontSize: 18,
    fontWeight: 'bold',
  },
});