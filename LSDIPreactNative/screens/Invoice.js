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

export default function OrderPage(props) {

  const { orderId } = props.route.params;
  const [order, setOrder] = useState(null);
  const [orderItemsList, setOrderItemsList] = useState([]);
  const [staffDetails, setStaffDetails] = useState({});
  const [outletDetails, setOutletDetails] = useState({});
  const users = firebase.firestore().collection('users');
  const outlets = firebase.firestore().collection('outlet');

  //for order, staff, and outlet
  useEffect(() => {
    // Fetch the order document using the orderId prop
    const orderRef = firebase.firestore().collection('orders').doc(orderId);
    orderRef
      .get()
      .then(doc => {
        if (doc.exists) {
          console.log("Document data:", doc.data().staffID);
          setOrder({ id: doc.id, staffID: doc.staffID, ...doc.data() });
        } else {
          console.log("No such document!");
        }
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
            console.log(doc.data())
          })

      })
  }, []);

  //for orderItem
  useEffect(() => {
    if (order) {
      const orderItem = firebase.firestore().collection('orderItem');
      const unsubscribe = orderItem.onSnapshot((querySnapshot) => {
        const orderItemsList = [];
        querySnapshot.forEach((doc) => {
          const { description, laundryItemName, price, typeOfServices, quantity, weight } = doc.data();
          //const orderId = doc.ref.parent.parent.id; // Get the parent document ID (i.e., the order ID)
          orderItemsList.push({
            id: doc.id,
            description,
            laundryItemName,
            price,
            typeOfServices,
            quantity,
            orderId,
            weight
          });
        });
        setOrderItemsList(orderItemsList.filter(item => order.orderItemIds.includes(item.id))); // Filter the order items based on the orderItemIds array
      });
      return () => unsubscribe();
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
  const html = () => OrderPage(props);
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
          <Text style={styles.tableHeaderText}>Item Name</Text>
          <Text style={styles.tableHeaderText}>Service</Text>
          <Text style={styles.tableHeaderText}>Qty</Text>
          <Text style={styles.tableHeaderText}>Price</Text>
        </View>
        <FlatList
          style={styles.cardBody}
          data={data}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderSeparator}
          renderItem={({ item }) => (
            <View>
              < View style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.laundryItemName}</Text>
                <Text style={styles.itemService}>{item.typeOfServices}</Text>
                <Text style={styles.itemQuantity}> {item.quantity}</Text>
                <Text style={styles.itemPrice}>S$ {item.price}</Text>
              </View>
            </View>
          )
          }
        />
        <div style={styles.bottomContainer}>
          <div style={styles.totalPrice}>
            <Text style={styles.totalPrice}><b>Total Price: </b>{order?.totalPrice}</Text>
          </div>
          <div style={styles.description}>
            <Text style={styles.itemDescription}><b>Description:</b> <br></br>{order?.description.replace(/\./g, "\n")}</Text>
          </div>

        </div>

      </View >

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "50%",alignContent:'center',marginLeft:"25%",marginBottom:20  }}>
          <Btn onClick={() => print()} title="Print" style={{ width: "48%"}} />
          <Btn onClick={() => props.navigation.goBack()} title="Back" style={{ width: "48%", backgroundColor: colors.dismissBlue }} />
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
  itemName: {
    fontSize: 15,
    width: "15%",
    textAlign: "left",
    marginLeft: 20
  },
  itemService: {
    fontSize: 15,
    width: "16%",
    textAlign: "right",
    marginLeft: "8%"
  },
  itemQuantity: {
    fontSize: 15,
    width: "15%",
    textAlign: "right",
    marginLeft: 20
  },
  itemDescription: {
    fontSize: 20,
    marginBottom: 4,
    alignItems: "left",
    alignContent: 'left',
    marginLeft: 20,
    marginTop: 5,
    flex: "left",
    float: "left"
  },
  itemPrice: {
    fontSize: 15,
    width: "15%",
    textAlign: "right",
    marginLeft: 20
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
    marginRight: 40,
    backgroundColor: colors.white,
    fontSize: 20
  },
  bottomContainer: {
    backgroundColor: colors.white,
  }
});