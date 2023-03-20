import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { firebase } from '../config/firebase';
import colors from '../colors';
import { useNavigation } from '@react-navigation/native';

const CrmSettingsScreen = () => {
  const [cashToPoint, setCashToPoint] = useState('');
  const [pointToCash, setPointToCash] = useState('');
  const [currentCashToPoint, setCurrentCashToPoint] = useState('');
  const [currentPointToCash, setCurrentPointToCash] = useState('');

  useEffect(() => {
    const crmRef = firebase.firestore().collection('crm');
    crmRef.doc('cash_point').get().then((doc) => {
      setCurrentCashToPoint(doc.data().value.toString());
    });
    crmRef.doc('point_cash').get().then((doc) => {
      setCurrentPointToCash(doc.data().value.toString());
    });
  }, []);

  const handleSubmit = () => {
    if (cashToPoint.trim() === '' || pointToCash.trim() === '') {
      return;
    }
    const crmRef = firebase.firestore().collection('crm');
    crmRef.doc('cash_point').update({ value: Number(cashToPoint) });
    crmRef.doc('point_cash').update({ value: Number(pointToCash) });
    Toast.show({
      type: 'success',
      text1: 'Settings Updated',
    });
    setCashToPoint('');
    setPointToCash('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cash to Point Conversion</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>1 Cash = </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Point Value"
            keyboardType="numeric"
            value={cashToPoint}
            onChangeText={setCashToPoint}
          />
          <Text style={styles.inputLabel}>Points</Text>
        </View>
        <Text style={styles.currentValue}>Current Value: {currentCashToPoint}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Point to Cash Conversion</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>1 Point = $</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Cash Value"
            keyboardType="numeric"
            value={pointToCash}
            onChangeText={setPointToCash}
          />
        </View>
        <Text style={styles.currentValue}>Current Value: {currentPointToCash}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Customers')}>
        <Text style={styles.buttonText}>View Customers</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '80%',
    height: 140,
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
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#008080',
    borderRadius: 5,
    padding: 10,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CrmSettingsScreen;
