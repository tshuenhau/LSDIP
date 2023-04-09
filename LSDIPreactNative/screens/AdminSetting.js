import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Switch,
    UIManager,
    Platform,
    ScrollView
} from 'react-native';
import { firebase } from '../config/firebase';
import colors from '../colors';
import Toast from 'react-native-toast-message';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminSetting({ navigation }) {

    const [moduleSettings, setModuleSettings] = useState({});
    const module_toggle = firebase.firestore().collection('module_toggle');

    useEffect(() => {
        module_toggle
            .doc('settings')
            .onSnapshot(querySnapshot => {
                setModuleSettings({ ...querySnapshot.data() });
            })
    }, [])

    function handleChange(eventName) {
        setModuleSettings(prev => {
            return {
                ...prev,
                [eventName]: !moduleSettings[eventName]
            }
        })
    }

    const ToggleSettings = ({ text, name, isEnabled }) => {
        return (
            <View style={styles.profileDetailContainer}>
                <Text style={styles.itemText}>{text}</Text>
                <Switch
                    value={isEnabled}
                    trackColor={{ false: '#767577', true: colors.blue600 }}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    onValueChange={() => handleChange(name)}
                />
            </View >
        );
    }

    const saveSettings = () => {
        module_toggle
            .doc('settings')
            .update(moduleSettings)
            .then(() => {
                console.log("Update Success")
                Toast.show({
                    type: 'success',
                    text1: 'Settings updated',
                });
            }).catch((err) => {
                console.log(err);
            })
    }

    return (
        <ScrollView>

            <View style={styles.container}>
                <Text style={styles.systemServicesText}>System Services</Text>
                <ToggleSettings text={"Outlet Management Module"} isEnabled={moduleSettings.multipleOutlets} name={"multipleOutlets"} />
                <ToggleSettings text={"Customer Relations Module"} isEnabled={moduleSettings.customerRelations} name={"customerRelations"} />
                <ToggleSettings text={"Vehicle"} isEnabled={moduleSettings.vehicle} name={"vehicle"} />
                <ToggleSettings text={"Staff Rostering Module"} isEnabled={moduleSettings.staffRostering} name={"staffRostering"} />
                <ToggleSettings text={"Analytics Module"} isEnabled={moduleSettings.analytics} name={"analytics"} />

                <TouchableOpacity
                    onPress={() => saveSettings()}
                    style={styles.saveBtn}>
                    <Text style={styles.contentText}>Save Settings</Text>
                </TouchableOpacity>
            </View>

            <View>
                {/* <Text style={styles.settingsText}>Settings</Text> */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Logging')}
                    style={styles.contentBtn}>
                    <Text style={styles.contentText2}>Activity Log</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    profileDetailContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        marginVertical: 20,
        marginLeft: 30,
        paddingRight: 30,
        borderBottomColor: colors.shadowGray,
        borderBottomWidth: 0.5,
    },
    itemText: {
        fontSize: 20,
        fontWeight: '500',
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 25,
        alignSelf: 'center',
        width: '95%',
        paddingVertical: 20,
        marginTop: '4%',
        // marginBottom: 300,
        // marginVertical: "50%"
    },
    contentBtn: {
        borderRadius: 10,
        backgroundColor: colors.blue600,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: 'center',
        width: "75%",
        height: 60,
        marginVertical: 20,
        shadowColor: colors.shadowGray,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    saveBtn: {
        borderRadius: 10,
        backgroundColor: colors.blue600,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: 'center',
        width: "40%",
        height: 40,
        marginVertical: 20,
        shadowColor: "colors.shadowGray",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.80,
        shadowRadius: 4,
        elevation: 5,
    },
    contentText: {
        fontSize: 20,
        fontWeight: "600",
        padding: 10,
        color: colors.white,
    },
    contentText2: {
        fontSize: 24,
        fontWeight: "700",
        padding: 10,
        color: colors.white,
    },
    systemServicesText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: "bold",
        color: colors.blue700,
        padding: 10,
    },
})
