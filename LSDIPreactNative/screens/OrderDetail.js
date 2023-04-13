import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  UIManager,
  Platform,
  Modal,
  ScrollView,
  TextInput
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'
import TextBox from "../components/TextBox";
import { firebase } from '../config/firebase';
import colors from '../colors';
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Checkbox from "expo-checkbox";

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderPage(props) {

  const [order, setOrder] = useState(null);
  const { orderId } = props.route.params;
  const [orderDescription, setOrderDescription] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [pickup, setPickUp] = useState(Boolean);
  const [requireDelivery, setRequireDelivery] = useState(Boolean);
  const [totalPrice, setTotalPrice] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [pricingMethods, setPricingMethods] = useState([]);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [orderItemsList, setOrderItemsList] = useState([]);
  const [laundryItemsData, setLaundryItemsData] = useState([]);
  const [modalData, setModalData] = useState({ description: '', price: '' });
  const refunds = firebase.firestore().collection('refunds');
  const [orderRefunds, setOrderRefunds] = useState([]);

  useEffect(() => {
    // Fetch the order document using the orderId prop
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    const unsubscribe = orderRef.onSnapshot((doc) => {
      if (doc.exists) {
        setOrder({ id: doc.id, ...doc.data() });
        setOrderDescription(doc.data().description);
        setPickUp(doc.data().pickup);
        setRequireDelivery(doc.data().requireDelivery);
        setTotalPrice(doc.data().totalPrice);
        setOrderStatus(doc.data().orderStatus);
        //console.log('order', order);
      } else {
        console.log('No such order document!');
      }
    });
    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    if (order) {
      const orderItem = firebase.firestore().collection('orderItem');

      orderItem
        .where(firebase.firestore.FieldPath.documentId(), 'in', order.orderItemIds)
        .get()
        .then(querySnapshot => {
          const orderItemsList = [];
          querySnapshot.forEach(doc => {
            const { laundryItemName, price, typeOfServices, quantity, pricingMethod, weight } = doc.data();
            orderItemsList.push({
              id: doc.id,
              laundryItemName,
              price,
              orderId,
              typeOfServices,
              quantity,
              pricingMethod,
              weight
            });
          })
          setOrderItemsList(orderItemsList);
        })
    }
  }, [order]);

  useEffect(() => {
    console.log('here');
    refunds
      .get()
      .then(querySnapshot => {
        const orderRefunds = [];
        const oid = orderId;
        querySnapshot.forEach(doc => {
          const { orderId, orderItemName, refundAmount, refundMethod } = doc.data();
          if (orderId === oid)
            orderRefunds.push({
              id: doc.id,
              orderId,
              orderItemName,
              refundAmount,
              refundMethod
            });
        })
        setOrderRefunds(orderRefunds);
        console.log('refunds', orderRefunds);
      })
  }, [order]);

  useEffect(() => {
    const laundryItems = firebase.firestore().collection('laundryItem');
    const unsubscribe = laundryItems.onSnapshot(querySnapshot => {
      const laundryItemsData = [];
      const pricingMs = [];
      querySnapshot.forEach(doc => {
        const { laundryItemName, price, pricingMethod, typeOfServices } = doc.data();
        laundryItemsData.push({
          laundryItemName: laundryItemName,
          typeOfServices: typeOfServices,
          pricingMethod: pricingMethod,
          price: price,
        });
        pricingMs.push({
          pricingMethod: pricingMethod,
        });
      });
      setLaundryItemsData(laundryItemsData);
      //const pm =[...new Set(pricingMs)];
      const pricingMethods = [];
      pricingMs.forEach((element) => {
        if (!pricingMethods.includes(element.pricingMethod)) {
          pricingMethods.push(element.pricingMethod);
        }
      });
      setPricingMethods(pricingMethods);
      console.log('pricing methods', pricingMethods);
    });
    return () => unsubscribe();
  }, []);

  function handleChange(text, eventName) {
    console.log("handle chage");
    setModalData(prev => {
      return {
        ...prev,
        [eventName]: text
      }
    })
  }

  const addOrderItem = () => {
    const selectedItem = modalData.typeOfServices;
    // Create a new order item document in the 'orderItem' collection
    // Get the values of description and price from the state modalData
    const { quantity, price, pricingMethod } = modalData;
    if (pricingMethod && price) {
      if (pricingMethod === "Weight") {
        const weight = modalData.weight;
        firebase.firestore().collection('orderItem').add({
          laundryItemName: selectedItem.split("--")[1],
          //typeOfServices: selectedItem.split(' ')[1],
          typeOfServices: selectedItem.split("--")[0],
          price: price,
          //quantity: quantity,
          orderId: orderId,
          pricingMethod: pricingMethod,
          weight: weight
        }).then((docRef) => {
          console.log('Order item created with ID: ', docRef.id);
          // Add the new order item ID to the 'items' array in the order document
          const orderRef = firebase.firestore().collection('orders').doc(orderId);
          orderRef.update({
            orderItemIds: firebase.firestore.FieldValue.arrayUnion(docRef.id),
            totalPrice: order.totalPrice + parseInt(price)
          }).then(() => {
            console.log('Order item added to order successfully');
          }).catch((error) => {
            console.error('Error adding order item to order: ', error);
          });
        }).catch((error) => {
          console.error('Error creating order item: ', error);
        });
      } else {
        firebase.firestore().collection('orderItem').add({
          laundryItemName: selectedItem.split("--")[1],
          //typeOfServices: selectedItem.split(' ')[1],
          typeOfServices: selectedItem.split("--")[0],
          price: price,
          quantity: quantity,
          orderId: orderId,
          pricingMethod: pricingMethod,
          //weight: weight
        }).then((docRef) => {
          console.log('Order item created with ID: ', docRef.id);
          // Add the new order item ID to the 'items' array in the order document
          const orderRef = firebase.firestore().collection('orders').doc(orderId);
          orderRef.update({
            orderItemIds: firebase.firestore.FieldValue.arrayUnion(docRef.id),
            totalPrice: order.totalPrice + price * quantity
          }).then(() => {
            console.log('Order item added to order successfully');
          }).catch((error) => {
            console.error('Error adding order item to order: ', error);
          });
        }).catch((error) => {
          console.error('Error creating order item: ', error);
        });
      }
      setErrorMessage("");
      setAddItemModalVisible(false);
    } else {
      setErrorMessage("Please fill up all fields");
    }
  }

  const refund = () => {
    const details = modalData.refundDetails;
    const refundAmount = modalData.refundAmount;
    const refundMethod = modalData.refundMethod;
    console.log("refund 1");
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    //console.log(orderRef);
    let cn = "";
    if (refundAmount && refundMethod && details) {
      orderRef.get().then(doc => {
        if (!doc.exists) {
          console.log('No such User document!');
          throw new Error('No such User document!'); //should not occur normally as the notification is a "child" of the user
        } else {
          //console.log('Document data:', doc.data());
          cn = doc.data().customerName;
          console.log('Document data:', doc.data().customerName);
          console.log('customer', cn);
          orderRef.update({
            orderStatus: "Refunded"
          });
          refunds.add({
            customerName: cn,
            orderId: orderId,
            orderItemId: selectedOrderItem.id,
            orderItemName: selectedOrderItem.laundryItemName,
            typeOfServices: selectedOrderItem.typeOfServices,
            price: selectedOrderItem.price,
            refundAmount: refundAmount,
            refundMethod: refundMethod,
            refundDetails: details,
          }).then(() => {
            Toast.show({
              type: 'success',
              text1: 'Refund added',
            })
          }).catch(err => {
            console.log(err);
          })
          setErrorMessage("");
        }
      }).catch(err => {
        console.log('Error getting document', err);
        return false;
      });
      console.log("cn now", cn);
      setRefundModalVisible(false);
    } else {
      setErrorMessage("Please fill up all fields")
    }
  }

  const deleteOrder = () => {
    const orderRef = firebase.firestore().collection('orders').doc(item.orderId);
    orderRef.update({
      items: firebase.firestore.FieldValue.arrayRemove(item.id),
    });
    const orderItemRef = firebase.firestore().collection('orderItem').doc(item.id);
    orderItemRef.delete();

    // const orderRef = firebase.firestore().collection('orders').doc(orderId);
    // orderRef
    //   .delete()
    //   .then(() => {
    //     console.log('Order successfully deleted!');
    //     props.navigation.goBack();
    //   })
    //   .catch((error) => {
    //     console.error('Error deleting order: ', error);
    //   });
  };

  const updateDescription = () => {
    console.log("here");
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    const odescription = modalData.orderDescription;
    //console.log(orderRef);

    orderRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such User document!');
        throw new Error('No such User document!'); //should not occur normally as the notification is a "child" of the user
      } else {
        //console.log('Document data:', doc.data());
        console.log("description now", orderDescription);
        orderRef.update({
          description: orderDescription,
        });
      }
    })
      .catch(err => {
        console.log('Error getting document', err);
        return false;
      });

    setUpdateModalVisible(false);
  }

  const handlePickUpChange = () => {
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    orderRef.get().then(doc => {
      if (!doc.exists) {
        console.log("No such User document!");
        throw new Error("No such User document!")
      } else {
        if (pickup) { //true change to false
          orderRef.update({
            pickup: !pickup,
            totalPrice: order.totalPrice - 10
          })
        } else { //false change to true
          orderRef.update({
            pickup: !pickup,
            totalPrice: order.totalPrice + 10
          })
        }
      }
    })
    setPickUp(!pickup);
  }

  const handleDeliveryChange = () => {
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    orderRef.get().then(doc => {
      if (!doc.exists) {
        console.log("No such User document!");
        throw new Error("No such User document!")
      } else {
        if (requireDelivery) { //true change to false
          orderRef.update({
            requireDelivery: !requireDelivery,
            totalPrice: order.totalPrice - 10
          })
        } else { //false change to true
          orderRef.update({
            requireDelivery: !requireDelivery,
            totalPrice: order.totalPrice + 10
          })
        }
      }
    })
    setPickUp(!requireDelivery);
  }

  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#CED0CE',
          alignItems: "center"
        }}
      />
    )
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.typeOfServices}</Text>
      <Text style={styles.itemName}>{item.laundryItemName}</Text>
      <Text style={styles.itemName}>S$ {item.price}</Text>
      {item.pricingMethod === "Weight" && <Text style={styles.itemName}>{item.weight} kg</Text>}
      {item.pricingMethod !== "Weight" && <Text style={styles.itemName}>{item.quantity}</Text>}
      <View style={styles.cardButtons}>
        <FontAwesome
          style={styles.outletIcon}
          name="trash-o"
          color='red'
          onPress={() => deleteOrder()}
        />
        <TouchableOpacity
          onPress={() => {
            setSelectedOrderItem(item);
            setRefundModalVisible(true);
          }}
        >
          {/*<MaterialCommunityIcons name="cash-refund" size={28} color="black" /> */}
          <Text style={styles.refund}>Refund</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItemr = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.orderItemName}</Text>
      <Text style={styles.itemName}>$ {item.refundAmount}</Text>
      <Text style={styles.itemName}>{item.refundMethod}</Text>
    </View>
  )

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.buttonView}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={styles.btn}>
            <Text style={styles.text}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAddItemModalVisible(true)}
            style={styles.btn}>
            <Text style={styles.text}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkoutCard}>
          <Text style={styles.sectionText}>Order Details</Text>
          <Text style={styles.orderNumber}>Order #{orderId}</Text>
          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>Laundry Pick Up</Text>
            <Checkbox
              style={{ marginLeft: 20, marginBottom: 2 }}
              disabled={false}
              value={pickup}
              onValueChange={() => handlePickUpChange()}
            />
          </View >
          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>Laundry Delivery</Text>
            <Checkbox
              style={{ marginLeft: 20, marginBottom: 2 }}
              disabled={false}
              value={requireDelivery}
              onValueChange={() => handleDeliveryChange()}
            />
          </View >
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Service</Text>
            <Text style={styles.tableHeaderText}>Item Name</Text>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>Qty</Text>
            <Text style={styles.tableHeaderText}>Action</Text>
          </View>
          <FlatList
            style={styles.cardBody}
            data={orderItemsList}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={renderSeparator}
            renderItem={renderItem}
          />
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 20, paddingLeft: 15 }}><b>Total Price: </b>$ {totalPrice}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.orderNumber}>Order Description</Text>
            <FontAwesome
              style={styles.outletIcon}
              name="edit"
              color='green'
              onPress={() => setUpdateModalVisible(true)}
            />
          </View>
          <Text style={styles.orderDescription}>{orderDescription}</Text>
          <View>
            {orderStatus === 'Refunded' && (<Text style={styles.orderStatus}>Refunded</Text>)}
            {orderStatus === 'Refunded' && (<View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Item Name</Text>
              <Text style={styles.tableHeaderText}>Refund Amount</Text>
              <Text style={styles.tableHeaderText}>Refund Method</Text>
            </View>)}
            <FlatList
              style={styles.cardBody}
              data={orderRefunds}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={renderSeparator}
              renderItem={renderItemr}
            />
          </View>

          <Modal
            visible={updateModalVisible}
            animationType="fade"
            transparent={true}
          >
            <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.view}>
                    <Text
                      style={{ fontSize: 34, fontWeight: "800", marginBottom: 20, color: colors.blue700 }}
                    >
                      Update Order Description
                    </Text>
                    <TextInput
                      editable
                      multiline
                      //numberOfLines={4}
                      //onChangeText={text => handleChange(text, 'orderDescription')}
                      onChangeText={text => setOrderDescription(text)}
                      value={orderDescription}
                      style={{ padding: 10, width: "80%", height: 80 }}
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
                        onClick={() => updateDescription()}
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
        </View>

        <Modal
          visible={addItemModalVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.view}>

                  <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Add Item</Text>
                  <View
                    style={{
                      width: '92%',
                      borderRadius: 20,
                      marginTop: 20,
                      backgroundColor: 'white',
                    }}>
                    <SelectList
                      data={laundryItemsData.map(
                        (item) => item.typeOfServices + "--" + item.laundryItemName
                        //(item) => item.typeOfServices
                      )}
                      placeholder="Select Item"
                      setSelected={(val) => handleChange(val, 'typeOfServices')}
                      save="value"
                    />
                  </View>
                  <View
                    style={{
                      width: '92%',
                      borderRadius: 20,
                      marginTop: 20,
                      backgroundColor: 'white',
                    }}>
                    <SelectList
                      data={pricingMethods}
                      placeholder="Pricing Method"
                      setSelected={(val) => handleChange(val, 'pricingMethod')}
                      save="value"
                    />
                  </View>
                  {modalData.pricingMethod != undefined && modalData.pricingMethod === "Weight" &&
                    <TextBox placeholder="Total Price" onChangeText={text => handleChange(text, "price")} />
                  }
                  {modalData.pricingMethod != undefined && modalData.pricingMethod === "Weight" &&
                    <TextBox placeholder="Weight" onChangeText={text => handleChange(text, "weight")} />
                  }
                  {modalData.pricingMethod != undefined && modalData.pricingMethod !== "Weight" &&
                    <TextBox placeholder="Price per piece" onChangeText={text => handleChange(text, "price")} />
                  }
                  {modalData.pricingMethod != undefined && modalData.pricingMethod !== "Weight" &&
                    <TextBox placeholder="Quantity" onChangeText={text => handleChange(text, "quantity")} />
                  }
                  {errorMessage &&
                    <View style={styles.errorMessageContainer}>
                      <Text style={styles.errorMessage}>{errorMessage}</Text>
                    </View>
                  }
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Btn
                      onClick={() => addOrderItem()}
                      title="Update"
                      style={{ width: "48%" }}
                    />
                    <Btn
                      onClick={() => setAddItemModalVisible(false)}
                      title="Close"
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
          transparent={true}
          animationType="fade"
        >
          <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.view}>

                  <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Refund Item</Text>
                  <TextBox
                    style={styles.textBox}
                    placeholder="Refund Amount"
                    onChangeText={(text) => handleChange(text, 'refundAmount')}
                  />
                  <TextBox
                    style={styles.textBox}
                    placeholder="Refund Method"
                    onChangeText={(text) => handleChange(text, 'refundMethod')}
                  />
                  <TextBox
                    style={styles.textBox}
                    placeholder="Refund Details"
                    onChangeText={(text) => handleChange(text, 'refundDetails')}
                  />
                  {errorMessage &&
                    <View style={styles.errorMessageContainer}>
                      <Text style={styles.errorMessage}>{errorMessage}</Text>
                    </View>
                  }
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Btn
                      onClick={() => refund()}
                      title="Refund"
                      style={{ width: "48%" }}
                    />
                    <Btn
                      onClick={() => setRefundModalVisible(false)}
                      title="Close"
                      style={{ width: "48%", backgroundColor: "#344869" }}
                    />
                  </View>
                </View>
              </View>
            </View >
          </View>
        </Modal>
      </View>
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  errorMessageContainer: {
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  errorMessage: {
    color: colors.red,
    fontStyle: 'italic',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 25
  },
  btn: {
    borderRadius: 20,
    backgroundColor: colors.blue700,
    justifyContent: "center",
    alignItems: "center",
    width: "13%",
    marginHorizontal: "5%",
  },
  checkoutCard: {
    marginHorizontal: "auto",
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: '2%',
  },
  sectionText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: "bold",
    color: colors.blue700,
    padding: 10,
    float: "left"
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 15,
    marginBottom: 10,
    marginTop: 20
  },
  orderStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 15,
    marginBottom: 10,
    marginTop: 20,
    color: colors.warning500
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: 20
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  itemName: {
    fontSize: 15,
    //width: "14%",
    textAlign: "left",
    //backgroundColor: colors.blue300,
    paddingLeft: 10
  },
  cardBody: {
    flex: 1,
  },
  orderDescription: {
    fontSize: 15,
    paddingLeft: 15
  },
  buttonView: {
    justifyContent: 'space-between',
    //alignItems: "center",
    //padding: 10,
    flexDirection: 'row',
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: 'space-between',
  },
  refund: {
    fontSize: 12,
    backgroundColor: colors.warning500,
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    marginTop: 10
    //marginLeft: "7%",
    //marginRight: "auto"
  },

  list: {
    flex: 1,
  },
  backButton: {
    fontSize: 16,
    color: 'blue',
    paddingTop: 30,
    fontWeight: "bold"
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
    alignItems: 'center',
    padding: 16,
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

  orderDate: {
    fontSize: 14,
    color: colors.gray,
  },


  itemDetails: {
    flex: 1,
    marginRight: 8,
  },

  itemDescription: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkBlue,
  },
  noDataText: {
    alignSelf: 'center',
    marginTop: 32,
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: colors.red,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#344869',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addButtonText: {
    color: '#344869',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modal: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: colors.red,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textBox: {
    width: "100%",
    fontSize: 16,
    padding: 10,
    borderColor: "#0B3270",
    borderWidth: 1,
    borderRadius: 5,
    height: 800,
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    padding: 10
  },
  outletIcon: {
    fontSize: 25,
    margin: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: "2%",
    marginBottom: 10,
    alignItems: 'flex-end'
  },
  checkboxLabel: {
    fontWeight: 'bold',
    fontSize: 18,
  },

});

