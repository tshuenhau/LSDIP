import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import {StyleSheet, TextInput} from "react-native";
import TextBox from "../components/TextBox";
import Button from "../components/Button";

//just for testing, will remove afterward
const SendMessages = () => {
    const CHARACTER_LIMIT = 100;

    const [numberEmptyError, setNumberEmptyError] = useState(false);
    const [messageEmptyError, setMessageEmptyError] = useState(false);

    const [formData, setFormData] = useState({
        mobileNumber: "",
        message: "",
    });

    const { mobileNumber, message } = formData;

    const onChange = (text, eventName) => {
        setFormData({
            ...formData,
            [eventName]: text
        });
    };

    const onSubmit = (e) => {
        if (mobileNumber.length < 1) {
            setNumberEmptyError(true);
            setTimeout(() => setNumberEmptyError(false), 3000);
        } else if (message.length < 1) {
            setMessageEmptyError(true);
            setTimeout(() => setMessageEmptyError(false), 3000);
        } else {
            // Regex expression to remove all characters which are NOT alphanumeric 
            let number = mobileNumber.replace(/[^\w\s]/gi, "").replace(/ /g, "");

            // Appending the phone number to the URL
            let url = `https://web.whatsapp.com/send?phone=${number}`;

            // Appending the message to the URL by encoding it
            url += `&text=${encodeURI(message)}&app_absent=0`;

            // Open our newly created URL in a new tab to send the message
            window.open(url);
        }
    };

    return (
        <div className='communication'>
            <div className='whatsapp-card app'>
                <div className='title flex_middle'>
                    <div style={{ marginRight: "0.5em" }}>
                        
                    </div>
                    <div>Send Message</div>
                </div>
                {numberEmptyError && (
                    <div className='errors'>Mobile number cannot be empty!</div>
                )}
                {messageEmptyError && (
                    <div className='errors'>Message cannot be empty!</div>
                )}
                {!numberEmptyError && !messageEmptyError && (
                    <div className='errors-null'>.</div>
                )}
                <div className='search_contact app'>
                    <TextBox
                        error={numberEmptyError}
                        label='Mobile Number'
                        placeholder='Mobile Number'
                        name='mobileNumber'
                        value={mobileNumber}
                        onChangeText={text => onChange(text, "mobileNumber")}
                        size='small'
                        style={{
                            margin: "1em 0em",
                        }}
                        
                        
                        required
                    />
                </div>
                <div className='message app' style={{ marginTop: "1.5em" }}>
                    <TextBox
                        multiline
                        maxRows={4}
                        label='Message'
                        placeholder='Hi! Sending a message from React....'
                        size='small'
                        
                        inputProps={{
                            style: {
                                width: "230px",
                                height: "90px",
                            },
                            maxLength: CHARACTER_LIMIT,
                        }}
                        FormHelperTextProps={{
                            style: {
                                margin: 0,
                                padding: "0 0 0 5px",
                                fontSize: 10,
                            },
                        }}
                        name='message'
                        value={message}
                        onChangeText={text => onChange(text, "message")}
                        required
                        error={message.length > CHARACTER_LIMIT - 1 || messageEmptyError}
                        helperText={
                            !(message.length > CHARACTER_LIMIT - 1)
                                ? `${message.length}/${CHARACTER_LIMIT}`
                                : "Max length exceeded"
                        }
                    />
                </div>
                <div style={{ marginTop: "1.5em" }}>
                    <Button
                        onClick={onSubmit}
                        variant='outlined'
                        color='success'
                        size='small'
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
};

SendMessages.propTypes = {
    number: PropTypes.string.isRequired,
    message: PropTypes.string,
};

const styles = StyleSheet.create({

});

export default SendMessages;