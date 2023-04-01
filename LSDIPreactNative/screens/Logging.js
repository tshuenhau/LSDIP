import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import moment from 'moment';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import DateTimePicker from 'react-datetime-picker';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrderSummary({ navigation }) {

    const auth1 = firebase.auth;
    const logData = firebase.firestore().collection('log');
    const currUser = auth1().currentUser.uid;
    const [logList, setLogList] = useState([]);
    const [user, setUser] = useState([]);
    const users = firebase.firestore().collection('users');
    const [index, setIndex] = React.useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        logData.onSnapshot(querySnapshot => {
            const logList = [];
            querySnapshot.forEach(doc => {
                const { date, logDetail, logType, outletName, outletId, staffID } = doc.data();
                logList.push({
                    id: doc.id,
                    date,
                    logDetail,
                    logType,
                    outletName,
                    outletId,
                    staffID
                });
            });
            setLogList(logList);
        });
    }, []);

    useEffect(() => {
        users.onSnapshot(querySnapshot => {
            const userList = [];
            querySnapshot.forEach(doc => {
                const { name, email, address } = doc.data();
                userList.push({
                    id: doc.id,
                    name,
                    email,
                    address,
                });
            });
            setUser(userList.find(u => u.id === currUser))
        });
    }, []);

    const filteredLog = logList.filter((item) => item.staffID.includes(currUser));

    const formatTime = (date) => {
        var convertedDate = date.toDate();
        return moment(convertedDate).format('YYYY-MM-DD hh:mmA');
    };

    const filteredDateList = filteredLog.filter((log) =>
        moment(log.date.toDate()).isSameOrBefore(selectedDate)
    );

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.outletName}>Log Type: {item.logType} </Text>
            </View>
            <View style={styles.cardBody}>
                {item.logType === "Order" &&
                    <Text style={styles.itemText}>{user.name} {item.logDetail} at {item.outletName} on {formatTime(item.date)}</Text>
                }
                {item.logType === "Admin" &&
                    <Text style={styles.itemText}>{user.name} {item.logDetail} on {formatTime(item.date)}</Text>
                }
                {item.logType === "Shift" &&
                    <Text style={styles.itemText}>{user.name} {item.logDetail} at {item.outletName} on {formatTime(item.date)}</Text>
                }
                {item.logType === "Outlet" &&
                    <Text style={styles.itemText}>{user.name} {item.logDetail} at {item.outletName} on {formatTime(item.date)}</Text>
                }
            </View>
        </View>
    );

    const FlatListSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "92%",
                    backgroundColor: colors.gray,
                    alignContent: "center",
                    alignSelf: 'center'
                }}
            />
        );
    }

    const Admin = () => (
        <View>
            <FlatList
                data={filteredDateList.filter(user => user.logType === "Admin")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={FlatListSeparator}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No Data Found!</Text>
                }
            />
        </View>
    );

    const Order = () => (
        <View>
            <FlatList
                data={filteredLog.filter(user => user.logType === "Order")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={FlatListSeparator}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No Data Found!</Text>
                }
            />
        </View>
    );
    const Outlet = () => (
        <View>
            <FlatList
                data={filteredLog.filter(user => user.logType === "Outlet")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={FlatListSeparator}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No Data Found!</Text>
                }
            />
        </View>
    );

    const Shift = () => (
        <View>
            <FlatList
                data={filteredLog.filter(user => user.logType === "Shift")}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={FlatListSeparator}
                ListEmptyComponent={
                    <Text style={styles.noDataText}>No Data Found!</Text>
                }
            />
        </View>
    );

    const renderScene = SceneMap({
        admin: Admin,
        order: Order,
        outlet: Outlet,
        shift: Shift,
    });

    const [routes] = React.useState([
        { key: 'admin', title: 'Admin' },
        { key: 'order', title: 'Order' },
        { key: 'outlet', title: 'Outlet' },
        { key: 'shift', title: 'Shift' },
    ]);

    return (
        <ScrollView>
            <View style={styles.buttonView}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Setting')}
                    style={styles.btn}>
                    <Text style={styles.text}>Back</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                {/*<FlatList
                    data={filteredLog}
                    renderItem={renderItem}
                    ItemSeparatorComponent={FlatListSeparator}
                    ListEmptyComponent={
                        <Text style={styles.noDataText}>No Data Found!</Text>
                    }
                />*/}
                <Text style={styles.searchText}>Activity Log</Text>
                <View style={styles.dateTimePicker}>
                    <DateTimePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        format="yyyy-MM-dd"
                    />
                </View>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    renderTabBar={props => <TabBar {...props} style={{ backgroundColor: colors.blue900 }} />}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    cardBody: {
        marginBottom: 20,
        marginLeft: 40,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    card: {
        backgroundColor: '#fff',
        marginVertical: 10,
        marginHorizontal: 16,
        borderRadius: 10,
    },
    outletName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 10
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginLeft: 20,
    },
    container: {
        backgroundColor: '#fff',
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
        marginHorizontal: "5%",
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        padding: 10
    },
    noDataText: {
        fontSize: 20,
        fontWeight: "600",
        alignContent: 'center',
        alignSelf: 'center',
        padding: 10,
        marginTop: 20
    },
    dateTimePicker: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 10,
        width: '100%',
        position: 'relative',
        zIndex: 1,
        marginTop: 10,
    },
    searchText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
        float: "left"
    }
})
