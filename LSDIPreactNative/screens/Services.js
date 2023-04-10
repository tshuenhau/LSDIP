import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    TextInput,
    LayoutAnimation,
    UIManager,
    Platform,
    ScrollView
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";
import alert from '../components/Alert'
import Toast from 'react-native-toast-message';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Services({ navigation }) {

    const [modalVisible, setmodalVisible] = useState(false);
    const laundryCItem = firebase.firestore().collection('laundryCategory');
    const [cvalues, setCValues] = useState(initialCategoryValues);
    const [serviceList, setServiceList] = useState([]);
    const [expandedService, setExpandedService] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState("");

    //for services
    const initialCategoryValues = {
        serviceName: "",

    };

    //for services list
    useEffect(() => {
        laundryCItem.onSnapshot(querySnapshot => {
            const serviceList = [];
            querySnapshot.forEach(doc => {
                const { serviceName } = doc.data();
                serviceList.push({
                    id: doc.id,
                    serviceName,
                });
            });
            setServiceList(serviceList);
        });
    }, []);

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedService === id) {
            setExpandedService(null);
        } else {
            setExpandedService(id);
        }
    };

    //for services
    const clearCState = () => {
        setCValues({ ...initialCategoryValues });
    }

    //for services
    function handleChangeCategory(text, eventName) {
        setCValues(prev => {
            return {
                ...prev,
                [eventName]: text
            }
        })
    }

    const deleteService = (service) => {
        return alert(
            "Confirmation",
            "Are you sure you want to delete this Service?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        laundryCItem.doc(service.id)
                            .delete()
                            .then(() => {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Service Deleted',
                                });
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

    function createLaundryCategory() {
        if (cvalues.serviceName) {
            laundryCItem.add(cvalues)
                .then(() => {
                    setmodalVisible(!modalVisible);
                    clearCState;
                    console.log("Success");
                    Toast.show({
                        type: 'success',
                        text1: 'Service Created',
                    });
                    setErrorMessage("");
                }).catch((err) => {
                    console.log(err);
                })
        } else {
            setErrorMessage("Please fill up all fields");
        }
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.outletName}>{item.serviceName} </Text>
                <View style={styles.cardHeaderIcon}>
                    <FontAwesome
                        style={styles.outletIcon}
                        name="trash-o"
                        color='red'
                        onPress={() => deleteService(item)}
                    />
                </View>
            </View>
            {expandedService === item.id && (
                <View style={styles.itemContainer}>
                    <View style={styles.cardBody}>
                        <Text style={styles.itemText}>Service Name: {item.serviceName} </Text>
                    </View>
                    <View style={styles.cardButtons}>


                    </View>
                </View>
            )}
        </TouchableOpacity>
    );

    const filteredServiceList = serviceList.filter((service) =>
        service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View>
            {/* <View style={styles.buttonView}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.btn}>
                    <Text style={styles.text}>Back</Text>
                </TouchableOpacity>
            </View> */}
            <View style={styles.container}>
                {/*for create services */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                >
                    <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={styles.view}>
                                    <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Create New Services</Text>
                                    <TextBox placeholder="Service Name" onChangeText={text => handleChangeCategory(text, "serviceName")} />
                                    {errorMessage &&
                                        <View style={styles.errorMessageContainer}>
                                            <Text style={styles.errorMessage}>{errorMessage}</Text>
                                        </View>
                                    }
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                                        <Btn onClick={() => createLaundryCategory()} title="Create" style={{ width: "48%" }} />
                                        <Btn onClick={() => setmodalVisible(!modalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal >
                {/*to view service list */}
                
                <Text style={styles.searchText}>Service List </Text>
                <View style={styles.header}>
                    <View style={styles.searchnfilter}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search by Name"
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => setmodalVisible(!modalVisible)}
                        style={styles.createBtn}>
                        <Text style={styles.text}>Create Service</Text>
                    </TouchableOpacity>
                </View>
                {/*
                <View style={styles.view}>
                    <TouchableOpacity
                        onPress={() => setmodalVisible(!modalVisible)}
                        style={styles.btn}>
                        <Text style={styles.text}>Create Service</Text>
                    </TouchableOpacity>
                </View> */}
                <View>
                    

                    <FlatList
                        data={filteredServiceList}
                        keyExtractor={service => service.id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <Text style={styles.noDataText}>No Data Found!</Text>
                        }
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    errorMessageContainer: {
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
        width: '100%',
    },
    errorMessage: {
        color: colors.red,
        fontStyle: 'italic',
        fontSize: 16,
    },
    cardBody: {
        padding: 16,
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
    card: {
        backgroundColor: colors.white,
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
        padding: 20
    },
    outletIcon: {
        fontSize: 25,
        margin: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    deleteIcon: {
        fontSize: 25,
    },
    view: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },
    view2: {
        width: "40%",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    createBtn: {
        borderRadius: 5,
        backgroundColor: colors.blue600,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 30,
        marginTop: 6,
        width: '23%',
        height: '74%'
    },
    btn2: {
        padding: 5,
        height: 100,
        width: 250,
        borderRadius: 25,
        backgroundColor: "#0B3270",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        padding: 10
    },
    searchnfilter: {
        flexDirection: 'row',
        width: "78%"
      },
    searchContainer: {
        width: "96%",
        marginVertical: 15,
        marginLeft: "auto",
        marginRight: "auto",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#f5f5f5',
        backgroundColor: colors.themelight,
        alignItems: "center",
        flexDirection: "row"
    },
    searchInput: {
        height: 40,
        fontSize: 18,
        width:'100%',
        marginLeft: 10,
        paddingHorizontal: 10
    },
    searchText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
        float: "left"
    },
    listtext: {
        paddingLeft: 20,
        fontSize: 20,
        fontWeight: "600",
        color: "black"
    },
    header: {
        width: "97%",
        flexDirection: "row",
        marginTop: 40
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
        width: "50%",
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
    },
    cardHeaderIcon: {
        flexDirection: 'row',
        padding: 16,
    },
    container: {
        backgroundColor: colors.lightGray,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: '2%',
        width: '95%',
        marginBottom: 20,
    },
    buttonView: {
        justifyContent: 'space-between',
        marginTop: 30,
        flexDirection: 'row',
    },
    btn: {
        borderRadius: 20,
        backgroundColor: colors.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        width: "20%",
        marginLeft: "2.5%",
    },
})