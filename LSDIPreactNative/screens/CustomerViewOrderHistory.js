import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation,
  Modal,
  TextBox,
}
  from "react-native";
import { firebase } from "../config/firebase";
import colors from '../colors';
import { MaterialIcons } from '@expo/vector-icons';
import Btn from "../components/Button";
import { TextInput } from "react-native-gesture-handler";
import Toast from 'react-native-toast-message';
import { Rating, AirbnbRating } from 'react-native-ratings';

export default function CustomerViewOrderHistory({ navigation }) {

  const auth1 = firebase.auth;

  const [user, setUser] = useState(null) // This user
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [outletId, setOutletId] = useState('');
  const [cfeedback, setCfeedback] = useState('');
  const [rating, setRating] = useState('');
  const [orderList, setOrderList] = useState([]);
  const users = firebase.firestore().collection('users');
  const orders = firebase.firestore().collection('orders');
  const ratings = firebase.firestore().collection('orderRating');
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateModal1Visible, setUpdateModal1Visible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');



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
            const { customerName, customerNumber, orderDate, orderItems, outletId, orderStatus, totalPrice, feedback, invoiceNumber } = doc.data();
            orderList.push({
              id: doc.id,
              customerName,
              customerNumber,
              orderDate,
              orderItems,
              outletId,
              orderStatus,
              totalPrice,
              feedback,
              invoiceNumber
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

  const ratingCompleted = (rating) => {
    console.log("Rating is: " + rating);
    setRating(rating);
  }

  function feedback(id) {
    console.log('feedback', id);
    //console.log(orderList.length);
    setOrderId(id);
    console.log('oder', orderId);
    let order = orderList.find(o => o.id === id);
    //console.log(order.feedback);
    setCfeedback(order.feedback);
  }

  const rate = (id) => {
    console.log('rate', id);
    setOutletId(id);
  }

  const updateFeedback = () => {
    console.log("here");
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    const feedback = cfeedback;
    //console.log(orderRef);

    orderRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such User document!');
        throw new Error('No such User document!'); //should not occur normally as the notification is a "child" of the user
      } else {
        //console.log('Document data:', doc.data());
        console.log("feedback now", feedback);
        orderRef.update({
          feedback: feedback
        }).then(() => {
          Toast.show({
            type: 'success',
            text1: 'Feedback updated, click the order again to see the change',
          })
        });
        orderList.find(o => o.id === orderId).feedback = feedback;
      }
    })
      .catch(err => {
        console.log('Error getting document', err);
        return false;
      });
    setUpdateModal1Visible(false);
  }

  const rateOutlet = () => {
    console.log("here");
    console.log(rating);
    //console.log(orderRef);

    orderRef.get().then(doc => {
      if (!doc.exists) {
        console.log('No such User document!');
        throw new Error('No such User document!'); //should not occur normally as the notification is a "child" of the user
      } else {
        //console.log('Document data:', doc.data());
        console.log("feedback now", feedback);
        orderRef.update({
          feedback: feedback
        }).then(() => {
          Toast.show({
            type: 'success',
            text1: 'Feedback updated, click the order again to see the change',
          })
        });
        orderList.find(o => o.id === orderId).feedback = feedback;
      }
    })
      .catch(err => {
        console.log('Error getting document', err);
        return false;
      });
    setUpdateModal1Visible(false);
  }

  function handleChange(text, eventName) {
    setUpdateModalData(prev => {
      return {
        ...prev,
        [eventName]: text
      }
    })
  }

  const renderItem = ({ item: order }) => (
    <View>
      <TouchableOpacity
        style={styles.card}
        //onPress={() => navigation.navigate('Invoice', { orderId: order.id })}
        onPress={() => toggleExpand(order.id)}
        activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>Invoice Number: {order.invoiceNumber}</Text>
            <Text style={styles.orderDate}>{formatOrderDate(order.orderDate)}</Text>
          </View>
          <Text style={styles.orderStatus}>{order.orderStatus}</Text>
        </View>

        {expandedOrder === order.id && (
          <View style={styles.cardBody}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.orderBody}><b>OutletId: </b>{formatOutletNumber(order.outletId)}</Text>
              <TouchableOpacity style={{ marginRight: 10, marginLeft: 'auto' }}>
                <Text style={styles.rate} onPress={() => {
                  rate(order.outletId);
                  setUpdateModalVisible(true)
                }}>
                  {/** <MaterialIcons name="star-rate" size={20} color="white" />*/}
                  <MaterialIcons name="star-rate" size={14} color="white" />
                  Rate
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.orderBody}><b>Total Price: </b>{order.totalPrice}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.orderBody}><b>Feedback: </b>{order.feedback}</Text>
              <TouchableOpacity style={{ marginRight: 10, marginLeft: 'auto' }}>
                <MaterialIcons name="rate-review" size={24} color={colors.green500}
                  onPress={() => {
                    feedback(order.id);
                    setUpdateModal1Visible(true)
                  }} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.navigatebutton} onPress={() => navigation.navigate('Invoice', { orderId: order.id })}><b>View Invoice</b></Text>
            </TouchableOpacity>
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={updateModalVisible}
      >
        <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.view}>
                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Rate the Outlet</Text>
                {/** <TextBox placeholder="John Doe" onChangeText={text => handleChange(text, "name")} defaultValue={''} />*/}
                <Rating
                  type='heart'
                  ratingCount={5}
                  imageSize={40}
                  showRating
                  onFinishRating={ratingCompleted}
                />
                {errorMessage &&
                  <View style={styles.errorMessageContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                }
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                  <Btn onClick={() => rateOutlet()} title="Rate" style={{ width: "48%" }} />
                  <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={updateModal1Visible}
      >
        <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.view}>
                <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Feedback</Text>
                {/** <TextBox placeholder="John Doe" onChangeText={text => handleChange(text, "name")} defaultValue={''} />*/}
                <TextInput
                  editable
                  multiline
                  placeholder="feedback"
                  style={{ height: 40, width: '100%' }}
                  onChangeText={text => setCfeedback(text)} value={cfeedback} />
                {errorMessage &&
                  <View style={styles.errorMessageContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  </View>
                }
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                  <Btn onClick={() => updateFeedback()} title="Update" style={{ width: "48%" }} />
                  <Btn onClick={() => setUpdateModal1Visible(!updateModal1Visible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themelight,
    marginTop: "5%"
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
    /*shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 3,
    },*/
    elevation: 3,
    borderColor: colors.borderColor,
    borderWidth: 2
  },
  orderNumber: {
    fontSize: 18,
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
  orderStatus: {
    fontSize: 16,
    fontWeight: 700,
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginRight: 2,
    marginLeft: 'auto',
    color: colors.blue600
  },
  rate: {
    fontSize: 14,
    backgroundColor: '#f59e0b',
    padding: 5,
    borderRadius: 15,
    color: "#fff",
    flexDirection: 'row',
    textAlign: 'center',
    marginHorizontal: 'auto'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    width: '90%',
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
  navigatebutton: {
    color: colors.blue700,
    fontSize: 16,
    fontWeight: 'bold'
  }
});