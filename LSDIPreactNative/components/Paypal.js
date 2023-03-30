import { Text, View, ActivityIndicator, Platform } from 'react-native'
import React, { Component } from 'react'
import WebView from 'react-native-webview'

export default class Paypal extends Component {

    state = {
        accessToken: null,
        approvalUrl: null,
        paymentId: null,
    }

    componentDidMount() {
        const dataDetail = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "total": '0.01',
                    "currency": "SGD",
                    "details": {
                        "subtotal": '0.01',
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
                    'Authorization': `Bearer A21AAJ6VsuslNpyltsPNiQH5dFvF6YVNOekthQ9NaXo-bDZXCZZfFHdL-NKi_A5HVOPbdXmHOe88uIPEnZ1ndu5Hzdvy5PGmA`
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
                        alert('Payment Failed. Please Try Again!')
                        this.setState({
                            approvalUrl: null
                        })
                        this.props.navigation.pop();
                    }
                    if (response.state === "approved") {
                        console.log("create delivery");
                    }
                }).catch(err => {
                    console.log(...err)
                })
        }
    }
    render() {
        const { approvalUrl } = this.state;
        const { route } = this.props;
        const { deliveryfee, matchingOrders, curuser } = route.params;

        console.log(deliveryfee)
        console.log(matchingOrders)
        console.log(curuser);
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