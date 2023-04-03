import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, Button, ScrollView, FlatList, LayoutAnimation, } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { firebase } from "../config/firebase";
import { auth } from '../config/firebase';
import OrdersList from "../components/OrdersList";
import CustomerOrderList from "../components/CustomerOrderList";
import CustomerAvailableOrderList from "../components/CustomerAvailableOrderList";
import colors from '../colors';
import CustomerHome from "./CustomerHome";

export default function Home({ navigation }) {

  const auth1 = firebase.auth;
  const [currentDate, setCurrentDate] = useState(new Date());

  const locale = 'en';
  const day = currentDate.toLocaleDateString(locale, { weekday: 'long' });
  const date = `${day}, ${currentDate.getDate()} ${currentDate.toLocaleDateString(locale, { month: 'long' })} `;

  const hour = currentDate.getHours();
  const wish = `Good ${(hour < 12 && 'Morning') || (hour < 17 && 'Afternoon') || 'Evening'}, `;

  const time = currentDate.toLocaleTimeString(locale, { hour: 'numeric', hour12: true, minute: 'numeric' });

  const [user, setUser] = useState(null) // This user
  const users = firebase.firestore().collection('users');

  useEffect(() => {
    users.doc(auth1().currentUser.uid)
      .get()
      .then(user => {
        setUser(user.data())
        console.log(user)
      })
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Image
          source={require('../assets/washin.jpg')}
          style={{
            width: 40,
            height: 40,
            marginRight: 15,
          }}
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const timer = setInterval(() => { // Creates an interval which will update the current data every minute
      // This will trigger a rerender every component that uses the useDate hook.
      setCurrentDate(new Date());
    }, 60 * 1000);
    return () => {
      clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {user?.role === "Staff" ?
          <View>
            <Text style={styles.welcomeMessage}>{wish}{user?.role} {user?.name}</Text>
            <View style={{ paddingLeft: 5, marginLeft: 10 }}>
              {/*<Text>Email: {auth.currentUser?.email}</Text>*/}
              <Text>{date + time}</Text>
            </View>
            <OrdersList navigation={navigation} />
          </View>
          : null
        }
        {user?.role === "Admin" ?
          <View>
            <Text style={styles.welcomeMessage}>{wish}{user?.role} {user?.name}</Text>
            <View style={{ paddingLeft: 5, marginLeft: 10 }}>
              {/*<Text>Email: {auth.currentUser?.email}</Text>*/}
              <Text>{date + time}</Text>
            </View>
            <OrdersList navigation={navigation} />

          </View>
          : null
        }
        {user?.role === "Customer" ?
          <View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.welcomeMessage}>{wish}{user.name}</Text>
              <Text>{date + time}</Text>
            </View>
            <CustomerHome user={user} navigation={navigation} />
          </View>
          : null
        }
        {user?.role === "Driver" ?
          <View>
            <Text style={styles.welcomeMessage}>{wish}{user?.role} {user?.name}</Text>
            <View style={{ paddingLeft: 5, marginLeft: 10 }}>
              {/*<Text>Email: {auth.currentUser?.email}</Text>*/}
              <Text>{date + time}</Text>
            </View>
            <Text>Hi im Driver</Text>
          </View>
          : null
        }

        {/* <View style={styles.chatContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Chat")}
                    style={styles.chatButton}
                >
                    <Entypo name="chat" size={24} color={colors.lightGray} />
                </TouchableOpacity>
            </View> */}

      </ScrollView>
    </View>

  )
};

const styles = StyleSheet.create({
  welcomeMessage: {
    fontSize: 30,
    fontWeight: "800",
    padding: 5,
    marginLeft: 10
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  ordersListContainer: {
    flex: 1,
    padding: 10,
  },
  chatButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  chatButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: .9,
    shadowRadius: 8,
  },
  button: {
    marginTop: "20"
  },
  createOrderContainer: {
    alignSelf: "center",
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: colors.gray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardBody: {
    backgroundColor: colors.lightGray,
    padding: 16,
  },
  listtext: {
    paddingLeft: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "black"
  },
  selectedTimesContent: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingVertical: 10,
  },
  selectedTimesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedTimeCard: {
    width: "97%",
    alignItems: 'left',
    backgroundColor: colors.white,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginLeft: 15
  },
  selectedTimeText: {
    flex: 1,
    fontSize: 16,
  },
  selectedTimesContainer: {
    marginTop: 20,
    marginBottom: 20,
    height: 300,
  },
  selectedTimesList: {
    flex: 1,
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 10
  },
  removeButtonText: {
    color: 'red',
    fontSize: 15
  },
  NavButton: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 5,
    margin: 2,
    alignSelf: 'center',
  },
  NavButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
  },
  cardText: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 15,
    marginLeft: 10
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 4,
    marginLeft: 10
  },
  noOrdersText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10
  },
  orderText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10
  }
});