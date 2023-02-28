// import { useEffect } from "react";
import QRCode from "react-native-qrcode-svg";
// import Button from "../components/Button";
import { View, StyleSheet, Button, Platform, Text } from "react-native";
import * as Print from "expo-print";
import * as React from "react";

const html = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  </head>
  <body style="text-align: center;">
    <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
      Hello Expo!
    </h1>
    <img
      src="https://d30j33t1r58ioz.cloudfront.net/static/guides/sdk.png"
      style="width: 90vw;" />
  </body>
</html>
`;

//TODO: https://stackoverflow.com/questions/57694271/print-react-native-text-and-qr-generatedad
export default function QR(props) {
  const [selectedPrinter, setSelectedPrinter] = React.useState();
  const [qrData, setQrData] = React.useState();

  //   const [qrData, setQrData] = useState([]);

  //   getDataURL = () => this.svg.toDataURL(this.callback);

  //   callback = (dataURL) => {
  //     this.setState({ qrData: dataURL });
  //   };
  const print = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html: `
       <h3>Hello World</h3>
       <img src="data:image/jpeg;base64,${qrData}"/>
     `,
      printerUrl: selectedPrinter?.url, // iOS only
    });
  };

  const printToFile = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({ html });
    console.log("File has been saved to:", uri);
    await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };

  return (
    <div>
      <QRCode value={props.orderID} getRef={(c) => setQrData(c)} />{" "}
      <button title="Print QR to HTML" onClick={print}>
        {" "}
        Print
      </button>
      {/* <Button title="Print to PDF file" onPress={printToFile} /> */}
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
    </div>
  );
}
