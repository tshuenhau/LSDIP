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
  Modal,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'
import TextBox from "../components/TextBox";
import { firebase } from '../config/firebase';
import colors from '../colors';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderPage(props) {
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
  console.log(props);
  const { orderId } = props.route.params;
  console.log(orderId);
  const [orderItemsList, setOrderItemsList] = useState([]);
  const [laundryItemsData, setLaundryItemsData] = useState([]);
  useEffect(() => {
    const orderItem = firebase.firestore().collection('orderItem');
    const unsubscribe = orderItem.onSnapshot((querySnapshot) => {
      const orderItemsList = [];
      querySnapshot.forEach((doc) => {
        const { description, laundryItemName, orderId, price } = doc.data();
        orderItemsList.push({
          id: doc.id,
          description,
          laundryItemName,
          orderId,
          price,
        });
      });
      setOrderItemsList(orderItemsList);
    });
    return () => unsubscribe();
  }, []);
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

  const data = orderItemsList.filter((element) => element.orderId == orderId);

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
    // Create a new order item document in the 'orderItem' collection
    // Get the values of description and price from the state modalData
    const { description, price } = modalData;
    firebase.firestore().collection('orderItem').add({
      laundryItemName: selectedItem.split(' ')[0],
      typeOfServices: selectedItem.split(' ')[1],
      description: description,
      price: price,
      orderId: orderId,
    }).then((docRef) => {
      console.log('Order item created with ID: ', docRef.id);
      // Add the new order item ID to the 'items' array in the order document
      const orderRef = firebase.firestore().collection('orders').doc(orderId);
      orderRef.update({
        items: firebase.firestore.FieldValue.arrayUnion(docRef.id),
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

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>Order #{orderId}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteOrder()}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.cardBody}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.laundryItemName}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                const orderRef = firebase.firestore().collection('orders').doc(item.orderId);
                orderRef.update({
                  items: firebase.firestore.FieldValue.arrayRemove(item.id),
                });
                const orderItemRef = firebase.firestore().collection('orderItem').doc(item.id);
                orderItemRef.delete();
              }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={addOrderItem}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modal}>
          <Text style={styles.addButtonText}>MODAL</Text>
          <View
            style={{
              width: '92%',
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => addOrderItem1()}>
            <Text style={styles.closeButtonText}>Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
  backButton: {
    fontSize: 16,
    color: 'blue',
    marginLeft: 8,
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
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 16,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 10,
  }

});