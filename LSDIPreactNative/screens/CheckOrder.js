import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';

export default function SearchOrder({ navigation }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [orderCost, setOrderCost] = useState(null);
  const orders = firebase.firestore().collection('orders');

  const handleSearch = async () => {
    try {
      const querySnapshot = await orders.where('invoiceNumber', '==', orderNumber).get();

      if (querySnapshot.empty) {
        setOrderStatus('No matching order found');
      } else {
        const orderData = querySnapshot.docs[0].data();
        setOrderStatus(`Order status: ${orderData.orderStatus}`);
        setOrderCost(`Order cost: ${orderData.orderCost}`);
      }
    } catch (error) {
      console.error(error);
      setOrderStatus('An error occurred while searching for the order');
      setOrderCost('An error occurred while searching for the order');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImage}
        resizeMode="center"
        source={require('../assets/LSDIP.png')}
      />
      <Text style={styles.title}>Check Your Order Status</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Order Number"
          placeholderTextColor={colors.placeholder}
          onChangeText={text => setOrderNumber(text)}
          value={orderNumber}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {orderStatus ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Status</Text>
          <Text style={styles.cardText}>Order number: {orderNumber}</Text>
          <Text style={styles.cardText}>{orderStatus}</Text>
          <Text style={styles.cardText}>{orderCost}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No matching order found</Text>
        </View>
      )}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginButtonText}>Login for members</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '30%',
    resizeMode: 'contain',
    marginTop: -200,
  },
  title: {
    fontSize: 40 ,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: 5,
    fontSize: 16,
    color: colors.darkGray,
  },
  searchButton: {
    backgroundColor: colors.blue,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: 16,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  loginButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
