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
  ScrollView
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'
import TextBox from "../components/TextBox";
import { firebase } from '../config/firebase';
import colors from '../colors';
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderPage(props) {
  const [order, setOrder] = useState(null);
  console.log(props);
  const { orderId } = props.route.params;
  console.log(orderId);
  const [description, setDescription] = useState("");
  const refunds = firebase.firestore().collection('refunds');
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  //const [customerName, setCustomerName] = useState("");


  useEffect(() => {
    // Fetch the order document using the orderId prop
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    const unsubscribe = orderRef.onSnapshot((doc) => {
      if (doc.exists) {
        setOrder({ id: doc.id, ...doc.data() });
        setDescription(doc.data().description);
        console.log('order', order);
      } else {
        console.log('No such order document!');
      }
    });
    return () => unsubscribe();
  }, [orderId]);
  // useEffect(() => {
  //   if (order) {
  //     console.log(order);
  //   }
  // }, [order]);
  //import service. 
  const services = firebase.firestore().collection('laundryCategory');
  const [service, setService] = useState([]);
  const [modalData, setModalData] = useState({ description: '', price: '' });
  useEffect(() => {
    services.onSnapshot(querySnapshot => {
      const service = [];
      querySnapshot.forEach(doc => {
        const { serviceName } = doc.data();
        data.push({
          key: doc.id,
          value: serviceName,
        });
      });
      setService(service);
    });
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal1Visible, setIsModal1Visible] = useState(false);

  const [orderItemsList, setOrderItemsList] = useState([]);
  const [laundryItemsData, setLaundryItemsData] = useState([]);
  useEffect(() => {
    if (order) {
      const orderItem = firebase.firestore().collection('orderItem');
      console.log('order: ', order);
      const unsubscribe = orderItem.onSnapshot((querySnapshot) => {
        const orderItemsList = [];
        querySnapshot.forEach((doc) => {
          const { laundryItemName, price, typeOfServices } = doc.data();
          //const orderId = doc.ref.parent.parent.id; // Get the parent document ID (i.e., the order ID)
          orderItemsList.push({
            id: doc.id,
            laundryItemName,
            price,
            orderId,
            typeOfServices
          });
        });
        setOrderItemsList(orderItemsList.filter(item => order.orderItemIds.includes(item.id))); // Filter the order items based on the orderItemIds array
      });
      return () => unsubscribe();
    }
  }, [order]);
  //console.log('order 1', order);

  useEffect(() => {
    const laundryItems = firebase.firestore().collection('laundryItem');
    const unsubscribe = laundryItems.onSnapshot(querySnapshot => {
      const laundryItemsData = [];
      querySnapshot.forEach(doc => {
        const { laundryItemName, price, pricingMethod, typeOfServices } = doc.data();
        laundryItemsData.push({
          laundryItemName: laundryItemName,
          typeOfServices: typeOfServices,
          pricingMethod: pricingMethod,
          price: price,
        });
      });
      setLaundryItemsData(laundryItemsData);
    });
    return () => unsubscribe();
  }, []);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const data = orderItemsList.filter((item) => order.orderItemIds.includes(item.id));


  const deleteOrder = () => {
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    orderRef
      .delete()
      .then(() => {
        console.log('Order successfully deleted!');
        props.navigation.goBack();
      })
      .catch((error) => {
        console.error('Error deleting order: ', error);
      });
  };

  const addOrderItem = () => {
    console.log("here to add item");
    toggleModal();
  };

  function handleChange(text, eventName) {
    setModalData(prev => {
      return {
        ...prev,
        [eventName]: text
      }
    })
  }
  const addOrderItem1 = () => {
    const selectedItem = modalData.typeOfServices;
    const selectedItemName = modalData.laundryItemName;
    // Create a new order item document in the 'orderItem' collection
    // Get the values of description and price from the state modalData
    const { price } = modalData;
    firebase.firestore().collection('orderItem').add({
      laundryItemName: selectedItemName,
      //typeOfServices: selectedItem.split(' ')[1],
      typeOfServices: selectedItem.split(' ')[0],
      price: price,
      orderId: orderId,
    }).then((docRef) => {
      console.log('Order item created with ID: ', docRef.id);
      // Add the new order item ID to the 'items' array in the order document
      const orderRef = firebase.firestore().collection('orders').doc(orderId);
      orderRef.update({
        orderItemIds: firebase.firestore.FieldValue.arrayUnion(docRef.id),
      }).then(() => {
        console.log('Order item added to order successfully');
      }).catch((error) => {
        console.error('Error adding order item to order: ', error);
      });
    }).catch((error) => {
      console.error('Error creating order item: ', error);
    });
    toggleModal();
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

  const refund = () => {
    console.log("here to refund");
    toggleModal1();
  }

  const refund1 = () => {
    console.log("refund 1");
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    console.log(orderRef);
    let cn = "";
    
    orderRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such User document!');
        throw new Error('No such User document!'); //should not occur normally as the notification is a "child" of the user
      } else {
        //console.log('Document data:', doc.data());
        cn = doc.data().customerName;
        console.log('Document data:', doc.data().customerName);
        console.log('customer', cn);
        refunds.add({
          customerName: cn,
          orderId: orderId,
          orderItemId: selectedOrderItem.id,
          refundAmount: refundAmount,
          refundDetails: details,  
        });
        Toast.show({
          type: 'success',
          text1: 'Refund added',
        });
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
      return false;
    });
    
    //const orderItemRef = firebase.firestore().collection('orderItem').doc(item.id);
    const details = modalData.refundDetails;
    const refundAmount = modalData.refundAmount;
    console.log("cn now", cn);
    /*
    refunds.add({
      customerName: cn,
      orderId: orderId,
      orderItemId: selectedOrderItem.id,
      refundAmount: refundAmount,
      refundDetails: details,  
    }).then((docRef) => {
      console.log(orderRef, selectedOrderItem);
    })
    */
    toggleModal1();
  }

const toggleModal1 = () => {
  setIsModal1Visible(!isModal1Visible);
}

const renderItem = ({ item }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.itemName}>{item.typeOfServices}</Text>
    <Text style={styles.itemName}>{item.laundryItemName}</Text>
    <Text style={styles.itemName}>S$ {item.price}</Text>
    <View style={styles.cardButtons}>
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
      <TouchableOpacity
        onPress={() => {
          setSelectedOrderItem(item);
          refund();
        }}
      >
        <MaterialCommunityIcons name="cash-refund" size={28} color="black" />
      </TouchableOpacity>
    </View>
  </View>
);

