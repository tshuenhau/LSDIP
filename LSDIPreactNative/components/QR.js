import { useEffect } from "react";
import QRCode from "react-native-qrcode-svg";
// import Button from "../components/Button";
import { View, StyleSheet, Button, Platform, Text } from "react-native";
import * as Print from "expo-print";
import * as React from "react";

// TODO: https://stackoverflow.com/questions/57694271/print-react-native-text-and-qr-generatedad
export default function QR(props) {
  const [selectedPrinter, setSelectedPrinter] = React.useState();
  const [qrCode, setQrCode] = React.useState();

  useEffect(() => {}, []);

  const print = async () => {
    if (Platform.OS != "web") {
      getDataURL();
    } else {
      const html = `

      `;
      await Print.printAsync({
        html,
        printerUrl: selectedPrinter?.url, // iOS only
      });
    }
  };
  const getDataURL = () => {
    qrCode.toDataURL(callback);
  };

  const callback = async (dataURL) => {
    const html = `
       <h3>Order ID: ${props.orderID}</h3>
       <br></br>
       <img src="data:image/jpeg;base64,${dataURL}"/>
     `;
    await Print.printAsync({
      html: html,
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };

  return (
    <View>
      <View style={{ opacity: 0 }}>
        <QRCode size={30} value={props.orderID} getRef={(c) => setQrCode(c)} />
      </View>

      {Platform.OS === "web" && (
        <>
          <View style={{}}>
            <QRCode
              size={100}
              value={props.orderID}
              getRef={(c) => setQrCode(c)}
            />
            <br></br>
          </View>
        </>
      )}
      <Button title="Print QR" onPress={print}></Button>
      {Platform.OS === "ios" && (
        <>
          <View style={styles.spacer} />
          <Button title="Select printer" onPress={selectPrinter} />
          <View style={styles.spacer} />
          {selectedPrinter ? (
            <Text
              style={styles.printer}
            >{`Selected printer: ${selectedPrinter.name}`}</Text>
          ) : undefined}
        </>
      )}
    </View>
  );
}
