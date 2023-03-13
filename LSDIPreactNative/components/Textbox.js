import React from 'react'
import { View, TextInput, StyleSheet } from "react-native"
import colors from '../colors';

const styles = StyleSheet.create({
    container: {
        height: 42,
        width: "92%",
        borderRadius: 10,
        marginTop: 20
    },
    textInput: {
        marginTop: 0,
        width: "100%",
        borderColor: colors.darkBlue,
        borderWidth: 1,
        paddingLeft: 15
    }

})

export default function TextBox(props) {
    return <View style={styles.container}>
        <TextInput style={{ ...styles.container, ...styles.textInput }} {...props} />
    </View>
}