/*return (
  <View style={styles.container}>
    <View style={styles.cardHeader}>
      <Text style={styles.orderNumber}>Order #{orderId}</Text>
      <View style={{ padding: 10, flexDirection: 'row' }}>
        <View style={styles.cardHeaderIcon}>
          <FontAwesome
            style={styles.outletIcon}
            name="trash-o"
            color='red'
            onPress={() => deleteOrder()}
          />
        </View>

        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
    <FlatList
      style={styles.cardBody}
      data={data}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={renderSeparator}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.laundryItemName}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
          <Text style={styles.itemPrice}>S$ {item.price}</Text>
          <View style={styles.cardHeaderIcon}>
            <FontAwesome
              style={styles.outletIcon}
              name="trash-o"
              color='red'
              onPress={() => {
                const orderRef = firebase.firestore().collection('orders').doc(item.orderId);
                orderRef.update({
                  items: firebase.firestore.FieldValue.arrayRemove(item.id),
                });
                const orderItemRef = firebase.firestore().collection('orderItem').doc(item.id);
                orderItemRef.delete();
              }}
            />
          </View>
        </View>
      )}
    />
    <View style={styles.view}>
      <TouchableOpacity
        onPress={addOrderItem}
        style={styles.btn}>
        <Text style={styles.text}>Add Item</Text>
      </TouchableOpacity>
    </View>
    <Modal
      visible={addItemModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.view}>

            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Add Item</Text>
            <View
              style={{
                width: '100%',
                borderRadius: 20,
                marginTop: 20,
                backgroundColor: 'white',
              }}>
              <SelectList
                data={laundryItemsData.map(
                  (item) => item.laundryItemName + ' ' + item.typeOfServices
                )}
                setSelected={(val) => handleChange(val, 'typeOfServices')}
                save="value"
              />
            </View>
            <TextBox
              style={styles.textBox}
              placeholder="Description"
              onChangeText={(text) => handleChange(text, 'description')}
            />
            <TextBox
              style={styles.textBox}
              placeholder="Price"
              onChangeText={(text) => handleChange(text, 'price')}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <Btn
                onClick={() => addOrderItem1()}
                title="Update"
                style={{ width: "48%" }}
              />
              <Btn
                onClick={() => toggleModal()}
                title="Close"
                style={{ width: "48%", backgroundColor: "#344869" }}
              />
            </View>
          </View>
        </View>
      </View >
    </Modal>

  </View>

);
*/
