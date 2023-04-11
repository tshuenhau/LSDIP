import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native'
import React, { useEffect, useState } from "react"
import colors from '../colors';
import DateTimePicker from 'react-datetime-picker';
import { SelectList } from 'react-native-dropdown-select-list';
import { firebase } from '../config/firebase';
import 'react-datetime-picker/dist/DateTimePicker.css';
import { printToFileAsync } from 'expo-print';
// import { shareAsync } from 'expo-sharing';

export default function Report() {

    const [selectedFromDate, setSelectedFromDate] = useState();
    const [selectedToDate, setSelectedToDate] = useState("");
    const [reportType, setReportType] = useState("");
    const [outletDisplay, setOutletDisplay] = useState("");
    const [selectedOutlet, setSelectedOutlet] = useState("");
    const [selectedSort, setSelectedSort] = useState("");
    const [outlets, setOutlets] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [staff, setStaff] = useState([]);
    const [revenueResult, setRevenueResult] = useState([]);
    const [payrollResult, setPayrollResult] = useState([]);
    const orders = firebase.firestore().collection('orders');
    const outlet = firebase.firestore().collection("outlet");
    const users = firebase.firestore().collection('users');
    const shift_timings = firebase.firestore().collection("shift_timings");
    const staff_schedule = firebase.firestore().collection('staff_schedule');

    const reports = [
        { key: '1', value: 'Payroll' },
        { key: '2', value: 'Revenue' },
        // { key: '3', value: 'Profit' },
    ]

    const sort = [
        { key: 'asc', value: 'Ascending' },
        { key: 'desc', value: 'Descending' },
    ]

    const locale = 'en';
    const currentDate = new Date();
    const day = currentDate.toLocaleDateString(locale, { weekday: 'long' });
    const date = `${day}, ${currentDate.getDate()} ${currentDate.toLocaleDateString(locale, { month: 'long' })} `;
    const time = currentDate.toLocaleTimeString(locale, { hour: 'numeric', hour12: true, minute: 'numeric' });

    useEffect(() => {
        outlet
            .get()
            .then(querySnapshot => {
                const outlets = [];
                querySnapshot.forEach(doc => {
                    outlets.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                setOutlets(outlets)
            })

        shift_timings
            .get()
            .then(querySnapshot => {
                const shifts = []
                querySnapshot.forEach(doc => {
                    shifts.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                setShifts(shifts);
            })

        users
            .where("role", "in", ["Staff", "Driver"])
            .get()
            .then(querySnapshot => {
                const staff = []
                querySnapshot.forEach(doc => {
                    staff.push({
                        id: doc.id,
                        ...doc.data(),
                    })
                })
                setStaff(staff);
            })
    }, [])

    useEffect(() => {
        outlet
            .get()
            .then(querySnapshot => {
                const outletDisplay = [];
                querySnapshot.forEach(doc => {
                    outletDisplay.push({
                        key: doc.id,
                        value: doc.data().outletName,
                    })
                })
                setOutletDisplay(outletDisplay);
            })
    }, [])

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    };

    const generateReport = () => {

        if (reportType === "Revenue") {
            orders
                .where("outletId", "==", selectedOutlet)
                .where("orderDate", ">=", selectedFromDate)
                .where("orderDate", "<", selectedToDate)
                .orderBy("orderDate", selectedSort)
                .get()
                .then(querySnapshot => {
                    const revenueResult = [];
                    querySnapshot.forEach(doc => {
                        const { invoiceNumber, totalPrice } = doc.data();
                        revenueResult.push({
                            invoiceNumber,
                            totalPrice,
                        })
                    })
                    const totalPriceSum = revenueResult.reduce((sum, invoice) => sum + invoice.totalPrice, 0);
                    revenueResult.push({
                        grandTotal: totalPriceSum,
                    })
                    console.log(revenueResult);
                    if (payrollResult) {
                        setPayrollResult([]);
                    }
                    setRevenueResult(revenueResult);
                }).catch((err) => {
                    console.log(err);
                })
        } else if (reportType === "Payroll") {
            const fromDate = formatDate(selectedFromDate);
            const toDate = formatDate(selectedToDate)
            staff_schedule
                .where("outletID", "==", selectedOutlet)
                .where("completed", "==", true)
                .where("date", ">=", fromDate)
                .where("date", "<=", toDate)
                .get()
                .then(querySnapshot => {
                    const payrollResult = [];
                    querySnapshot.forEach(doc => {
                        const { name, hours } = shifts.find(item => item.id === doc.data().shiftID);
                        const { outletName } = outlets.find(item => item.id === doc.data().outletID);
                        const staffName = staff.find(item => item.id === doc.data().userID).name;
                        const rate = (staff.find(item => item.id === doc.data().userID).salary) || 0;
                        const date = doc.data().date;
                        payrollResult.push({
                            date,
                            name,
                            hours,
                            outletName,
                            staffName,
                            rate,
                            amount: Number(rate) * Number(hours),
                        })
                    })
                    console.log(payrollResult);
                    if (revenueResult) {
                        setRevenueResult([])
                    }
                    setPayrollResult(payrollResult);
                }).catch((err) => {
                    console.log(err);
                })
        }
        setTimeout(() => {
            const html = () => Report();
            const createPDF = async () => {
                try {
                    const { uri } = await printToFileAsync({ html });
                    return uri;
                } catch (err) {
                    console.error(err);
                }
            };
            createPDF();
        }, 4000);
    }

    const renderRevenueItem = ({ item: order }) => {
        if (order.invoiceNumber) {
            return (
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                        <Text style={styles.cardText}>{order.invoiceNumber}</Text>
                    </View>
                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                        <Text style={styles.cardText}>${order.totalPrice}</Text>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                        <Text style={styles.cardText}>Grand total</Text>
                    </View>
                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                        <Text style={styles.cardText}>${order.grandTotal}</Text>
                    </View>
                </View>
            )
        }
    }

    const renderPayrollItem = ({ item: shift }) => {
        return (
            <View style={styles.cardHeader}>
                <View style={{ flex: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                    <Text style={styles.cardText}>{shift.date}</Text>
                </View>
                <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                    <Text style={styles.cardText}>{shift.name}</Text>
                </View>
                <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                    <Text style={styles.cardText}>{shift.hours}</Text>
                </View>
                <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                    <Text style={styles.cardText}>{shift.outletName}</Text>
                </View>
                <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                    <Text style={styles.cardText}>{shift.staffName}</Text>
                </View>
                <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                    <Text style={styles.cardText}>${shift.rate}</Text>
                </View>
                <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc', borderBottomWidth: 1 }}>
                    <Text style={styles.cardText}>${shift.amount}</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <View style={styles.topContainer}>
                    <Text style={styles.pageTitle}>Generate Report</Text>
                    <Text style={styles.dateText}>{date + time}</Text>
                    <Text stylele={styles.descriptionText}>Search payroll and other sales data</Text>
                </View>

                <View style={styles.inputContainer}>
                    <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-evenly' }}>
                        <View>
                            <Text style={styles.labelText}>
                                Report
                            </Text>
                            <SelectList
                                data={reports}
                                placeholder="Select report"
                                search={false}
                                setSelected={(val) => setReportType(val)}
                                save="value"
                            />
                        </View>

                        <View>
                            <Text style={styles.labelText}>
                                Outlet
                            </Text>
                            <SelectList
                                data={outletDisplay}
                                placeholder="Select outlet"
                                search={false}
                                setSelected={(val) => setSelectedOutlet(val)}
                                save="key"
                            />
                        </View>

                        <View>
                            <Text style={styles.labelText}>
                                From Date
                            </Text>
                            <View style={styles.dateTimePicker}>
                                <DateTimePicker
                                    maxDate={new Date()}
                                    value={selectedFromDate}
                                    onChange={(date) => setSelectedFromDate(date)}
                                    format="yyyy-MM-dd"
                                />
                            </View>
                        </View>

                        <View>
                            <Text style={styles.labelText}>
                                To Date
                            </Text>
                            <View style={styles.dateTimePicker}>
                                <DateTimePicker
                                    maxDate={new Date()}
                                    value={selectedToDate}
                                    onChange={(date) => setSelectedToDate(date)}
                                    format="yyyy-MM-dd"
                                />
                            </View>
                        </View>

                        {reportType && reportType === "Revenue" &&
                            <View>
                                <Text style={styles.labelText}>
                                    Sort
                                </Text>
                                <SelectList
                                    data={sort}
                                    search={false}
                                    setSelected={(val) => setSelectedSort(val)}
                                    save="key"
                                />
                            </View>
                        }
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <TouchableOpacity
                            onPress={() => generateReport()}
                            style={styles.createBtn}>
                            <Text style={styles.text}>Generate</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {revenueResult.length > 0 &&
                    <View>
                        <View style={styles.orders}>
                            <View style={{ borderWidth: 1, borderColor: "#ccc" }}>
                                <View style={styles.tableHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.tableHeaderText}>Invoice No</Text>
                                    </View>
                                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={styles.tableHeaderText}>Amount</Text>
                                    </View>
                                </View>
                                <FlatList
                                    data={revenueResult}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={renderRevenueItem}
                                    ListEmptyComponent={
                                        <Text style={styles.noDataText}>No Data Found!</Text>
                                    }
                                />
                            </View>
                        </View>
                    </View>
                }

                {payrollResult.length > 0 &&
                    <View>
                        <View style={styles.payrollTable}>
                            <View style={{ borderWidth: 1, borderColor: "#ccc" }}>
                                <View style={styles.tableHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.tableHeaderText}>Date</Text>
                                    </View>
                                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={styles.tableHeaderText}>Shift</Text>
                                    </View>
                                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={styles.tableHeaderText}>Shift Hours</Text>
                                    </View>
                                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={styles.tableHeaderText}>Outlet</Text>
                                    </View>
                                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={styles.tableHeaderText}>Staff Name</Text>
                                    </View>
                                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={styles.tableHeaderText}>Shift Rate</Text>
                                    </View>
                                    <View style={{ flex: 1, borderLeftWidth: 1, borderColor: '#ccc' }}>
                                        <Text style={styles.tableHeaderText}>Amount</Text>
                                    </View>
                                </View>
                                <FlatList
                                    data={payrollResult}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={renderPayrollItem}
                                    ListEmptyComponent={
                                        <Text style={styles.noDataText}>No Data Found!</Text>
                                    }
                                />
                            </View>
                        </View>
                    </View>
                }


            </ScrollView>
        </View >
    )
}

const styles = StyleSheet.create({
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    cardText: {
        fontSize: 20,
        textAlign: "center",
    },
    orders: {
        marginHorizontal: "auto",
        width: '30%',
    },
    payrollTable: {
        marginHorizontal: "auto",
        width: '80%',
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: 'space-evenly',
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    tableHeaderText: {
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 20,
    },
    noDataText: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 10,
    },
    pageTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dateText: {
        fontWeight: '300',
        fontSize: 16,
        opacity: "60%",
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        marginBottom: 10,
    },
    topContainer: {
        marginVertical: 30,
        marginHorizontal: 50,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: colors.lightGray,
        borderRadius: 25,
        marginBottom: 20,
        marginHorizontal: 50,
        padding: 20,
    },
    labelText: {
        fontSize: 20,
        fontWeight: '700'
    },
    createBtn: {
        borderRadius: 5,
        padding: 5,
        backgroundColor: colors.blue600,
        justifyContent: "center",
        alignItems: 'center',
        marginRight: 30,
        marginTop: 15,
        width: '18%',
        height: '74%'
    },
    text: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff"
    },
})