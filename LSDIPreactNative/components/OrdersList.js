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
  TextInput,
  ScrollView
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import { FontAwesome } from '@expo/vector-icons';
import Checkbox from "expo-checkbox";
import { SelectList } from "react-native-dropdown-select-list";
import Btn from "../components/Button";
import alert from "../components/Alert";
import Toast from 'react-native-toast-message';
import { AntDesign } from '@expo/vector-icons';

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
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [refundList, setRefundList] = useState([]);
  const [orderRefunds, setOrderRefunds] = useState([]);
  const [lastDocument, setLastDocument] = useState(null);
  const orders = firebase.firestore().collection("orders");
  const refunds = firebase.firestore().collection("refunds");
  const PAGE_SIZE = 30;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    let query = orders.orderBy('orderDate', 'desc').limit(PAGE_SIZE);;

    if (searchQuery) {
      console.log(searchQuery);
      query = query.where("invoiceNumber", "==", String(searchQuery));
    }

    query.onSnapshot((querySnapshot) => {
      const orderList = querySnapshot.docs.map(doc => ({ id: doc.id, isSelected: false, ...doc.data() }));
      setOrderList(orderList);
      setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
    });
  }

  useEffect(() => {
    refunds.onSnapshot(querySnapshot => {
      const refundList = [];
      querySnapshot.forEach(doc => {
        const { customerName, orderId, orderItemId, refundAmount, refundDetails, refundMethod, orderItemName, typeOfServices, price } = doc.data();
        refundList.push({
          id: doc.id,
          customerName,
          orderId,
          orderItemId,
          refundAmount,
          refundDetails,
          refundMethod,
          orderItemName,
          typeOfServices,
          price
        })
      });
      setRefundList(refundList);
    });
  }, []);

  const statuses = [
    { key: 1, value: "Pending Wash" },
    { key: 2, value: "Out for Wash" },
    { key: 3, value: "Back from Wash" },
    { key: 4, value: "Pending Delivery" },
    { key: 5, value: "Out for Delivery" },
    { key: 6, value: "Refunded" },
    { key: 7, value: "Closed" },
    // for orders with problems
    { key: 8, value: "Case" },
    { key: 9, value: "Void" },
  ];

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedOrder === id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(id);
    }
  };

  const formatOrderDate = (date) => {
    //return date.toDate().toLocaleString();
    if (date !== null) {
      var convertedDate = new Date(date.seconds * 1000);
      return convertedDate.getFullYear() + "-" + (1 + convertedDate.getMonth()) + "-" + convertedDate.getDate();
    } else {
      return null;
    }
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

  const convertToPoints = async (totalPrice) => {
    try {
      const crmRef = firebase.firestore().collection('crm');
      const cashPointDoc = await crmRef.doc('cash_point').get();
      const cashToPoint = cashPointDoc.data().value;
      const points = Math.floor(totalPrice / cashToPoint); // Round down to nearest integer
      return points;
    } catch (error) {
      console.log(error);
      return 0;
    }
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
      if (selectedStatus === "Closed") {
        const users = firebase.firestore().collection("users");
        selectedOrders.forEach((o) => {
          const customerNumber = o.customerNumber;
          const query = users.where("number", "==", customerNumber);
          query.get().then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.forEach(async (doc) => {
                const user = doc.data();
                const expenditure = user.expenditure || 0;
                const totalPrice = o.totalPrice;
                const newExpenditure = expenditure + totalPrice;
                const points = user.points || 0;
                const newPoints = points + await convertToPoints(o.totalPrice);
                users.doc(doc.id).update({ expenditure: newExpenditure, points: newPoints });
              });
            }
          });
        });
      }

      if (selectedStatus === "Out for Wash") {
        selectedOrders.forEach((o) => {
          orders
            .doc(o.id)
            .update({
              orderStatus: selectedStatus,
              sendFromWasherDate: firebase.firestore.Timestamp.fromDate(new Date()),
            })
            .then(() => {
              Toast.show({
                type: 'success',
                text1: 'Status Updated',
              });
              console.log(firebase.firestore.Timestamp.fromDate(new Date()))
            });
        });
      } else if (selectedStatus === "Back from Wash") {
        selectedOrders.forEach((o) => {
          orders
            .doc(o.id)
            .update({
              orderStatus: selectedStatus,
              receiveFromWasherDate: firebase.firestore.Timestamp.fromDate(new Date()),
            })
            .then(() => {
              Toast.show({
                type: 'success',
                text1: 'Status Updated',
              });
            });
        });
      } else if (selectedStatus === "Closed") {
        selectedOrders.forEach((o) => {
          orders
            .doc(o.id)
            .update({
              orderStatus: selectedStatus,
              endDate: firebase.firestore.Timestamp.fromDate(new Date()),
            })
            .then(() => {
              Toast.show({
                type: 'success',
                text1: 'Status Updated',
              });
            });
        });
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
      }
      setUpdateModalVisible(false);

    }
  };

  const showRefundDetails = (orderid) => {
    console.log(orderid);
    const refundlist = refundList.filter(element => element.orderId === orderid);
    setOrderRefunds(refundlist);
    // console.log('refund list', refundlist);
  }

  const handleSearch = () => {
    setLastDocument(null);
    fetchData();
  }

  const handleLoadMore = () => {
    let query = orders.orderBy('orderDate', 'desc').startAfter(lastDocument).limit(PAGE_SIZE)
    if (searchQuery) {
      query = query.where("invoiceNumber", "==", searchQuery);
    }

    query.onSnapshot((querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, isSelected: false, ...doc.data() }));
      setOrderList([...orderList, ...documents]);
      setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
    });
  }

  const sendMessage = (order) => {
    let url = `https://web.whatsapp.com/send?phone=${order.customerNumber}`;

    // Appending the message to the URL by encoding it
    const message = `[Laundry] Hi ${order.customerName} Laundry Order: ${order.invoiceNumber} is ready for collection.`;
    url += `&text=${encodeURI(message)}&app_absent=0`;

    // Open our newly created URL in a new tab to send the message
    window.open(url);

  }

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
        <Text style={styles.orderId}>{order.invoiceNumber}</Text>
        <Text style={styles.orderCustomerName}>{order.customerName}</Text>
        <Text style={styles.orderNum}>${order.totalPrice}</Text>
        {order.orderStatus === "Pending Wash" && (<Text style={styles.pendingwash}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Out for Wash" && (<Text style={styles.outforwash}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Back from Wash" && (<Text style={styles.backfromwash}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Pending Delivery" && (<Text style={styles.pendingdelivery}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Out for Delivery" && (<Text style={styles.outfordelivery}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Refunded" && (<Text style={styles.refunded}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Closed" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Case" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        {order.orderStatus === "Void" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        {order.orderStatus === "" && (<Text style={styles.otherstatuses}>{order.orderStatus}</Text>)}
        <View style={styles.cardButtons}>
          <FontAwesome
            style={styles.outletIcon}
            name="whatsapp"
            color="#25D366"
            onPress={() => sendMessage(order)}
          />
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
          <Text style={styles.orderDetails}><b>OutletId: </b>{order.outletId}</Text>
          <Text style={styles.orderDetails}><b>Customer Number: </b>{order.customerNumber}</Text>
          {order.customerAddress !== "" && (<Text style={styles.orderDetails}><b>Customer Address: </b>{order.customerAddress}</Text>)}
          {order.pickupDate !== "" && (<Text style={styles.orderDetails}><b>Pick Up Date: </b>{formatOrderDate(order.pickupDate)}</Text>)}
          {order.sendFromWasherDate !== null && (<Text style={styles.orderDetails}><b>Send to Washer Date: </b>{formatOrderDate(order.sendFromWasherDate)}</Text>)}
          {order.receiveFromWasherDate !== null && (<Text style={styles.orderDetails}><b>Receive from Washer Date: </b>{formatOrderDate(order.receiveFromWasherDate)}</Text>)}
          {order.deliveryDate !== "" && (<Text style={styles.orderDetails}><b>Delivery Date: </b>{order.deliveryDate}</Text>)}
          {order.endDate !== null && (<Text style={styles.orderDetails}><b>End Date: </b>{formatOrderDate(order.endDate)}</Text>)}
          {/*<Text style={styles.orderDetails}><b>Delivery Fee: </b>when to add</Text>*/}
          {order.orderStatus === "Refunded" && (
            <TouchableOpacity
              onPress={() => {
                showRefundDetails(order.id);
                setRefundModalVisible(true)
              }}>
              <Text style={styles.refunddetailsbtn}>Refund Details</Text>
            </TouchableOpacity>)}
        </View>
      )}
    </TouchableOpacity>
  );


  return (
    <View style={{ marginBottom: 20 }}>
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
              <Text style={styles.text}>Update Order Status</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchnfilter}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholder="Search by Invoice Number"
            />
            <FontAwesome name="search" size={20} color="black" />
          </View>
        </View>
        <View style={styles.orders}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Select</Text>
            <Text style={styles.tableHeaderText}>Date</Text>
            <Text style={styles.tableHeaderText}>Invoice No</Text>
            <Text style={styles.tableHeaderText}>Customer</Text>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>Status</Text>
            <Text style={styles.tableHeaderText}>Action</Text>
          </View>
          <FlatList
            style={styles.list}
            data={orderList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            // onEndReachedThreshold={0}
            // onEndReached={handleLoadMore}
            ListEmptyComponent={
              <Text style={styles.noDataText}>No Data Found!</Text>
            }
          />
        </View>

      </View>

      {/* update modal */}
      <Modal
        visible={udpateModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.view}>
                <Text
                  style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}
                >
                  Update Status
                </Text>
                <View style={{
                  // height: 42,
                  width: "92%",
                  borderRadius: 25,
                  marginTop: 20
                }}>
                  <SelectList
                    data={statuses}
                    setSelected={(val) => setSelectedStatus(val)}
                    save="value"
                    search={false}
                  />
                </View>
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
        </View>
      </Modal>

      <Modal
        visible={refundModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                onPress={() => setRefundModalVisible(false)}
              >
                <AntDesign style={styles.closebutton} name="closecircleo" size={24} color="black" />
              </TouchableOpacity>
              <View style={styles.dview}>
                <Text
                  style={{ fontSize: 34, fontWeight: "800", marginBottom: 20, color: colors.blue700 }}
                >
                  Refund Details
                </Text>
                <FlatList
                  style={styles.list}
                  data={orderRefunds}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View>
                      <Text style={styles.refunddetails}><b>Refund Item:</b> {item.orderItemName}</Text>
                      <Text style={styles.refunddetails}><b>Type of Services:</b> {item.typeOfServices}</Text>
                      <Text style={styles.refunddetails}><b>Orignial Price:</b> {item.price}</Text>
                      <Text style={styles.refunddetails}><b>Refund Amount: </b>${item.refundAmount}</Text>
                      <Text style={styles.refunddetails}><b>Refund Method: </b>{item.refundMethod}</Text>
                      <Text style={styles.refunddetails}><b>Refund Details:</b> {item.refundDetails}</Text>
                    </View>
                  )}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "92%",
                  }}
                >
                  {/*<Btn
          
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.closeModal}>
                <TouchableOpacity
                  onPress={() => setRefundModalVisible(false)}
                >
                  <AntDesign name="closecircleo" size={30} color="black" />
                </TouchableOpacity>
                </View>
                <View style={styles.dview}>
                  <Text
                    style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}
                  >
                    Refund Details
                  </Text>
                  <Text style={styles.refunddetails}><b>Refund Item:</b> {orderItemName}</Text>
                  <Text style={styles.refunddetails}><b>Type of Services:</b> {typeOfServices}</Text>
                  <Text style={styles.refunddetails}><b>Orignial Price:</b> {price}</Text>
                  <Text style={styles.refunddetails}><b>Refund Amount: </b>{refundAmount}</Text>
                  <Text style={styles.refunddetails}><b>Refund Method: </b>{refundMethod}</Text>
                  <Text style={styles.refunddetails}><b>Refund Details:</b> {refundDetails}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "92%",
                    }}
                  >
                    {/*<Btn
                    onClick={() => setRefundModalVisible(false)}
                    title="Dismiss"
                    style={{ width: "48%", backgroundColor: "#344869" }}
                />*/}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => handleLoadMore()}
        style={styles.btn}>
        <Text style={styles.text}>Load More</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: '2%',
    width: '95%',
    marginBottom: 20,
  },
  searchnfilter: {
    flexDirection: 'row',
  },
  searchContainer: {
    width: "96%",
    marginVertical: 15,
    marginLeft: "auto",
    marginRight: "auto",
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#f5f5f5',
    backgroundColor: colors.themelight,
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
    width: '95%',
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
  refunded: {
    fontSize: 15,
    backgroundColor: colors.warning500,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginLeft: "7%",
    marginRight: "auto"
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
  refunddetailsbtn: {
    fontSize: 15,
    backgroundColor: colors.warning500,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    width: "15%",
    textAlign: "center",
    marginTop: 10,
  },
  refunddetails: {
    fontSize: 15,
    textAlign: "left"
  },
  cardBody: {
    backgroundColor: colors.violet50,
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
  closeModal: {
    marginLeft: "90%",
    //backgroundColor: colors.blue100,
    justifyContent: "right",
    alignItems: "right",
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
  dview: {
    width: "100%",
    justifyContent: "left",
    alignItems: "left"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    width: '50%',
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
  closebutton: {
    marginLeft: 500,
    marginTop: -25
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
    // flex: 1,
  },
  listtext: {
    paddingLeft: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "black"
  },
});
