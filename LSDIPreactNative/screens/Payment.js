import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const PaymentQRCodeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PayNow</Text>
        <View style={styles.qrCodeContainer}>
          <QRCode value="paynow-qr-code-data" size={200} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PayLah!</Text>
        <View style={styles.qrCodeContainer}>
          <QRCode value="paylah-qr-code-data" size={200} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>GrabPay</Text>
        <View style={styles.qrCodeContainer}>
          <QRCode value="grabpay-qr-code-data" size={200} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    height: 300,
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
    marginBottom: 20,
  },
  qrCodeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentQRCodeScreen;
