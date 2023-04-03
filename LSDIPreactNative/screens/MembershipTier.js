import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import colors from '../colors';
import Toast from 'react-native-toast-message';
import { firebase } from '../config/firebase';

export default function MembershipTier() {

    const initialValues = {
        name: "",
        expenditure: "",
        discount: "",
    }

    const [newTierValues, setNewTierValues] = useState(initialValues);
    const [existingTiers, setExistingTiers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const membershipTier = firebase.firestore().collection('membership_tier');


    useEffect(() => {
        membershipTier
            .get()
            .then(querySnapshot => {
                const existingTiers = [];
                querySnapshot.forEach((doc) => {
                    existingTiers.push({ id: doc.id, ...doc.data() });
                })
                console.log(existingTiers);
                setExistingTiers(existingTiers);
            })
    }, [])

    function handleNewChange(text, eventName) {
        setNewTierValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const createTier = () => {
        console.log("create");
        if (newTierValues.name && newTierValues.expenditure && newTierValues.discount) {
            membershipTier.add(newTierValues)
                .then(() => {
                    setNewTierValues(initialValues);
                    setErrorMessage("");
                    Toast.show({
                        type: 'success',
                        text1: 'Membership tier created',
                    });
                    console.log("Success");
                })
        } else {
            setErrorMessage("Please fill up all fields.");
        }
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <View style={styles.createCard}>
                    <Text style={styles.cardTitle}>Create Tier</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Tier Name</Text>
                        <TextInput
                            style={styles.input}
                            value={newTierValues.name}
                            onChangeText={text => handleNewChange(text, "name")}
                        />
                    </View >
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Expenditure</Text>
                        <TextInput
                            style={styles.input}
                            value={newTierValues.expenditure}
                            placeholder={"Amount"}
                            onChangeText={text => handleNewChange(text, "expenditure")}
                        />
                    </View >
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Discount (%)</Text>
                        <TextInput
                            style={styles.input}
                            value={newTierValues.discount}
                            placeholder={"0% - 100%"}
                            onChangeText={text => handleNewChange(text, "discount")}
                        />
                    </View >
                    {errorMessage &&
                        <View style={styles.errorMessageContainer}>
                            <Text style={styles.errorMessage}>{errorMessage}</Text>
                        </View>
                    }

                </View>
                <TouchableOpacity style={styles.button} onPress={createTier}>
                    <Text style={styles.buttonText}>Create Tier</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView style={{ margin: 30, padding: 15 }}>
                    {existingTiers &&
                        existingTiers.map((existingTier, index) => (
                            <View key={index} style={styles.tierContainer}>
                                <Text style={styles.tierTitle}>{existingTier.name}</Text>
                                <Text style={styles.tierText}>{existingTier.expenditure}</Text>
                                <Text style={styles.tierText}>{existingTier.discount}</Text>
                                <TouchableOpacity
                                    onPress={() => console.log("remove")}
                                    style={styles.removeButton}>
                                    <Text style={styles.removeButtonText}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    }
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    tierContainer: {
        backgroundColor: colors.white,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 16,
        // marginVertical: 10,
        // width: '100%',
    },
    tierTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
    tierText: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 4,
    },
    createCard: {
        // flex: 1,
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
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 15,
        margin: 30,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputContainer: {
        // flexDirection: 'row',
        // alignItems: 'center',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '400',
        opacity: "60%",
        marginHorizontal: 10,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        // backgroundColor: '#f0f0f0',
        borderRadius: 5,
        padding: 5,
        marginHorizontal: 10,
        // height: 15,
        fontSize: 14,
        borderColor: colors.darkBlue,
        borderWidth: 1,
        // textAlign: 'center',
    },
    button: {
        backgroundColor: colors.darkBlue,
        padding: 10,
        borderRadius: 25,
        width: '40%',
        // margin: 10,
        alignItems: 'center',
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
    errorMessageContainer: {
        padding: 10,
        alignItems: "center",
        marginBottom: 10,
        width: '100%',
    },
    errorMessage: {
        color: colors.red,
        fontStyle: 'italic',
        fontSize: 16,
    },
});