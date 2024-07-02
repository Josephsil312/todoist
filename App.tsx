/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import Splash from './src/components/Splash';
import HomeScreen from './src/components/HomeScreen';
import SignupScreen from './src/components/SignUpScreen';
import Tasks from './src/components/Tasks';
import LoginScreen from './src/components/LoginScreen';
import TasksContextProvider from './src/components/TasksContextProvider';
import LeftChevron from 'react-native-vector-icons/AntDesign';

const Stack = createNativeStackNavigator();
function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkLoginState = async () => {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    };

    checkLoginState();
  }, []);

  return (
    <TasksContextProvider>
    <NavigationContainer>
       <Stack.Navigator initialRouteName={"Splash"}>
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{ title: 'Home', headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: 'Home',
          headerTitleStyle: {
            fontWeight: '200',
            fontSize: 25
          },
          headerStyle: {
            backgroundColor: '#001d76',
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
            >
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignupScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Stack.Screen
        name="Tasks"
        component={Tasks}
        options={({ navigation }) => ({
          headerTitle: 'Tasks',
          headerTitleStyle: {
            fontWeight: '200',
            fontSize: 25
          },
          headerStyle: {
            backgroundColor: '#001d76',
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
            >
              <LeftChevron name="left" size={22} color="grey" style={{ color: 'white', marginRight: 20 }} /> 
            </Pressable>
          ),
        })}
      />
      </Stack.Navigator>
    </NavigationContainer>
    </TasksContextProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
