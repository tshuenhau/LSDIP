import 'react-native-gesture-handler';
import { Navigation } from 'react-native-navigation';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Home from './screens/Home';
import OutletManagement from './screens/OutletManagement';
import AdminRostering from './screens/AdminRostering';
import AdminTimeslots from './screens/AdminTimeslots';
import StaffRostering from './screens/StaffRostering';
import Driver from './screens/Driver';
import MyProfile from './screens/MyProfile';
import Delivery from './screens/Delivery';
import ForgotPassword from './screens/ForgotPassword';
import { firebase } from "./config/firebase";
import Icon from 'react-native-vector-icons/FontAwesome';


// Register all the screens
Navigation.registerComponent('Login', () => Login);
Navigation.registerComponent('Signup', () => Signup);
Navigation.registerComponent('Home', () => Home);
Navigation.registerComponent('Admin', () => Admin);
Navigation.registerComponent('AdminTimeslots', () => AdminTimeslots);
Navigation.registerComponent('StaffRostering', () => StaffRostering);
Navigation.registerComponent('Driver', () => Driver);
Navigation.registerComponent('MyProfile', () => MyProfile);
Navigation.registerComponent('Delivery', () => Delivery);
Navigation.registerComponent('ForgotPassword', () => ForgotPassword);
let isEnabled = true;
const Stack = createStackNavigator();
const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

// Define the side menu component
const SideMenu = ({ navigation, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  console.log(isEnabled);
  const handleSignOut = () => {
    isEnabled = false;
    auth.signOut()
      .then(() => {
        navigation.navigate('Login');
      })
      .catch(error => alert(error.message))
  }

  if (!isEnabled) {
    // Return null if user is not defined
    return null;
  }

  const CollapsibleButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.collapsibleButton} onPress={onPress}>
        <Icon name="bars" size={24} color="black" />
      </TouchableOpacity>
    );
  };
  

  const handleCollapsibleButtonPress = () => {
    setIsCollapsed(!isCollapsed);
  };
  
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
  const [user1, setUser1] = useState(null);
  const navigationRef = React.useRef(null);

  useEffect(() => {
    const unsubscribeAuth = auth1().onAuthStateChanged(
      async authenticatedUser => {
        if (authenticatedUser) {
          firestore()
            .collection('users')
            .doc(auth1().currentUser.uid)
            .get()
            .then(user => {
              setUser1(user.data());
              const userRole = user.data().role;
              setUser({ ...authenticatedUser, role: userRole });
            });
        } else {
          setUser(null);
          setUser1(null);
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
          <Drawer.Screen name='Outlet Management' component={OutletManagement} />
          <Drawer.Screen name='Admin Rostering' component={AdminRostering} />
          <Drawer.Screen name='Admin Timeslots' component={AdminTimeslots} />
          <Drawer.Screen name='Delivery' component={Delivery} />
          <Drawer.Screen name='Driver' component={Driver} />
          {/* <Drawer.Screen name='Chat' component={Chat} /> */}
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
            <Drawer.Screen name='Staff Rostering' component={StaffRostering} />
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
  } else {
    isEnabled = true;
    return (
      <AuthenticatedUserProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='Signup' component={Signup} />
            <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
            <Stack.Screen name='Home' component={Home} />
            <Stack.Screen name='Admin' component={Admin} />
            <Stack.Screen name='Driver' component={Driver} />
            <Stack.Screen name='MyProfile' component={MyProfile} />
            <Stack.Screen name='Delivery' component={Delivery} />
            <Stack.Screen name='StaffRostering' component={StaffRostering} />
            <Stack.Screen name='AdminTimeslots' component={AdminTimeslots} />
          </Stack.Navigator>
          <SideMenu navigation={navigationRef.current} user={user1}/>
        </NavigationContainer >
      </AuthenticatedUserProvider>
    );
  }
}



const styles = StyleSheet.create({
  sideMenuItem: {
    padding: 10,
    alignItems: 'center',
  },
  sideMenuItemText: {
    fontSize: 18,
  },
  collapsibleButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  collapsibleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}
