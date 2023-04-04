import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, LayoutAnimation } from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import Btn from "../components/Button";
import TextBox from "../components/TextBox";
import { FontAwesome } from '@expo/vector-icons';

export default function CustomersScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expenditure, setExpenditure] = useState(null);
  const [points, setPoints] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  //for users
  useEffect(() => {
    const membershipTier = firebase.firestore().collection('membership_tier');
    membershipTier
      .get()
      .then(querySnapshot => {
        const membershipTiers = [];
        querySnapshot.forEach((doc) => {
          membershipTiers.push({ id: doc.id, ...doc.data() });
        })
        const sortedTiers = membershipTiers.sort((a, b) => a.expenditure - b.expenditure);
        const usersRef = firebase.firestore().collection('users');
        usersRef.where('role', '==', 'Customer').onSnapshot((snapshot) => {
          const data = [];
          snapshot.forEach((doc) => {
            let customerTier;
            for (let i = sortedTiers.length - 1; i >= 0; i--) {
              if (doc.data().expenditure >= sortedTiers[i].expenditure) {
                customerTier = sortedTiers[i].name;
                break;
              }
            }
            data.push({
              id: doc.id,
              name: doc.data().name,
              number: doc.data().number || "No number",
              expenditure: doc.data().expenditure || 0,
              points: doc.data().points || 0,
              membership_tier: customerTier || "No membership discount"
            });
          });
          setCustomers(data);
        });

      })
  }, []);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedItem === id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(id);
    }
  };

  const renderCustomer = ({ item }) => (

    /*<TouchableOpacity
      style={styles.customer}
      onPress={() => {
        setSelectedCustomer(item);
        setExpenditure(item.expenditure.toString());
        setPoints(item.points.toString());
        setModalVisible(true);
      }}
    >
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerExpenditure}><b>Expenditure: </b>${item.expenditure.toFixed(2)}</Text>
      <Text style={styles.customerPoints}><b>Points: </b>{item.points}</Text>
      <Text style={styles.customerPoints}><b>Membership Tier: </b>{item.membership_tier}</Text>
    </TouchableOpacity>*/
    <TouchableOpacity
      style={styles.customer}
      onPress={() => toggleExpand(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPoints}><b>Membership Tier: </b>{item.membership_tier}</Text>
        </View>
        <View style={styles.cardHeaderIcon}>
          <FontAwesome
            style={styles.outletIcon}
            name="edit"
            color={colors.green}
            onPress={() => {
              setSelectedCustomer(item);
              setExpenditure(item.expenditure.toString());
              setPoints(item.points.toString());
              setModalVisible(true);
            }}
          />
          <FontAwesome
            style={styles.outletIcon}
            name="history"
            color={colors.shadowGray}
            onPress={() => {
              setSelectedCustomer(item);
              navigation.navigate('Customer Order', { userNumber: item.number });
            }}
          />
        </View>
      </View>
      {expandedItem === item.id && (
        <View style={styles.itemContainer}>
          <View style={styles.cardBody}>
            <Text style={styles.customerExpenditure}><b>Expenditure: </b>${item.expenditure.toFixed(2)}</Text>
            <Text style={styles.customerPoints}><b>Points: </b>{item.points}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const updateCustomer = () => {
    const usersRef = firebase.firestore().collection('users');
    usersRef
      .doc(selectedCustomer.id)
      .update({
        expenditure: parseFloat(expenditure),
        points: parseFloat(points),
      })
      .then(() => {
        setSelectedCustomer(null);
        setExpenditure(null);
        setPoints(null);
        setModalVisible(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <ScrollView >
      <View style={styles.buttonView}>
        {/* <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.btn}>
          <Text style={styles.text}>Back</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.container}>
        <Text style={styles.searchText}>Member List</Text>
        <View style={styles.searchnfilter}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              onChangeText={setSearchText}
              value={searchText}
              placeholder="Search customer by name..."
            />
          </View>
        </View>
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id}
        /*contentContainerStyle={styles.list}*/
        />
        {
          selectedCustomer && (
            <Modal visible={modalVisible} animationType="fade" transparent={true}>
              <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>

                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <View style={styles.view}>
                      <Text style={styles.modalTitle}>Edit {selectedCustomer.name} Points</Text>
                      <TextBox
                        placeholder="Expenditure"
                        keyboardType="numeric"
                        onChangeText={setExpenditure}
                        value={expenditure}
                      />
                      <TextBox
                        placeholder="Points"
                        keyboardType="numeric"
                        onChangeText={setPoints}
                        value={points}
                      />
                      {/*
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Expenditure"
                      keyboardType="numeric"
                      value={expenditure}
                      onChangeText={setExpenditure}
                    />
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Points"
                      keyboardType="numeric"
                      value={points}
                      onChangeText={setPoints}
        />*/}
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                        <Btn onClick={() => updateCustomer()} title="Save" style={{ width: "48%" }} />
                        <Btn onClick={() => setModalVisible(false)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          )
        }
      </View>
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  list: {
    alignItems: 'center',
    paddingBottom: 20,
    width: "96%"
  },
  customer: {
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
    alignContent: "center",
    width: "96%"
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardHeaderIcon: {
    flexDirection: 'row',
    padding: 16,
  },
  itemContainer: {
    backgroundColor: colors.lightGray,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 20,
  },
  cardBody: {
    padding: 16,
  },
  outletIcon: {
    fontSize: 30,
    margin: 10,
  },
  customerName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 20
  },
  customerExpenditure: {
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 20
  },
  customerPoints: {
    fontSize: 16,
    marginLeft: 20,
    marginBottom: 10
  },
  searchnfilter: {
    flexDirection: 'row',
    marginLeft: 10,

  },
  searchContainer: {
    marginVertical: 15,
    marginLeft: 16,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#f5f5f5',
    backgroundColor: '#f5f5f5',
    justifyContent: "center",
    alignContent: "center",
    width: "96%",
    marginLeft: 10,
    height: 50
  },
  searchInput: {
    height: 40,
    fontSize: 18,
    paddingHorizontal: 10,
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
  view: {
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
  },
  inputSpace: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: '2%',
    width: '95%',
    marginBottom: 20,
  },
  buttonView: {
    justifyContent: 'space-between',
    marginTop: 30,
    flexDirection: 'row',
  },
  btn: {
    borderRadius: 20,
    backgroundColor: colors.darkBlue,
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
    marginHorizontal: "5%",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    padding: 10
  },
  searchText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: "bold",
    color: colors.blue700,
    padding: 10,
    float: "left"
  }
});


//export default CustomersScreen;
