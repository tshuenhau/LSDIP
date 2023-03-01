import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Button,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  TextInput
} from 'react-native';
import { firebase } from '../config/firebase';
import OrderDetails from "../components/OrderDetails";
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
    const unsubscribe = orders.onSnapshot((querySnapshot) => {
      const orderList = [];
      querySnapshot.forEach((doc) => {
        const {
          customerName,
          customerPhone,
          date,
          orderItems,
          outletId,
          orderStatus,
          totalPrice,
        } = doc.data();
        orderList.push({
          isSelected: false,
          id: doc.id,
          customerName,
          customerPhone,
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
    return date;
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

  const renderItem = ({ item: order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => toggleExpand(order.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{formatOrderNumber(order.id)}</Text>
        <Text style={styles.orderDate}>{formatOrderDate(order.date)}</Text>
        <Text style={styles.orderNumber}>{order.orderStatus}</Text>

        <View style={styles.cardButtons}>

          <TouchableOpacity
            style={{ paddingTop: 12, marginRight: 15 }}
            onPress={() => handleCheck(order)}>
            <Checkbox
              disabled={false}
              value={order.isSelected}
              onValueChange={() => handleCheck(order)}
            />
          </TouchableOpacity>

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
        {/*
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("Order Page", { orderId: order.id })
          }
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("Invoice", { orderId: order.id })}
        >
          <Text style={styles.editButtonText}>Print</Text>
  </TouchableOpacity>*/}
      </View>
      {expandedOrder === order.id && (
        <View style={styles.cardBody}>
          <Text style={styles.orderNumber}>Name: {order.customerName}</Text>
          <Text style={styles.orderNumber}>Number: {order.customerPhone}</Text>
          <Text style={styles.orderNumber}>OutletId: {order.outletId}</Text>
          <Text style={styles.orderNumber}>
            Total Price: {order.totalPrice}
          </Text>
          <QR orderID={order.id}></QR>
          <OrderDetails data={order.id}></OrderDetails>
        </View>
      )}
    </TouchableOpacity>
  );

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
            console.log(o.id, "updated");
          });
      });
      setUpdateModalVisible(false);
    }
  };
  const filteredOrderList = orderList.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.createOrderContainer}>
        {/*<TouchableOpacity style={styles.button}>
          <Button
            title="Create Order"
            onPress={() => navigation.navigate("Create Order")}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Button
            title="Update Order"
            onPress={() => setUpdateModalVisible(true)}
          />
  </TouchableOpacity>*/}

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
      </View>

      <FlatList
        style={styles.list}
        data={filteredOrderList}
        keyExtractor={(item) => item.id}
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
  );
}

const styles = StyleSheet.create({
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
  },
  indicateButton: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  indicateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "grey",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  view: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonView: {
    width: "92%",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    flexDirection: 'row',
  },
  button: {
    margin: 10,
    backgroundColor: "#0B3270",
  },
  btn: {
    borderRadius: 15,
    backgroundColor: "#0B3270",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  createOrderContainer: {
    flexDirection: "row",
    alignSelf: "center",
  },
  noDataText: {
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    padding: 10
  },
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.darkBlue,
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  refreshButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataText: {
    alignSelf: "center",
    marginTop: 32,
    fontSize: 18,
    fontWeight: "bold",
  },
  outletIcon: {
    fontSize: 20,
    margin: 10,
  },
  cardHeaderIcon: {
    flexDirection: 'row',
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.gray,
    paddingHorizontal: 10,
    fontSize: 18,
    backgroundColor: colors.white,
    marginVertical: 10,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: 'space-between',
  },
  searchContainer: {
    justifyContent: "center",
    alignContent: "center",
    width: "96%",
    marginLeft: 15
  }
});
