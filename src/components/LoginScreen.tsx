import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'
interface Props {
  navigation: NavigationProp<ParamListBase>;
}
const LoginScreen = ({ navigation }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });
  interface LoginFormValues {
    email: string;
    password: string;
  }
  
  const handleLogin = async (values: LoginFormValues) => {
    try {
      setIsLoading(true); // Start loading
      if (!values.email || !values.password) {
        Alert.alert('Email and password are required');
      }
      const res = await firebase.auth().signInWithEmailAndPassword(values.email, values.password);
      const uid = res.user.uid;
      const usersRef = firebase.firestore().collection('users');
      const firestoreDocument = await usersRef.doc(uid).get();
      if (!firestoreDocument.exists) {
       Alert.alert(`User doesn't exist`)
      } else {
        const user = firestoreDocument.data();
        console.log('User data:', { user });
        if (res.user.emailVerified) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
          navigation.navigate('Home', { user });
        } else {
          Alert.alert('Please verify your registered email:)');
          await auth().currentUser?.sendEmailVerification();
          await auth().signOut()
        }
        await AsyncStorage.setItem('isLoggedIn', "true");
        console.log('setItem login screen', await AsyncStorage.getItem('isLoggedIn'));
      }

    } catch (error:any) {
      console.error(error);
      Alert.alert('Error:', error.message)
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');

      } else if (error.code === 'auth/invalid-email') {
        console.log('That email address is invalid!');

      } else if (error.code === 'auth/user-not-found') {
        console.log('No user found with this email.');

      } else if (error.code === 'auth/wrong-password') {
      }

    } finally {
      setIsLoading(false);
    }
  };
 
  const resetPasswordHandle = async (values:any) => {
    if (typeof values.email !== 'string' || !values.email.trim()) {
      console.log('email',values.email)
      Alert.alert('Enter your email.');
      return;
    }
  
    try {
      await auth().sendPasswordResetEmail(values.email);
      Alert.alert('Password reset email sent');
    } catch (error) {
      Alert.alert('Password reset email could not be sent. Please check your email and try again.');
    }
  };
  
  
  
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/login.png')} style={{ width: 200, height: 200 }} />
      {isLoading ? ( 
        <ActivityIndicator size="large" color="#788eec" />
      ) : (

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={(values) => handleLogin(values)}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <ScrollView
              style={{ flex: 1, width: '100%' }}
              keyboardShouldPersistTaps="always">
              <TextInput
                style={[styles.input, errors.email && touched.email ? styles.inputError : null]}
                placeholder='E-mail'
                placeholderTextColor={"grey"}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
              />
              {errors.email && touched.email && <Text style={{ color: 'red', marginLeft: 30 }}>{errors.email || emailError}</Text>}

              <TextInput
                style={[styles.input, errors.password && touched.password ? styles.inputError : null]}
                placeholderTextColor={"grey"}
                secureTextEntry
                placeholder='Password'
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
              />
              {errors.password && touched.password && <Text style={{ color: 'red', marginLeft: 30 }}>{errors.password || passwordError}</Text>}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={isLoading}>
                <Text style={styles.buttonTitle}>Log in</Text>
              </TouchableOpacity>

              <View style={styles.footerView}>
                <Text style={styles.footerText}>Don't have an account? <Text onPress={() => navigation.goBack()} style={styles.footerLink}>Sign up</Text></Text>
              </View>

              <TouchableOpacity onPress={() => resetPasswordHandle(values)}>
                <Text style={{ alignSelf: 'center', marginTop: 10, color: '#788eec' }}>Forgot password?</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Formik>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputError: {
    borderColor: 'red',
  },

  input: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 16,
    color:'black'
  },
  button: {
    backgroundColor: '#788eec',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: 'center'
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold"
  },
  footerView: {
    flex: 1,
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#2e2e2d'
  },
  footerLink: {
    color: "#788eec",
    fontWeight: "bold",
    fontSize: 16
  }
});

export default LoginScreen