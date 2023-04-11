import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation, } from "react-native";
import { firebase } from "../config/firebase";
import colors from '../colors';

export default function CustomerViewOrderHistory({ navigation }) {

  const auth1 = firebase.auth;

  const [user, setUser] = useState(null) // This user
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const users = firebase.firestore().collection('users');
  const orders = firebase.firestore().collection('orders');

  useEffect(() => {
    users.doc(auth1().currentUser.uid)
      .get()
      .then(user => {
        setUser(user.data())
        console.log(user)
      })
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Image
          source={require('../assets/washing-machine.png')}
          style={{
            width: 40,
            height: 40,
            marginRight: 15,
          }}
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (user) {
      orders
        .where("customerNumber", "==", user.number)
        .get()
        .then(querySnapshot => {
          const orderList = [];
          console.log(user);
          querySnapshot.forEach((doc) => {
            const { customerName, customerNumber, orderDate, orderItems, outletId, orderStatus, totalPrice } = doc.data();
            orderList.push({
              id: doc.id,
              customerName,
              customerNumber,
              orderDate,
              orderItems,
              outletId,
              orderStatus,
              totalPrice,
            });
          });
          setOrderList(orderList);
          console.log(orderList);
        }).then(console.log(orderList));
    }
  }, [user]);


  const formatOrderNumber = (id) => {
    return '#' + id.slice(0, 4).toUpperCase();
  };

  const formatOutletNumber = (id) => {
    return '#' + id.slice(0, 10).toUpperCase();
  };

  const formatOrderDate = (date) => {
    var convertedDate = date.toDate();
    return convertedDate.getFullYear() + "-" + (1 + convertedDate.getMonth()) + "-" + convertedDate.getDate();
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedOrder === id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(id);
    }
  };

  const renderItem = ({ item: order }) => (
    <View>
      <TouchableOpacity
        style={styles.card}
        onPress={() => toggleExpand(order.id)}
        activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <View>
          <Text style={styles.orderNumber}>{formatOrderNumber(order.id)}</Text>
          <Text style={styles.orderDate}>{formatOrderDate(order.orderDate)}</Text>
          </View>
          <Text style={styles.orderStatus}>{order.orderStatus}</Text>
        </View>
        {expandedOrder === order.id && (
          <View style={styles.cardBody}>
            <Text style={styles.orderBody}><b>OutletId: </b>{formatOutletNumber(order.outletId)}</Text>
            <Text style={styles.orderBody}><b>Total Price: </b>{order.totalPrice}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <ScrollView style={styles.container}>
        <FlatList
          style={styles.list}
          data={orderList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.noDataText}>No Data Found!</Text>
          }
        />
      </ScrollView>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themelight,
    marginTop:"5%"
  },
  ordersListContainer: {
    flex: 1,
    padding: 10,
  },
  chatButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
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
  },
  button: {
    marginTop: "20"
  },
  createOrderContainer: {
    alignSelf: "center",
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
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderBody: {
    fontSize: 20,
  },
  orderDate: {
    fontSize: 14,
    color: colors.gray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardBody: {
    backgroundColor: colors.lightGray,
    padding: 16,
  },
  listtext: {
    paddingLeft: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "black"
  },
  selectedTimesContent: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingVertical: 10,
  },
  selectedTimesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedTimeCard: {
    width: "97%",
    alignItems: 'left',
    backgroundColor: colors.white,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginLeft: 15
  },
  selectedTimeText: {
    flex: 1,
    fontSize: 16,
  },
  selectedTimesContainer: {
    marginTop: 20,
    marginBottom: 20,
    height: 300,
  },
  // selectedTimesList: {
  //   flex: 1,
  // },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 10
  },
  removeButtonText: {
    color: 'red',
    fontSize: 15
  },
  NavButton: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 5,
    margin: 2,
    alignSelf: 'center',
  },
  NavButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
  },
  cardText: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 15,
    marginLeft: 10
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 4,
    marginLeft: 10
  },
  noOrdersText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10
  },
  orderText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10
  },
  orderStatus:{
    fontSize: 20,
    fontWeight: 700,
    alignContent:'center',
    alignSelf:'center',
    alignItems:'center'
  }
});