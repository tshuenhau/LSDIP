import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  UIManager,
  Platform,
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import Btn from "../components/Button";
import { FontAwesome } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { ScrollView } from 'react-native-gesture-handler';
import QR from "../components/QR";

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Invoice(props) {
  const [order, setOrder] = useState(null);
  const { orderId } = props.route.params;

  console.log(props);
  console.log(orderId);
  const [orderItemsList, setOrderItemsList] = useState([]);
  const [staffDetails, setStaffDetails] = useState({});
  const [outletDetails, setOutletDetails] = useState({});
  const users = firebase.firestore().collection('users');
  const outlets = firebase.firestore().collection('outlet');
  const orderList = firebase.firestore().collection('orders')
  const orderItem = firebase.firestore().collection('orderItem');


  //for order, staff, and outlet
  //unable to work well in refreshing
  /*useEffect(() => {
    console.log("hello? are you working?")
    // Fetch the order document using the orderId prop   
    const orderID = orderId;
    console.log(orderID)
    const orderRef = firebase.firestore().collection('orders').doc(orderID);
    orderRef
      .get()
      .then(doc => {
        if (doc.exists) {
          console.log("Document data exist");
          setOrder({ id: doc.id, ...doc.data() });
        } else {
          console.log("No such document!");
        }
        setOrder({ id: doc.id, ...doc.data() });
        console.log("hello?: "+ doc.data())
        const staffId = doc.data().staffID;
        const outletId = doc.data().outletId;

        //get specific staff
        users
          .doc(staffId)
          .get()
          .then(doc => {
            setStaffDetails({ id: doc.id, ...doc.data() })
          })

        //get specific outlet
        outlets
          .doc(outletId)
          .get()
          .then(doc => {
            setOutletDetails({ id: doc.id, ...doc.data() })
          })

      })
  }, []);*/

  //for order
  useEffect(() => {
    // Fetch the order document using the orderId prop
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    const unsubscribe = orderRef.onSnapshot((doc) => {
      if (doc.exists) {
        setOrder({ id: doc.id, ...doc.data() });
        console.log('order', order);
      } else {
        console.log('No such order document!');
      }
    });
    return () => unsubscribe();
  }, [orderId]);

  //for orderItem
  useEffect(() => {
    if (order) {
      const orderItem = firebase.firestore().collection('orderItem');
      const unsubscribe = orderItem.onSnapshot((querySnapshot) => {
        const orderItemsList = [];
        querySnapshot.forEach((doc) => {
          const { description, laundryItemName, price, typeOfServices, quantity, weight, pricingMethod } = doc.data();
          //const orderId = doc.ref.parent.parent.id; // Get the parent document ID (i.e., the order ID)
          orderItemsList.push({
            id: doc.id,
            description,
            laundryItemName,
            price,
            typeOfServices,
            quantity,
            weight,
            pricingMethod,
            orderId,
          });
        });
        setOrderItemsList(orderItemsList); // Filter the order items based on the orderItemIds array
      });
      return () => unsubscribe();
    }
  }, [order]);

  //for outlet
  useEffect(() => {
    if(order){
    outlets
      .get()
      .then(querySnapshot => {
        const temp = [];
        querySnapshot.forEach(doc => {
          const { outletAddress, outletEmail, outletName, outletNumber } = doc.data();
          temp.push({
            outletID: doc.id,
            outletAddress: outletAddress,
            outletName: outletName,
            outletEmail: outletEmail,
            outletNumber: outletNumber
          });
        });
        console.log("order", order.outletId);
        setOutletDetails(temp.find(o => o.outletID === order.outletId))
      })
    }
  }, [order]);

  //for staff
  useEffect(() => {
    if(order){
    users
      .get()
      .then(querySnapshot => {
        const temp = [];
        querySnapshot.forEach(doc => {
          const { name, number, email, role } = doc.data();
          temp.push({
            userID: doc.id,
            name: name,
            number: number,
            email: email,
            role: role
          });
        });
        setStaffDetails(temp.find(o => o.userID === order.staffID))
      })
    }
  }, [order]);

  const data = orderItemsList.filter((item) => order.orderItemIds.includes(item.id));

  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: colors.gray,
          alignItems: "center"
        }}
      />
    )
  }

  //printing function
  const [selectedPrinter, setSelectedPrinter] = React.useState();
  const html = () => Invoice(props);
  const print = async () => {
    console.log("order:" + order.customerName);
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html,
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  const printToFile = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({ html });
    console.log('File has been saved to:', uri);
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <div style={styles.header}>
          <div style={styles.outletDetailsContainer}>
            <Text style={styles.outletHeaderText}>{outletDetails.outletName}</Text> <br></br>
            <Text style={styles.outletDetailsText}>{outletDetails.outletAddress}</Text><br></br>
            <Text style={styles.outletDetailsText}><b>TEL: </b>(+65){outletDetails.outletNumber}</Text><br></br>
            <Text style={styles.outletDetailsText}><b>Served by: </b>{staffDetails.name}</Text><br></br>
            {/*<QR orderID={order?.id}></QR>*/}
          </div>
          <div style={styles.qrCodeContainer}>
            <QR orderID={order?.id}></QR>
          </div>

        </div>
        <View style={styles.cardHeader}>
          {/*<Text style={styles.orderNumber}>Order #{orderId}</Text>
           <Text style={styles.orderNumber}>Name: {order.customerName}</Text> */}
          <View style={{ marginLeft: 7, flexDirection: 'row', alignContent: 'space-between' }}>
            <Text style={styles.customerName}><b>Customer: </b>{order?.customerName}</Text>
            <Text style={styles.customerNumber}><b>TEL: </b>{order?.customerNumber}</Text>
          </View>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>No.</Text>
          <Text style={styles.tableHeaderText}>Item Name</Text>
          <Text style={styles.tableHeaderText}>Service</Text>
          <Text style={styles.tableHeaderText}>Qty</Text>
          <Text style={styles.tableHeaderText}>Price</Text>
        </View>
        <FlatList
          style={styles.cardBody}
          data={data}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={renderSeparator}
          renderItem={({ item, index }) => (
            <View>
              < View style={styles.itemContainer}>
                <Text style={styles.itemIndex}>{index + 1}</Text>
                <Text style={styles.itemName}>{item.laundryItemName}</Text>
                <Text style={styles.itemService}>{item.typeOfServices}</Text>
                {item.pricingMethod === 'Weight'
                  ? <Text style={styles.itemQuantity}> {item.weight} kg</Text>
                  : <Text style={styles.itemQuantity}> {item.quantity}</Text>}
                <Text style={styles.itemPrice}>S$ {item.price}</Text>
              </View>
            </View>
          )
          }
        />
        <div style={styles.bottomContainer}>
          <div style={styles.totalPrice}>
            <Text style={styles.totalPrice}><b>Total Price: </b>S$ {order?.totalPrice}</Text>
          </div>
          <div style={styles.description}>
            <Text style={styles.itemDescription}><b>Description:</b> <br></br>{order?.description.replace(/\./g, "\n")}</Text>
          </div>

        </div>

      </View >

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "50%", alignContent: 'center', marginLeft: "25%", marginBottom: 20 }}>
        <Btn onClick={() => print()} title="Print" style={{ width: "48%" }} />
        <Btn onClick={() => props.navigation.navigate('Home')} title="Back" style={{ width: "48%", backgroundColor: colors.dismissBlue }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    fontSize: 16,
    color: 'blue',
    paddingTop: 30,
    fontWeight: "bold"
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
  cardBody: {
    backgroundColor: colors.white,
    padding: 16,
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 8,
    flex: 1,
    backgroundColor: colors.white
  },
  itemIndex: {
    fontSize: 15,
    width: "15%",
    textAlign: "left",
    marginLeft: 20
  },
  itemName: {
    fontSize: 15,
    width: "15%",
    textAlign: "left",
    marginLeft: "7%"
  },
  itemService: {
    fontSize: 15,
    width: "16%",
    textAlign: "left",
    marginLeft: "12%"
  },
  itemQuantity: {
    fontSize: 15,
    width: "13%",
    textAlign: "left",
    marginLeft: "9%",
  },
  itemDescription: {
    fontSize: 20,
    marginBottom: 4,
    alignItems: "left",
    alignContent: 'left',
    marginLeft: 20,
    marginTop: 5,
    flex: "left",
    float: "left",
    marginTop: "1%",
    marginBottom: "3%",
  },
  itemPrice: {
    fontSize: 15,
    width: "19%",
    textAlign: "center",
  },
  noDataText: {
    alignSelf: 'center',
    marginTop: 32,
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  btn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.darkBlue,
    justifyContent: "center",
    alignItems: "center",
    margin: 25,
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff"
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    backgroundColor: colors.white
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 20,
    marginRight: 80,
    marginLeft: 20
  },
  outletHeaderText: {
    fontWeight: "bold",
    fontSize: 30,
  },
  outletDetailsText: {
    fontSize: 15,
  },
  outletDetailsContainer: {
    alignItems: "left",
    marginLeft: 20,
    marginTop: 5,
    flex: "left",
    float: "left"
  },
  qrCodeContainer: {
    alignItems: "right",
    alignContent: 'space-between',
    flex: 'right',
    float: "right",
    marginRight: 40
  },
  header: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  customerName: {
    fontSize: 20,
    marginRight: 50
  },
  customerNumber: {
    fontSize: 20,
    marginRight: 50
  },
  totalPrice: {
    alignItems: "right",
    alignContent: 'space-between',
    flex: 'right',
    float: "right",
    marginRight: 50,
    backgroundColor: colors.white,
    fontSize: 20,
    marginTop: "1%",
    marginBottom: "3%",
  },
  bottomContainer: {
    backgroundColor: colors.white,
  }
});