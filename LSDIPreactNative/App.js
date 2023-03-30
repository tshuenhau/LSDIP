import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './screens/Login';
import Signup from './screens/Signup';
// import Chat from './screens/Chat';
import Home from './screens/Home';
import OutletManagement from './screens/OutletManagement';
import AdminRostering from './screens/AdminRostering';
import AdminTimeslots from './screens/AdminTimeslots';
import StaffRostering from './screens/StaffRostering';
import Driver from './screens/Driver';
import MyProfile from './screens/MyProfile';
import Delivery from './screens/Delivery';
import CreateOrder from './screens/CreateOrder';
import Payment from './screens/Payment';
import CRM from './screens/CRM';
import CustomerRewards from './screens/CustomerRewards';
import OrderDetail from './screens/OrderDetail';
import ForgotPassword from './screens/ForgotPassword';
import VehicleModule from './screens/VehicleModule';
import LaundryItems from './screens/LaundryItem';
import Service from './screens/Services'
import { firebase } from "./config/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Invoice from './screens/Invoice';
import Account from './screens/AccountManagement'
import OrderSummary from './screens/OrderSummary';
import Pickup from './screens/Pickup';
import CustomerInvoice from './screens/CustomerInvoice';
import CustomerViewOrderHistory from './screens/CustomerViewOrderHistory';
import colors from './colors';
import { Entypo, AntDesign, Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5, SimpleLineIcons } from '@expo/vector-icons';
import CustomerProfile from './screens/CustomerProfile';
import DeliveryTemp from './screens/DeliveryTemp';
import Paypal from './components/Paypal';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
      <Toast />
    </AuthenticatedUserContext.Provider>
  );
};

const setUserId = async (id) => {
  try {
    await AsyncStorage.setItem('userId', id.toString());
  } catch (e) {
    console.log(e);
  }
};