return (
  <ScrollView>
    <View style={styles.container}>
      <View style={styles.buttonView}>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Home')}
          style={styles.btn}>
          <Text style={styles.text}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={addOrderItem}
          style={styles.btn}>
          <Text style={styles.text}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkoutCard}>
        <Text style={styles.sectionText}>Order Details</Text>
        <Text style={styles.orderNumber}>Order #{orderId}</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Service</Text>
          <Text style={styles.tableHeaderText}>Item Name</Text>
          <Text style={styles.tableHeaderText}>Price</Text>
          <Text style={styles.tableHeaderText}>Action</Text>
        </View>
        <FlatList
          style={styles.cardBody}
          data={data}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderSeparator}
          renderItem={renderItem}
        />
        <Text style={styles.orderNumber}>Order Description</Text>
        <Text style={styles.orderDescription}>{description}</Text>
      </View>

      <Modal
        visible={isModalVisible}
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
                    (item) => item.typeOfServices + ' ' + item.laundryItemName
                    //(item) => item.typeOfServices
                  )}
                  setSelected={(val) => handleChange(val, 'typeOfServices')}
                  save="value"
                />
                <SelectList
                  style={{
                    marginTop: 15
                  }}
                  data={laundryItemsData.map(
                    (item) => item.laundryItemName
                  )}
                  setSelected={(val) => handleChange(val, 'laundryItemName')}
                  save="value"
                />
              </View>
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
      <Modal
        visible={isModal1Visible}
        transparent={true}
        animationType="slide"
      >
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
                placeholder="Refund Details"
                onChangeText={(text) => handleChange(text, 'refundDetails')}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Btn
                  onClick={() => refund1()}
                  title="Refund"
                  style={{ width: "48%" }}
                />
                <Btn
                  onClick={() => toggleModal1()}
                  title="Close"
                  style={{ width: "48%", backgroundColor: "#344869" }}
                />
              </View>
            </View>
          </View>
        </View >
      </Modal>
    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25
  },
  btn: {
    borderRadius: 20,
    backgroundColor: colors.darkBlue,
    justifyContent: "center",
    alignItems: "center",
    width: "13%",
    marginRight: "50%",
    marginLeft: "5%"
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
    //justifyContent: "center",
    //alignItems: "center",
    //padding: 10,
    flexDirection: 'row',
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: 'space-between',
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
      visible={isModalVisible}
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
