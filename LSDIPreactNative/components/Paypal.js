import { Text, View, ActivityIndicator, Platform } from 'react-native'
import React, { Component } from 'react'
import WebView from 'react-native-webview'
import { firebase } from '../config/firebase';

export default class Paypal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            accessToken: null,
            approvalUrl: null,
            paymentId: null,
        };
    }

    componentDidMount() {

        const { route } = this.props;
        const { deliveryfee, selectedTime, selectedDate, user } = route.params;
        this.setState({ ...this.state, deliveryfee, selectedTime, selectedDate, user })
        console.log(deliveryfee);
        const dataDetail = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "total": deliveryfee.toFixed(2),
                    "currency": "SGD",
                    "details": {
                        "subtotal": deliveryfee.toFixed(2),
                        "tax": "0",
                        "shipping": "0",
                        "handling_fee": "0",
                        "shipping_discount": "0",
                        "insurance": "0",
                    }
                }
            }],
            "redirect_urls": {
                "return_url": "http://localhost:19006/success/" + selectedDate + "/" + selectedTime + "/",
                "cancel_url": "http://localhost:19006/cancel"
            }
        }

        fetch('https://api.sandbox.paypal.com/v1/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer A21AAKZ7AgLveWmDBjSiaY5rj6ayXcPe8yv52PFRPW8ykvGfx-Qpli5eArL5HNNX4UmKkcslA1dEQTBZf7VSqfHviHifNqvtQ`
                },
                body: 'grant_type=client_credentials'
            }
        )
            .then(res => res.json())
            .then(response => {
                console.log("response====", response);
                this.setState({
                    accessToken: response.access_token
                })

                fetch('https://api.sandbox.paypal.com/v1/payments/payment',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${response.access_token}`
                        },
                        body: JSON.stringify(dataDetail)
                    }
                )
                    .then(res => res.json())
                    .then(response => {
                        console.log("response", response);
                        const { id, links } = response;
                        const approvalUrl = links.find(data => data.rel == "approval_url")
                        console.log("approvalUrl", approvalUrl);
                        this.setState({
                            paymentId: id,
                            approvalUrl: approvalUrl.href
                        })
                    }).catch(err => {
                        console.log({ ...err })
                    })
            }).catch(err => {
                console.log({ ...err })
            })
    }

    updateDatabase() {
        firebase.firestore().collection("orders")
            .where("customerNumber", "==", this.state.user.number)
            .where("orderStatus", "==", "Back from Wash")
            .get()
            .then(querySnapshot => {
                const matchingOrders = [];
                querySnapshot.forEach((doc) => {
                    matchingOrders.push({ id: doc.id, ...doc.data() });
                });
                console.log(matchingOrders);
                const db = firebase.firestore();
                const user = firebase.auth().currentUser;
                console.log(user);
                const selectedOrders = matchingOrders.map((order) => order.id);
                console.log(selectedOrders);
                console.log(this.state.selectedTime);
                console.log(this.state.selectedDate);
                if (user) {

                    const docRef = db.collection('user_timings').doc(user.uid);
                    docRef.get().then((doc) => {
                        let selectedTimes = [];

                        if (doc.exists) {
                            selectedTimes = doc.data().selected_times;
                        } else {
                            // Create a new document with the user's uid and the initial data
                            db.collection('user_timings').doc(user.uid).set({
                                selected_times: []
                            });
                            selectedTimes = doc.data().selected_times;
                        }
                        selectedTimes.push({
                            date: this.state.selectedDate,
                            time: this.state.selectedTime,
                            orders: selectedOrders,
                        });
                        console.log(selectedTimes);
                        db.collection('user_timings').doc(user.uid).set({
                            selected_times: selectedTimes
                        })
                            .then(() => {
                                console.log('Selected times updated successfully');
                            })
                            .catch((error) => {
                                console.error('Error updating selected times:', error);
                            });
                        const batch = db.batch();
                        matchingOrders.forEach((order) => {
                            const orderRef = db.collection('orders').doc(order.id);

                            // Convert the date string to a Date object
                            const date = new Date(this.state.selectedDate);
                            // Extract the hours and minutes from the time string
                            const [hours, minutes] = this.state.selectedTime.split(" ")[0].split(':');
                            const meridian = minutes.slice(2);
                            const adjustedHours = meridian === 'pm' ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
                            // Set the hours and minutes on the date object
                            date.setHours(adjustedHours);
                            // Create a Firestore Timestamp object
                            const timestamp = firebase.firestore.Timestamp.fromDate(date);

                            batch.update(orderRef, { orderStatus: 'Pending Delivery', deliveryDate: timestamp });
                        });
                        batch.commit()
                            .then(() => {
                                console.log('Orders updated successfully');
                            })
                            .catch((error) => {
                                console.error('Error updating orders:', error);
                            });
                    }).then(() => {
                        const selectedTimeObj = {
                            time: this.state.selectedTime,
                            orders: selectedOrders,
                        };

                        const selectedDateDocRef = db.collection('shift_orders').doc(this.state.selectedDate);
                        selectedDateDocRef.get().then((doc) => {
                            if (doc.exists) {
                                // If the document already exists, update its data
                                const updatedSelectedTimes = [...doc.data().selected_times, selectedTimeObj];
                                selectedDateDocRef.update({ selected_times: updatedSelectedTimes })
                                    .then(() => {
                                        console.log(`Selected times updated for ${this.state.selectedDate}`);
                                    })
                                    .catch((error) => {
                                        console.error(`Error updating selected times for ${this.state.selectedDate}:`, error);
                                    });
                            } else {
                                // If the document doesn't exist, create a new one with the initial data
                                selectedDateDocRef.set({
                                    date: this.state.selectedDate,
                                    selected_times: [selectedTimeObj],
                                })
                                    .then(() => {
                                        console.log(`New document created for ${this.state.selectedDate}`);
                                    })
                                    .catch((error) => {
                                        console.error(`Error creating new document for ${this.state.selectedDate}:`, error);
                                    });
                            }
                        })
                    })
                }
            })
    }

    _onNavigationStateChange = (webViewState) => {
        console.log("webViewstate", webViewState);
        if (webViewState.url.includes('http://localhost:19006/')) {
            this.setState({
                approvalUrl: null
            })

            const { PayerId, paymentId } = webViewState.url

            fetch(`https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`, {
                method: 'POST',
                body: { payer_id: PayerId },

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.state.accessToken}`
                }
            })
                .then(res => res.json())
                .then(response => {
                    console.log("res", response);
                    if (response.name == "INVALID_RESOURCE_ID") {
                        alert('Payment Failed. Please Try Again!')
                        this.setState({
                            approvalUrl: null
                        })
                        this.props.navigation.pop();
                    }
                    if (response.state === "approved") {
                        console.log("create delivery");
                        this.updateDatabase();
                    }
                }).catch(err => {
                    console.log(...err)
                })
        }
    }

    render() {
        const { approvalUrl } = this.state;

        return (
            <View style={{ flex: 1 }} >
                {
                    approvalUrl ?
                        Platform.OS === "web"
                            ? (<iframe id='iframe_id' src={approvalUrl} height={'100%'} width={'100%'} />)
                            : <WebView
                                style={{ height: '100%', width: '100%', marginTop: 40 }}
                                source={{ uri: approvalUrl }}
                                onNavigationStateChange={this._onNavigationStateChange}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={false}
                            /> :
                        < View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{
                                color: 'black',
                                fontSize: 24, alignSelf: 'center'
                            }}>Do not press back or refresh page</Text>
                            <ActivityIndicator color={'black'} size={'large'} style={{ alignSelf: 'center', marginTop: 20 }} />
                        </View >

                }
            </View >
        )
    }
}