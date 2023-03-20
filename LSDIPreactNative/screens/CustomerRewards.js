import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';

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

  const renderCustomer = ({ item }) => {
    return (
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
        <Text style={styles.customerExpenditure}>Expenditure: ${item.expenditure.toFixed(2)}</Text>
        <Text style={styles.customerPoints}>Points: {item.points}</Text>
      </TouchableOpacity>
    );
  };

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
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        onChangeText={setSearchText}
        value={searchText}
        placeholder="Search customer by name..."
      />
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      {selectedCustomer && (
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedCustomer.name}</Text>
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
            />
            <TouchableOpacity style={styles.modalButton} onPress={updateCustomer}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
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
  },
  customer: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customerExpenditure: {
    fontSize: 16,
    marginBottom: 5,
  },
  customerPoints: {
    fontSize: 16,
  },
  searchBox: {
    width: '80%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
