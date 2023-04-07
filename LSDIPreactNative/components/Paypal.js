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
        const { deliveryfee, selectedTime, selectedDate } = route.params;
        this.setState({ ...this.state, deliveryfee, selectedTime, selectedDate })
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
                    'Authorization': `Bearer A21AAJ3KfNZmvywo7yu0zCnAVRAN69SWslrnr22gDwmBhIAT0_cFk_QBWjodVRqqs7n7k-ClN8qwvLjS5fQNO6_nUJ0O7H8_A`
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

    // _onNavigationStateChange() {
    //     // alert(window.location.href);
    //     if (window.location.href.includes("localhost:19006/success")) {
    //         alert("called");
    //     }
    // }

    updateDatabase() {

        // const db = firebase.firestore();
        // const user = firebase.auth().currentUser;
        // console.log(user);
        // console.log(matchingOrders);
        // const selectedOrders = matchingOrders.map((order) => order.id);
        // console.log(selectedOrders);
        // console.log(selectedTime);
        // console.log(selectedDate);
        // if (user) {

        //     const docRef = db.collection('user_timings').doc(user.uid);
        //     docRef.get().then((doc) => {
        //         let selectedTimes = [];

        //         if (doc.exists) {
        //             selectedTimes = doc.data().selected_times;
        //         } else {
        //             // Create a new document with the user's uid and the initial data
        //             db.collection('user_timings').doc(user.uid).set({
        //                 selected_times: []
        //             });
        //             selectedTimes = doc.data().selected_times;
        //         }
        //         selectedTimes.push({
        //             date: selectedDate,
        //             time: selectedTime,
        //             orders: selectedOrders,
        //         });
        //         console.log(selectedTimes);
        //         db.collection('user_timings').doc(user.uid).set({
        //             selected_times: selectedTimes
        //         })
        //             .then(() => {
        //                 console.log('Selected times updated successfully');
        //             })
        //             .catch((error) => {
        //                 console.error('Error updating selected times:', error);
        //             });
        //         const batch = db.batch();
        //         matchingOrders.forEach((order) => {
        //             const orderRef = db.collection('orders').doc(order.id);

        //             // Convert the date string to a Date object
        //             const date = new Date(selectedDate);
        //             // Extract the hours and minutes from the time string
        //             const [hours, minutes] = selectedTime.split(" ")[0].split(':');
        //             const meridian = minutes.slice(2);
        //             const adjustedHours = meridian === 'pm' ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
        //             // Set the hours and minutes on the date object
        //             date.setHours(adjustedHours);
        //             // Create a Firestore Timestamp object
        //             const timestamp = firebase.firestore.Timestamp.fromDate(date);

        //             batch.update(orderRef, { orderStatus: 'Pending Delivery', deliveryDate: timestamp });
        //         });
        //         batch.commit()
        //             .then(() => {
        //                 console.log('Orders updated successfully');
        //             })
        //             .catch((error) => {
        //                 console.error('Error updating orders:', error);
        //             });
        //     }).then(() => {
        //         const selectedTimeObj = {
        //             time: selectedTime,
        //             orders: selectedOrders,
        //         };

        //         const selectedDateDocRef = db.collection('shift_orders').doc(selectedDate);
        //         selectedDateDocRef.get().then((doc) => {
        //             if (doc.exists) {
        //                 // If the document already exists, update its data
        //                 const updatedSelectedTimes = [...doc.data().selected_times, selectedTimeObj];
        //                 selectedDateDocRef.update({ selected_times: updatedSelectedTimes })
        //                     .then(() => {
        //                         console.log(`Selected times updated for ${selectedDate}`);
        //                     })
        //                     .catch((error) => {
        //                         console.error(`Error updating selected times for ${selectedDate}:`, error);
        //                     });
        //             } else {
        //                 // If the document doesn't exist, create a new one with the initial data
        //                 selectedDateDocRef.set({
        //                     date: selectedDate,
        //                     selected_times: [selectedTimeObj],
        //                 })
        //                     .then(() => {
        //                         console.log(`New document created for ${selectedDate}`);
        //                     })
        //                     .catch((error) => {
        //                         console.error(`Error creating new document for ${selectedDate}:`, error);
        //                     });
        //             }
        //         })
        //         navigation.navigate('Home');
        //         setTimeout(() => {
        //             window.location.reload();
        //         }, 2000);
        //     })

        //     // .then(() => {
        //     //   console.log('Selected time added for user with UID: ', user.uid);
        //     //   const newSelectedTimesList = [...selectedTimesList, { date: selectedDate, time: selectedTime, orders: matchingOrders, },];
        //     //   setSelectedTimesList(newSelectedTimesList);
        //     //   setSelectedTime(null);
        //     //   setIsModalOpen(false);
        //     //   const batch = db.batch();
        //     //   console.log(matchingOrders);
        //     //   matchingOrders.forEach((order) => {
        //     //     const orderRef = db.collection('orders').doc(order.id);
        //     //     batch.update(orderRef, { orderStatus: 'Pending Delivery' });
        //     //   });
        //     //   batch.commit()
        //     //     .then(() => {
        //     //       console.log('Orders updated successfully');
        //     //     })
        //     //     .catch((error) => {
        //     //       console.error('Error updating orders:', error);
        //     //     });
        //     // })
        //     // .catch((error) => {
        //     //   console.error(error);
        //     // });
        // }


        // // const selectedHour = selectedTime.split(' - ')[0];
        // // const shiftTime = selectedHour.split('00')[1];
        // // const docRef = db.collection('shift_orders').doc(selectedDate);

        // // docRef.get()
        // //   .then((doc) => {
        // //     let shiftData;
        // //     if (doc.exists) {
        // //       shiftData = doc.data();
        // //     } else {
        // //       shiftData = {};
        // //     }

        // //     // Check if orders exist for this date, and create an empty array if not
        // //     if (!shiftData[selectedDate]) {
        // //       shiftData[selectedDate] = [];
        // //     }

        // //     // Add selected orders to the array for this date

        // //     shiftData[selectedDate].push(...selectedOrders);

        // //     return docRef.set(shiftData);
        // //   })
        // //   .then(() => {
        // //     console.log('Shift orders updated successfully');
        // //     const docRef = db.collection('user_timings').doc(user.uid);
        // //     docRef.get()
        // //       .then((doc) => {
        // //         let selectedTimes = [];

        // //         if (doc.exists) {
        // //           selectedTimes = doc.data().selected_times;
        // //         }

        // //         selectedTimes.push({
        // //           date: selectedDate,
        // //           time: selectedTime,
        // //           orders: matchingOrders,
        // //         });

        // //         return docRef.set({
        // //           selected_times: selectedTimes,
        // //         });
        // //       })
        // //   })

    }

    render() {
        const { approvalUrl } = this.state;

        return (
            <View style={{ flex: 1 }}>
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