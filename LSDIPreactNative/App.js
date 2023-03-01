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
          <Drawer.Screen name='Home' component={Home} />
          <Drawer.Screen name='My Profile' component={MyProfile} />
          <Drawer.Screen name='Account Management' component={Account} />
          <Drawer.Screen name='Outlet Management' component={OutletManagement} />
          <Drawer.Screen name='Admin Rostering' component={AdminRostering} />
          <Drawer.Screen name='Admin Timeslots' component={AdminTimeslots} />
          <Drawer.Screen name='Delivery' component={Delivery} />
          <Drawer.Screen name='Driver' component={Driver} />
          <Drawer.Screen name='Vehicle' component={VehicleModule} />
          {/* <Drawer.Screen name='Chat' component={Chat} /> */}
          <Drawer.Screen name='Create Order' component={CreateOrder} />
          <Drawer.Screen name='Laundry Item' component={LaundryItems} />
          <Drawer.Screen name='Service' component={Service} />
          <Drawer.Screen name='Payment' component={Payment} />
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
            <Drawer.Screen name='Home' component={Home} />
            <Drawer.Screen name='Create Order' component={CreateOrder} />
            <Drawer.Screen name='Staff Rostering' component={StaffRostering} />
            <Drawer.Screen name='Vehicle' component={VehicleModule} />
            <Drawer.Screen name='Admin Timeslots' component={AdminTimeslots} />
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
            <Drawer.Screen name='Home' component={Home} />
            <Drawer.Screen name='Driver' component={Driver} />
            <Drawer.Screen name='Vehicle' component={VehicleModule} />
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
          <Drawer.Group>
            <Drawer.Screen name='Home' component={Home} />
            <Drawer.Screen name='Delivery' component={Delivery} />
            {/* <Drawer.Screen name='Chat' component={Chat} /> */}
          </Drawer.Group>
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