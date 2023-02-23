import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    LayoutAnimation,
    UIManager,
    Platform,
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import alert from '../components/Alert'
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OutletList({ navigation }) {

    const initialValues = {
        outletName: "",
        outletAddress: "",
        outletNumber: "",
        outletEmail: ""
    };

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [outletList, setOutletList] = useState([]);
    const [values, setValues] = useState(initialValues);
    const [expandedOutlet, setExpandedOutlet] = useState(null);
    const outlets = firebase.firestore().collection('outlet');

    useEffect(() => {
        outlets.onSnapshot(querySnapshot => {
            const outletList = [];
            querySnapshot.forEach(doc => {
                const { outletAddress, outletEmail, outletName, outletNumber } = doc.data();
                outletList.push({
                    id: doc.id,
                    outletName,
                    outletAddress,
                    outletNumber,
                    outletEmail
                });
            });
            setOutletList(outletList);
        });
    }, []);

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedOutlet === id) {
            setExpandedOutlet(null);
        } else {
            setExpandedOutlet(id);
        }
    };

    const clearState = () => {
        setValues({ ...initialValues });
    }

    function handleChange(text, eventName) {
        setValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    function createOutlet() {
        outlets.add(values)
            .then(() => {
                setCreateModalVisible(!createModalVisible);
                clearState;
                console.log("Success");
            }).catch((err) => {
                console.log(err);
            })
    }

    const deleteOutlet = (outlet) => {
        return alert(
            "Confirmation",
            "Are you sure you want to delete this outlet?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        outlets.doc(outlet.id)
                            .delete()
                            .then(() => {
                                alert("Deleted Successfully");
                            }).catch((err) => {
                                console.log(err);
                            })
                    }
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancelled`"),
                    style: "cancel"
                }
            ]
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.outletName}>{item.outletName} </Text>
            </View>
            {expandedOutlet === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Address: {item.outletAddress} </Text>
                        <Text style={styles.itemText}>Number: {item.outletNumber} </Text>
                        <Text style={styles.itemText}>Email: {item.outletEmail} </Text>
                    </View>
                    <View style={styles.cardButtons}>
                        <FontAwesome
                            style={styles.outletIcon}
                            color="black"
                            name="edit"
                            onPress={() => navigation.navigate('OutletDetail', { item })}
                        />
                        <FontAwesome
                            style={styles.outletIcon}
                            name="trash-o"
                            color='red'
                            onPress={() => deleteOutlet(item)}
                        />
                    </View>
                </View>
            )}

        </TouchableOpacity>
    );

    return (
        <View>
            <View style={styles.view}>
                <TouchableOpacity
                    onPress={() => setCreateModalVisible(!createModalVisible)}
                    style={styles.btn}>
                    <Text style={styles.text}>Create Outlet</Text>
                </TouchableOpacity>
            </View>

            {/* Create Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.view}>
                            <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Outlet</Text>
                            <TextBox placeholder="Outlet Name" onChangeText={text => handleChange(text, "outletName")} />
                            <TextBox placeholder="Outlet Address" onChangeText={text => handleChange(text, "outletAddress")} />
                            <TextBox placeholder="Outlet Number" onChangeText={text => handleChange(text, "outletNumber")} />
                            <TextBox placeholder="Outlet Email" onChangeText={text => handleChange(text, "outletEmail")} />
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                <Btn onClick={() => createOutlet()} title="Create" style={{ width: "48%" }} />
                                <Btn onClick={() => setCreateModalVisible(!createModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <View>
                <FlatList
                    data={outletList}
                    keyExtractor={outlet => outlet.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.noDataText}>No Data Found!</Text>
                    }
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardBody: {
        padding: 16,
    },
    noDataText: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    itemContainer: {
        backgroundColor: colors.lightGray,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        paddingVertical: 8,
        paddingRight: 20,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    cardButtons: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    card: {
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
    },
    outletName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    outletIcon: {
        fontSize: 25,
        margin: 10,
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    },
    btn: {
        padding: 10,
        borderRadius: 25,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff"
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
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
    }
})