const setUserRole = async (role) => {
  try {
    await AsyncStorage.setItem('userRole', role.toString());
  } catch (e) {
    console.log(e);
  }
};

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  const auth1 = firebase.auth;
  const firestore = firebase.firestore;
  const [user1, setUser1] = useState(null)
  useEffect(() => {
    const unsubscribeAuth = auth1().onAuthStateChanged(
      async authenticatedUser => {
        if (authenticatedUser) {
          firestore().collection("users").doc(auth1().currentUser.uid).get()
            .then(user => {
              setUser1(user.data());
              console.log(user);
              console.log(user1?.role);
              const userRole = user?.role;
              setUserId(auth1().currentUser.uid);
              setUserRole(user?.role);
              setUser({ ...authenticatedUser, role: userRole });
            })

        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return unsubscribeAuth;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        setUser1({ ...user1, role: "" });
        // navigation.navigate('Login')
      })
      .catch(error => alert(error.message))
  }

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Sign Out"
          onPress={handleSignOut}
        />
        <DrawerItem
          label="Close Drawer"
          onPress={() => props.navigation.closeDrawer()}
        />
      </DrawerContentScrollView>
    );
  }

  //console.log(user?.metadata?.customClaims);
  if (user1?.role === "Admin") {
    return (
      <NavigationContainer>
        <Drawer.Navigator
          useLegacyImplementation
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen name='Home' component={Home}
            options={{
              drawerIcon: ({ focused }) => (
                <Entypo name="home" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='My Profile' component={MyProfile}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="account-circle" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Create Order' component={CreateOrder}
            options={{
              drawerIcon: ({ focused }) => (
                <Ionicons name="create" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Laundry Item' component={LaundryItems}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="local-laundry-service" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Account Management' component={Account}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="person-search" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Outlet Management' component={OutletManagement}
            options={{
              drawerIcon: ({ focused }) => (
                <Entypo name="shop" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Admin Rostering' component={AdminRostering}
            options={{
              drawerIcon: ({ focused }) => (
                <Ionicons name="people" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Admin Timeslots' component={AdminTimeslots}
            options={{
              drawerIcon: ({ focused }) => (
                <Entypo name="calendar" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Delivery' component={Delivery} initialParams={{ curuser: null }}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialCommunityIcons name="truck-delivery" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Driver' component={Driver}
            options={{
              drawerIcon: ({ focused }) => (
                <AntDesign name="user" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Vehicle' component={VehicleModule}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="emoji-transportation" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Reward System' component={CRM}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialCommunityIcons name="wallet-giftcard" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Customer Rewards' component={CustomerRewards}
            options={{
              drawerIcon: ({ focused }) => (
                <SimpleLineIcons name="present" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          {/* <Drawer.Screen name='Chat' component={Chat} /> */}
          <Drawer.Screen name='Service' component={Service}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="miscellaneous-services" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Payment' component={Payment}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="payment" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />

          {/* hidden screens */}
          {/* <Drawer.Screen name='Create Admin' component={CreateAdmin}
            options={{
              drawerItemStyle: { display: "none" }
            }} /> */}
          <Drawer.Screen name='Order Page' component={OrderDetail}
            options={{
              drawerItemStyle: { display: "none" }
            }}
          />
          <Drawer.Screen name='Invoice' component={Invoice}
            options={{
              drawerItemStyle: { display: "none" }
            }}
          />
          <Drawer.Screen name='Order Summary' component={OrderSummary}
            options={{
              drawerItemStyle: { display: "none" }
            }}
          />
          <Drawer.Screen name='Customer Invoice' component={CustomerInvoice}
            options={{
              drawerItemStyle: { display: "none" }
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer >
    );
  } else if (user1?.role === "Staff") {
    return (
      <NavigationContainer>
        <Drawer.Navigator
          useLegacyImplementation
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Group>
            <Drawer.Screen name='Home' component={Home}
              options={{
                drawerIcon: ({ focused }) => (
                  <Entypo name="home" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='My Profile' component={MyProfile}
              options={{
                drawerIcon: ({ focused }) => (
                  <MaterialIcons name="account-circle" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='Create Order' component={CreateOrder}
              options={{
                drawerIcon: ({ focused }) => (
                  <Ionicons name="create" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='Staff Rostering' component={StaffRostering}
              options={{
                drawerIcon: ({ focused }) => (
                  <Ionicons name="people" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='Vehicle' component={VehicleModule}
              options={{
                drawerIcon: ({ focused }) => (
                  <MaterialIcons name="emoji-transportation" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='Admin Timeslots' component={AdminTimeslots}
              options={{
                drawerIcon: ({ focused }) => (
                  <Entypo name="calendar" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='Order Page' component={OrderDetail}
              options={{
                drawerItemStyle: { display: "none" }
              }}
            />
            <Drawer.Screen name='Invoice' component={Invoice}
              options={{
                drawerItemStyle: { display: "none" }
              }}
            />
            <Drawer.Screen name='Order Summary' component={OrderSummary}
              options={{
                drawerItemStyle: { display: "none" }
              }}
            />
            <Drawer.Screen name='Customer Invoice' component={CustomerInvoice}
              options={{
                drawerItemStyle: { display: "none" }
              }}
            />
            {/* <Drawer.Screen name='Chat' component={Chat} /> */}
          </Drawer.Group>
        </Drawer.Navigator>
      </NavigationContainer>
    );
  } else if (user1?.role === "Driver") {
    return (
      <NavigationContainer>
        <Drawer.Navigator
          useLegacyImplementation
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Group>
            <Drawer.Screen name='Home' component={Home}
              options={{
                drawerIcon: ({ focused }) => (
                  <Entypo name="home" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='Driver' component={Driver}
              options={{
                drawerIcon: ({ focused }) => (
                  <AntDesign name="user" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            <Drawer.Screen name='Vehicle' component={VehicleModule}
              options={{
                drawerIcon: ({ focused }) => (
                  <MaterialIcons name="emoji-transportation" size={24} color={focused ? colors.lightBlue : colors.gray} />
                ),
              }} />
            {/* <Drawer.Screen name='Chat' component={Chat} /> */}
          </Drawer.Group>
        </Drawer.Navigator>
      </NavigationContainer>
    );
  } else if (user1?.role === "Customer") {
    return (
      <NavigationContainer>
        <Drawer.Navigator
          useLegacyImplementation
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          {/* <Drawer.Screen name='Delivery' component={DeliveryTemp} initialParams={{ curuser: user1 }}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialCommunityIcons name="truck-delivery" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} /> */}
          <Drawer.Screen name='Home' component={Home}
            options={{
              drawerIcon: ({ focused }) => (
                <Entypo name="home" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='My Profile' component={CustomerProfile}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="account-circle" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
            <Drawer.Screen name='Delivery' component={Delivery} initialParams={{ curuser: user1 }}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialCommunityIcons name="truck-delivery" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          <Drawer.Screen name='Pick up' component={Pickup} initialParams={{ curuser: null }}
            options={{
              drawerIcon: ({ focused }) => (
                <Entypo name="shopping-basket" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />

          {/* <Drawer.Screen name='Rewards' component={CustomerViewReward}
            options={{
              drawerIcon: ({ focused }) => (
                <SimpleLineIcons name="present" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
            <Drawer.Screen name='Membership' component={CustomerViewMembership}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="loyalty" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} /> */}
          <Drawer.Screen name='Order History' component={CustomerViewOrderHistory}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="list-alt" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} />
          {/* <Drawer.Screen name='Payment' component={Payment}
            options={{
              drawerIcon: ({ focused }) => (
                <MaterialIcons name="payment" size={24} color={focused ? colors.lightBlue : colors.gray} />
              ),
            }} /> */}
          {/* <Drawer.Screen name='Chat' component={Chat} /> */}
          <Drawer.Screen name='Payment' component={Paypal}
            options={{
              drawerItemStyle: { display: "none" }
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerShown: false,
        }}>
          <Stack.Screen name='Login' component={Login} />
          <Stack.Screen name='Signup' component={Signup} />
          <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
        </Stack.Navigator>
      </NavigationContainer >
    )
  }
}


export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}