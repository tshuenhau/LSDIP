import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  TextInput
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import { FontAwesome } from '@expo/vector-icons';
import Checkbox from "expo-checkbox";
import { SelectList } from "react-native-dropdown-select-list";
import Btn from "../components/Button";
import alert from "../components/Alert";
import QR from "../components/QR";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrdersList({ navigation }) {

  const [orderList, setOrderList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [udpateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const orders = firebase.firestore().collection("orders");

  useEffect(() => {
    const query = orders.orderBy('orderDate', 'desc');
    const unsubscribe = query.onSnapshot((querySnapshot) => {
      const orderList = [];
      querySnapshot.forEach((doc) => {
        const {
          customerName,
          customerNumber,
          orderDate,
          orderItems,
          outletId,
          orderStatus,
          totalPrice,
          deliveryDate,
        } = doc.data();
        orderList.push({
          isSelected: false,
          id: doc.id,
          customerName,
          customerNumber,
          orderDate,
          orderItems,
          outletId,
          orderStatus,
          totalPrice,
          deliveryDate
        });
      });
      setOrderList(orderList);
    });
    return () => unsubscribe();
  }, []);

  const statuses = [
    { key: 1, value: "Pending Wash" },
    { key: 2, value: "Out for Wash" },
    { key: 3, value: "Back from Wash" },
    { key: 4, value: "Pending Delivery" },
    { key: 5, value: "Out for Delivery" },
    { key: 6, value: "Closed" },
    // for orders with problems
    { key: 7, value: "Case" },
    { key: 8, value: "Void" },
  ];

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedOrder === id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(id);
    }
  };

  const formatOrderNumber = (id) => {
    return "#" + id.slice(0, 4).toUpperCase();
  };

  const formatOrderDate = (date) => {
    //return date.toDate().toLocaleString();
    var convertedDate = date.toDate();
    return convertedDate.getFullYear() + "-" + (1 + convertedDate.getMonth()) + "-" + convertedDate.getDate();
  };

  const handleCheck = (order) => {
    const updatedArray = orderList.map((item) => {
      if (item.id === order.id) {
        return {
          ...item,
          isSelected: !order.isSelected,
        };
      }
      return item;
    });

    setOrderList(updatedArray);
  };

  const updateStatus = () => {
    const selectedOrders = orderList.filter((s) => s.isSelected);
    if (selectedOrders.length === 0 || selectedStatus === "") {
      alert("Confirmation", "Please select an order and a status", [
        {
          text: "Ok",
          onPress: () => {
            console.log("Closed");
          },
        },
      ]);
    } else {
      selectedOrders.forEach((o) => {
        orders
          .doc(o.id)
          .update({
            orderStatus: selectedStatus,
          })
          .then(() => {
            Toast.show({
              type: 'success',
              text1: 'Status Updated',
            });
          });
      });
      setUpdateModalVisible(false);
    }
  };

  const filteredOrderList = orderList.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item: order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => toggleExpand(order.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={{ paddingVertical: "auto", marginLeft: 15 }}
          onPress={() => handleCheck(order)}>
          <Checkbox
            disabled={false}
            value={order.isSelected}
            onValueChange={() => handleCheck(order)}
          />
        </TouchableOpacity>
        <Text style={styles.orderDate}>{formatOrderDate(order.orderDate)}</Text>
        <Text style={styles.orderId}>{formatOrderNumber(order.id)}</Text>
        <Text style={styles.orderCustomerName}>{order.customerName}</Text>
        <Text style={styles.orderNum}>${order.totalPrice}</Text>
        {order.orderStatus === "Pending Wash" && (<Text style={styles.pendingwash}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Out for Wash" && (<Text style={styles.outforwash}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Back from Wash" && (<Text style={styles.backfromwash}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Pending Delivery" && (<Text style={styles.pendingdelivery}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Out for Delivery" && (<Text style={styles.outfordelivery}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Closed" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Case" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Void" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        {order.orderStatus === "" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        <View style={styles.cardButtons}>

          {/*<TouchableOpacity
                    style={{ paddingTop: 12, marginRight: 15 }}
                    onPress={() => handleCheck(order)}>
                    <Checkbox
                        disabled={false}
                        value={order.isSelected}
                        onValueChange={() => handleCheck(order)}
                    />
                 </TouchableOpacity>*/}
          <FontAwesome
            style={styles.outletIcon}
            name="edit"
            color='green'
            onPress={() => navigation.navigate('Order Page', { orderId: order.id })}
          />
          <FontAwesome
            style={styles.outletIcon}
            name="print"
            color='black'
            onPress={() => navigation.navigate('Invoice', { orderId: order.id })}
          />
        </View>
      </View>
      {expandedOrder === order.id && (
        <View style={styles.cardBody}>
          <Text style={styles.orderDetails}>Customer Number: {order.customerNumber}</Text>
          <Text style={styles.orderDetails}>Name: {order.customerName}</Text>
          <Text style={styles.orderDetails}>OutletId: {order.outletId}</Text>
          <Text style={styles.orderDetails}>Delivery Fee: when to add</Text>
          <Text style={styles.orderDetails}>Delivery Date: {order.deliveryDate}</Text>
          <QR orderID={order.id}></QR>
          {/*<OrderDetails data={order.id}></OrderDetails>*/}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.createOrderContainer}>
        <View style={styles.buttonView}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Create Order")}
            style={styles.btn}>
            <Text style={styles.text}>Create Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setUpdateModalVisible(true)}
            style={styles.btn}>
            <Text style={styles.text}>Update Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by Order ID"
        />
        <FontAwesome name="search" size={20} color="black" />
      </View>
      <View style={styles.orders}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Select</Text>
          <Text style={styles.tableHeaderText}>Date</Text>
          <Text style={styles.tableHeaderText}>Order Id</Text>
          <Text style={styles.tableHeaderText}>Customer</Text>
          <Text style={styles.tableHeaderText}>Price</Text>
          <Text style={styles.tableHeaderText}>Status</Text>
          <Text style={styles.tableHeaderText}>Action</Text>
        </View>
        <FlatList
          style={styles.list}
          data={filteredOrderList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.noDataText}>No Data Found!</Text>
          }
        />

        {/* update modal */}
        <Modal
          visible={udpateModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.view}>
                <Text
                  style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}
                >
                  Update Status
                </Text>
                <SelectList
                  data={statuses}
                  setSelected={(val) => setSelectedStatus(val)}
                  save="value"
                  search={false}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "92%",
                  }}
                >
                  <Btn
                    onClick={() => updateStatus()}
                    title="Update"
                    style={{ width: "48%" }}
                  />
                  <Btn
                    onClick={() => setUpdateModalVisible(false)}
                    title="Dismiss"
                    style={{ width: "48%", backgroundColor: "#344869" }}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: '2%',
    width: '95%'
  },
  searchContainer: {
    width: "96%",
    marginVertical: 15,
    marginLeft: "auto",
    marginRight: "auto",
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
    alignItems: "center",
    flexDirection: "row"
  },
  searchInput: {
    height: 40,
    fontSize: 18,
    width: '95%',
    marginLeft: 10,
    paddingHorizontal: 10
  },
  searchbaricon: {
    height: 40
  },
  orders: {
    marginHorizontal: "auto",
    width: '95%'
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 20,
  },
  card: {
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    padding: 8,
  },
  orderDate: {
    fontSize: 15,
    width: "8%",
    textAlign: "left",
    marginLeft: "11%",
  },
  orderCustomerName: {
    fontSize: 15,
    width: "14%",
    textAlign: "center",
    marginLeft: "5%"
  },
  orderId: {
    fontSize: 15,
    width: "8%",
    textAlign: "center",
    marginLeft: "8%",
  },
  orderNum: {
    fontSize: 15,
    width: "8%",
    textAlign: "center",
    marginLeft: "5%",
  },
  pendingwash: {
    fontSize: 15,
    backgroundColor: colors.teal400,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginLeft: "7%",
    marginRight: "auto"
  },
  outforwash: {
    fontSize: 15,
    backgroundColor: colors.violet400,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginLeft: "7%",
    marginRight: "auto"
  },
  backfromwash: {
    fontSize: 15,
    backgroundColor: colors.blue400,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginLeft: "7%",
    marginRight: "auto"
  },
  pendingdelivery: {
    fontSize: 15,
    backgroundColor: colors.blue600,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginLeft: "7%",
    marginRight: "auto"
  },
  outfordelivery: {
    fontSize: 15,
    backgroundColor: colors.blue800,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginLeft: "7%",
    marginRight: "auto",
  },
  otherstatuses: {
    fontSize: 15,
    backgroundColor: colors.gray,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginLeft: "7%",
    marginRight: "auto"
  },
  cardBody: {
    backgroundColor: colors.blue50,
    padding: 16,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: 'space-between',
    //marginLeft: "5%",
    //marginHorizontal: "auto",
    //width: "4%",
    //backgroundColor: colors.blue50
  },
  outletIcon: {
    fontSize: 20,
    margin: 5,
  },
  orderDetails: {
    fontSize: 15,
    textAlign: "left",
  },
  createOrderContainer: {
    alignSelf: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    padding: 10,
    color: "#fff",
  },
  buttonView: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    flexDirection: 'row',
  },
  btn: {
    borderRadius: 15,
    backgroundColor: colors.blue600,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 50
  },
  view: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: colors.shadowGray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  list: {
    flex: 1,
  },
  listtext: {
    paddingLeft: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "black"
  },
});
