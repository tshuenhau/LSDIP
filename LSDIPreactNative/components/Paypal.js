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
        const { deliveryfee, matchingOrders, curuser, selectedTime, selectedDate } = route.params;
        this.setState({ ...this.state, deliveryfee, matchingOrders, curuser, selectedTime, selectedDate })
        console.log(deliveryfee);
        const dataDetail = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "total": deliveryfee,
                    "currency": "SGD",
                    "details": {
                        "subtotal": deliveryfee,
                        "tax": "0",
                        "shipping": "0",
                        "handling_fee": "0",
                        "shipping_discount": "0",
                        "insurance": "0",
                    }
                }
            }],
            "redirect_urls": {
                "return_url": "http://localhost:19006/",
                "cancel_url": "http://localhost:19006/"
            }
        }

        fetch('https://api.sandbox.paypal.com/v1/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer A21AAKcsDwXj7YaB_8mbZ9S1mlR4elOYc3VwHR30KjjA25rr0CDvAY0NI1xAY0RzAanUEPPmQOBtPiT6eykqpenvnMaj-G2Yw`
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
                        // alert('Payment Failed. Please Try Again!')
                        // this.setState({
                        //     approvalUrl: null
                        // })
                        // this.props.navigation.pop();
                    }
                    if (response.state === "approved") {
                        console.log("create delivery");
                        // updateDatabase();
                    }
                }).catch(err => {
                    console.log(...err)
                })
        }
    }

    updateDatabase = () => {
        // const db = firebase.firestore();
        // const user = firebase.auth().currentUser;
        // console.log(user);

        // const selectedOrders = this.state.matchingOrders.map((order) => order.id);

        // if (user) {
        //     const selectedHour = this.state.selectedTime.split(' - ')[0];
        //     const shiftTime = selectedHour.split('00')[1];
        //     const docRef = db.collection('shift_orders').doc(this.state.selectedDate);

        //     docRef.get()
        //         .then((doc) => {
        //             let shiftData;
        //             if (doc.exists) {
        //                 shiftData = doc.data();
        //             } else {
        //                 shiftData = {};
        //             }

        //             // Check if orders exist for this date, and create an empty array if not
        //             if (!shiftData[this.state.selectedDate]) {
        //                 shiftData[this.state.selectedDate] = [];
        //             }

        //             // Add selected orders to the array for this date
        //             shiftData[this.state.selectedDate].push(...selectedOrders);

        //             return docRef.set(shiftData);
        //         })
        //         .then(() => {
        //             console.log('Shift orders updated successfully');
        //             const docRef = db.collection('user_timings').doc(user.uid);
        //             docRef.get()
        //                 .then((doc) => {
        //                     let selectedTimes = [];

        //                     if (doc.exists) {
        //                         selectedTimes = doc.data().selected_times;
        //                     }

        //                     selectedTimes.push({
        //                         date: selectedDate,
        //                         time: this.state.selectedTime,
        //                         orders: matchingOrders,
        //                     });

        //                     return docRef.set({
        //                         selected_times: selectedTimes,
        //                     });
        //                 })
        //         })
        // }
    }

    render() {
        const { approvalUrl } = this.state;

        return (
            <View style={{ flex: 1 }}>
                {
                    approvalUrl ?
                        Platform.OS === "web"
                            ? (<iframe src={approvalUrl} height={'100%'} width={'100%'} />)
                            : <WebView
                                style={{ height: '100%', width: '100%', marginTop: 40 }}
                                source={{ uri: approvalUrl }}
                                onNavigationStateChange={this._onNavigationStateChange}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                startInLoadingState={false}
                            /> :
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{
                                color: 'black',
                                fontSize: 24, alignSelf: 'center'
                            }}>Do not press back or refresh page</Text>
                            <ActivityIndicator color={'black'} size={'large'} style={{ alignSelf: 'center', marginTop: 20 }} />
                        </View>

                }
            </View>
        )
    }
}