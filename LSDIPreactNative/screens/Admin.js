import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import OutletList from './OutletList';
import OutletDetail from './OutletDetail';

export default function Admin() {

    const Stack = createStackNavigator();

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="OutletList">
            <Stack.Screen name='OutletList' component={OutletList} />
            <Stack.Screen name='OutletDetail' component={OutletDetail} />
        </Stack.Navigator>
    )
}