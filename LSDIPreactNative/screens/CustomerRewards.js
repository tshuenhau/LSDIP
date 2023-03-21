import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import Btn from "../components/Button";
import TextBox from "../components/TextBox";


const CustomersScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expenditure, setExpenditure] = useState(null);
  const [points, setPoints] = useState(null);

  useEffect(() => {
    const usersRef = firebase.firestore().collection('users');
    usersRef.where('role', '==', 'Customer').onSnapshot((snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          name: doc.data().name,
          expenditure: doc.data().expenditure || 0,
          points: doc.data().points || 0,
        });
      });
      setCustomers(data);
    });
  }, []);

  const renderCustomer = ({ item }) => (

    <TouchableOpacity
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
  customerName: {
    fontSize: 25,
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
    backgroundColor: colors.white,
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
});


export default CustomersScreen;
