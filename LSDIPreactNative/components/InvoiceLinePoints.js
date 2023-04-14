import {
    View,
    Text,
    StyleSheet
} from 'react-native'
import React from 'react'

export default function InvoiceLinePoints({ label, value, total, discount }) {
    //const formatCurrency = value.toFixed(2);
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Text style={
                total == true
                    ? styles.totalValue
                    : styles.value}>{value}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: 'space-between'
    },
    label: {
        fontSize: 18,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    }
})