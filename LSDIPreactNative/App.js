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
import Chat from './screens/Chat';
import Home from './screens/Home';
import Admin from './screens/Admin';
import AdminTimeslots from './screens/AdminTimeslots';
import Staff from './screens/Staff';
import Driver from './screens/Driver';
import MyProfile from './screens/MyProfile';
import Delivery from './screens/Delivery';
import ForgotPassword from './screens/ForgotPassword';
import { firebase } from "./config/firebase";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

const handleSignOut = () => {
  auth.signOut()
    .then(() => {
      navigation.navigate('Login')
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
  
  const drawerContent = (props) => {
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

  if (user1?.role === "Admin") {
    return (
      <NavigationContainer>
        <Drawer.Navigator drawerContent={drawerContent}>
          <Drawer.Screen name='Home' component={Home} />
          <Drawer.Screen name='My Profile' component={MyProfile} />
          <Drawer.Screen name='Staff' component={Staff} />
          <Drawer.Screen name='Admin' component={Admin} />
          <Drawer.Screen name='AdminTimeslots' component={AdminTimeslots} />
          <Drawer.Screen name='Delivery' component={Delivery} />
          <Drawer.Screen name='Driver' component={Driver} />
          <Drawer.Screen name='Chat' component={Chat} />
        </Drawer.Navigator>
      </NavigationContainer >
    );
  } else if (user1?.role === "Staff") {
    return (
      <NavigationContainer>
        <Drawer.Navigator drawerContent={drawerContent}>
          <Drawer.Screen name='Home' component={Home} />
          <Drawer.Screen name='Staff' component={Staff} />
          <Drawer.Screen name='Chat' component={Chat} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  } else if (user1?.role === "Driver") {
    return (
      <NavigationContainer>
        <Drawer.Navigator drawerContent={drawerContent}>
          <Drawer.Screen name='Home' component={Home} />
          <Drawer.Screen name='Driver' component={Driver} />
          <Drawer.Screen name='Chat' component={Chat} />
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
