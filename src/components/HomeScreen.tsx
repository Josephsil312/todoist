import { Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

const HomeScreen = ({ route }:any) => {

  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const isFocused = useIsFocused();

  const handlePress = async () => {
    AsyncStorage.setItem('isLoggedIn', "false")
    await AsyncStorage.removeItem('user');
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
    navigation.navigate('SignUpScreen')
  }
  useEffect(() => {
    const fetchUserData = async () => {
      if (route?.params?.user) {
        setUser(route.params.user);
        await AsyncStorage.setItem('user', JSON.stringify(route.params.user));
      } else {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };
    fetchUserData();
  }, [route]);

  useEffect(() => {
    if (isFocused) {
      const backAction = () => {
        Alert.alert('Hold on!', 'Are you sure you want to exit?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }
  }, [isFocused]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available.</Text>
      </View>
    );
  }

  return (
    <>
    <View style={styles.container}>
      <Text style = {{color:'#001d76',fontSize:25}}>Welcome, {user.fullName}!</Text>
      <Pressable onPress={() => navigation.navigate('Tasks')}>
        <Text style={styles.buttonText}>Tasks</Text>
      </Pressable>
    </View>
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={styles.button} onPress={handlePress} >
          <Text style={styles.buttonTitle}>Logout</Text>
        </Pressable>
      </View>
    </>
    
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    
  },
  buttonText: {
    color: '#001d76',
    fontSize: 18,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#788eec',
    height: 48,
    alignItems: "center",
    justifyContent: 'center',
    width: '100%'
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold"
  },
});
