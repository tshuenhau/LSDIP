import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  ScrollView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { FontAwesome, Entypo } from '@expo/vector-icons';
import alert from '../components/Alert'
import TextBox from "../components/TextBox";
import Btn from "../components/Button";
import colors from '../colors';
import { firebase } from "../config/firebase";
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import Toast from 'react-native-toast-message';

export default function OutletDetail({ route, navigation }) {

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [allocateModalVisible, setAllocateModalVisible] = useState(false);
  const [updateModalData, setUpdateModalData] = useState(route.params.item);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [allocatedStaffList, setAllocateStaffList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const outlets = firebase.firestore().collection('outlet');
  const users = firebase.firestore().collection('users');
  const outletStaff = firebase.firestore().collection('outlet_staff');

  useEffect(() => {
    users.where("role", "==", "Staff")
      .get()
      .then(querySnapshot => {
        const staffList = [];
        querySnapshot.forEach(doc => {
          staffList.push({
            key: doc.id,
            value: doc.data().name,
            number: doc.data().number
          });
        });
        setStaffList(staffList);
        outletStaff.where("outletID", "==", updateModalData.id)
          .get()
          .then(querySnapshot => {
            const allocatedStaffList = [];
            querySnapshot.forEach(doc => {
              allocatedStaffList.push({
                id: doc.id,
                staffID: doc.data().staffID,
                name: staffList.find(s => s.key === doc.data().staffID).value,
                number: staffList.find(s => s.key === doc.data().staffID).number
              })
            })
            setAllocateStaffList(allocatedStaffList);
          })
      });
  }, []);

  function handleChange(text, eventName) {
    setUpdateModalData(prev => {
      return {
        ...prev,
        [eventName]: text
      }
    })
  }

  const updateOutlet = () => {
    if (updateModalData.outletName &&
      updateModalData.outletAddress &&
      updateModalData.outletNumber &&
      updateModalData.outletEmail) {
      outlets.doc(updateModalData.id)
        .update({
          outletName: updateModalData.outletName,
          outletAddress: updateModalData.outletAddress,
          outletNumber: updateModalData.outletNumber,
          outletEmail: updateModalData.outletEmail
        }).then(() => {
          console.log("Update Success")
          Toast.show({
            type: 'success',
            text1: 'Outlet Updated',
          });
          setErrorMessage("");
          setUpdateModalVisible(!updateModalVisible);
        }).catch((err) => {
          console.log(err)
        })
    } else {
      setErrorMessage("Please fill up all fields");
    }
  }

  const allocateStaff = () => {
    let allocateArr = [];
    for (let i = 0; i < selectedStaff.length; i++) {
      allocateArr.push({ outletID: updateModalData.id, staffID: selectedStaff[i] });
    }
    if (allocateArr.length > 0) {
      console.log(allocateArr);
      const batch = firebase.firestore().batch();
      allocateArr.forEach((doc) => {
        const newDocRef = outletStaff.doc();
        batch.set(newDocRef, doc);
      })
      batch.commit()
        .then(() => {
          console.log("Allocated Staff");
          setAllocateModalVisible(!allocateModalVisible);
          outletStaff.where("outletID", "==", updateModalData.id)
            .get()
            .then(querySnapshot => {
              const allocatedStaffList = [];
              querySnapshot.forEach(doc => {
                allocatedStaffList.push({
                  id: doc.id,
                  staffID: doc.data().staffID,
                  name: staffList.find(s => s.key === doc.data().staffID).value,
                  number: staffList.find(s => s.key === doc.data().staffID).number
                })
              })
              Toast.show({
                type: 'success',
                text1: 'Staff Allocated',
              });
              setErrorMessage("");
              setAllocateStaffList(allocatedStaffList);
            })
        }).catch((err) => {
          console.log(err);
        })
    } else {
      setErrorMessage("Select a staff");
    }
  }

  const showConfirmDiaglog = (item) => {
    return alert("Confirmation", "Are you sure you want to remove staff from this outlet?",
      [
        {
          text: "Yes",
          onPress: () => {
            outletStaff.doc(item.id)
              .delete()
              .then(() => {
                console.log("Deallocated")
                const temp = allocatedStaffList.filter(x => x.id != item.id)
                Toast.show({
                  type: 'success',
                  text1: 'Removed',
                });
                setAllocateStaffList(temp);
              }).catch((err) => {
                console.log(err)
              })
          }
        },
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancelled");
          }
        }
      ])
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.outletName}>{item.name} </Text>
      </View>
      <View style={styles.itemContainer}>
        <View style={styles.cardBody}>
          <Text style={styles.itemText}>Number: {item.number} </Text>
        </View>
        <View style={styles.cardButtons}>
          <FontAwesome
            style={styles.staffIcon}
            color="red"
            name="remove"
            onPress={() => showConfirmDiaglog(item)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const OutletDetail = ({ label, text }) => {
    return (
      <View style={styles.outletDetailContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemText}>{text}</Text>
      </View >
    );
  }

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView>
        <View style={styles.topButtons}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.btn}>
            <Text style={styles.text}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
          <View style={styles.outletSettings}>
            <Image source={require('../assets/outlet.png')} style={{ width: 250, height: 250 }} />
            <Text style={styles.outletName}>Name: {updateModalData.outletName} </Text>
          </View>
          <View style={styles.outletDetails}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: "bold", fontSize: 24 }}>Outlet Profile</Text>
              <TouchableOpacity
                onPress={() => setUpdateModalVisible(!updateModalVisible)}
                style={styles.editBtn}
              >
                <Entypo name="edit" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <OutletDetail label={"Info"} text={updateModalData.outletName} />
            <OutletDetail label={"UniqueID"} text={updateModalData.id} />
            <OutletDetail label={"Address"} text={updateModalData.outletAddress} />
            <View style={{ flex: 1, flexDirection: 'row', }}>
              <OutletDetail label={"Number"} text={updateModalData.outletNumber} />
              <OutletDetail label={"Email"} text={updateModalData.outletEmail} />
            </View>
          </View>
        </View>

        <View style={styles.btmButtons}>
          <TouchableOpacity
            onPress={() => setAllocateModalVisible(!allocateModalVisible)}
            style={styles.btn}>
            <Text style={styles.text}>Allocate Staff</Text>
          </TouchableOpacity>
        </View>

        <View>
          <FlatList
            data={allocatedStaffList}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.noStaffText}>No staff allocated</Text>
            }
          />
        </View>

        {/* Update Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={updateModalVisible}>
          <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.view}>
                  <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Update Outlet</Text>
                  <TextBox placeholder="Outlet Name" onChangeText={text => handleChange(text, "outletName")} defaultValue={updateModalData.outletName} />
                  <TextBox placeholder="Outlet Address" onChangeText={text => handleChange(text, "outletAddress")} defaultValue={updateModalData.outletAddress} />
                  <TextBox placeholder="Outlet Number" onChangeText={text => handleChange(text, "outletNumber")} defaultValue={updateModalData.outletNumber} />
                  <TextBox placeholder="Outlet Email" onChangeText={text => handleChange(text, "outletEmail")} defaultValue={updateModalData.outletEmail} />
                  {errorMessage &&
                    <View style={styles.errorMessageContainer}>
                      <Text style={styles.errorMessage}>{errorMessage}</Text>
                    </View>
                  }
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                    <Btn onClick={() => updateOutlet()} title="Update" style={{ width: "48%" }} />
                    <Btn onClick={() => setUpdateModalVisible(!updateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Allocate Staff Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={allocateModalVisible}>
          <View style={{ flex: 1, backgroundColor: colors.modalBackground }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.view}>
                  <Text style={{ fontSize: 34, fontWeight: "800", marginBottom: 20 }}>Allocate Staff</Text>
                  <View style={{
                    width: "92%",
                    borderRadius: 25,
                    marginTop: 20
                  }}>
                    <MultipleSelectList
                      setSelected={(val) => setSelectedStaff(val)}
                      data={staffList}
                      save="key"
                      label='Staff'
                    />
                  </View>
                  {errorMessage &&
                    <View style={styles.errorMessageContainer}>
                      <Text style={styles.errorMessage}>{errorMessage}</Text>
                    </View>
                  }
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "92%" }}>
                    <Btn onClick={() => allocateStaff()} title="Allocate" style={{ width: "48%" }} />
                    <Btn onClick={() => setAllocateModalVisible(!allocateModalVisible)} title="Dismiss" style={{ width: "48%", backgroundColor: "#344869" }} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View >
  )
}

const styles = StyleSheet.create({
  errorMessageContainer: {
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  errorMessage: {
    color: colors.red,
    fontStyle: 'italic',
    fontSize: 16,
  },
  outletSettings: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    marginLeft: 40,
    marginRight: 40,
    borderRadius: 25,
  },
  outletDetails: {
    flex: 2,
    padding: 25,
    backgroundColor: colors.white,
    marginRight: 40,
    borderRadius: 25,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "flex-start",
  },
  outletDetailContainer: {
    flex: 1,
    marginVertical: 20,
    borderBottomColor: colors.shadowGray,
    borderBottomWidth: 1,
  },
  itemLabel: {
    color: colors.shadowGray,
    fontWeight: "400",
    fontSize: 16,
  },
  itemText: {
    fontSize: 20,
    fontWeight: '500',
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: 'space-between',
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
  outletName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  staffIcon: {
    fontSize: 25,
    margin: 10,
  },
  topButtons: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
  },
  btmButtons: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
  },
  noStaffText: {
    fontSize: 20,
    fontWeight: "600",
  },
  view: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  btn: {
    padding: 10,
    margin: 10,
    marginHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#0B3270",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    width: '50%',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }
})