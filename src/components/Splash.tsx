import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import SplashScreen from 'react-native-bootsplash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const Splash = ({ navigation }: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const init = async () => {
      const userLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(userLoggedIn === 'true');
        setLoading(false);
        if (isLoggedIn) {
          navigation.navigate('Home');
        } else {
          navigation.navigate('SignUpScreen');
        } 
      
    };

    init().finally(() => {
      SplashScreen.hide(); 
    });
  }, [navigation, isLoggedIn]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Once loading is complete, return null to avoid rendering anything
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Splash;
