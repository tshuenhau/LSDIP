import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StaffAvailability from "./StaffAvailability";
import StaffSchedule from "./StaffSchedule";

export default function StaffRostering() {

    const BtmTabs = createBottomTabNavigator();

    return (
        <BtmTabs.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="OutletList">
            <BtmTabs.Screen name='Availability' component={StaffAvailability} />
            <BtmTabs.Screen name='Scheduled' component={StaffSchedule} />
        </BtmTabs.Navigator>
    )
}