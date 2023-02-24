import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import AdminRosterOutlet from './AdminRosterOutlet';
import AdminOutletScheduling from './AdminOutletScheduling';

const Stack = createStackNavigator();

export default function AdminRostering() {
    return (
        <Stack.Navigator
            screenOptions={
                { headerShown: false }
            }
        >
            <Stack.Screen name="Roster Outlet" component={AdminRosterOutlet} />
            <Stack.Screen name="Outlet Scheduling" component={AdminOutletScheduling} />
        </Stack.Navigator>
    )
}