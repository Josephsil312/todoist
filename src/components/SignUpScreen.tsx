import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, Button, Image, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import auth, { firebase } from '@react-native-firebase/auth';
import { NavigationProp, ParamListBase, useIsFocused } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup'
import { firebaseConfig } from '../../android/app/google-services.json'
interface Props {
  navigation: NavigationProp<ParamListBase>;
}
const SignUpScreen = ({ navigation }: Props) => {
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const PasswordSchema = Yup.object().shape({
    password: Yup.string().min(6, 'Password length should be minimum of 6 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    fullName: Yup.string().required('Full Name is required'),
  });

  const configurationFirebase = () => {
    try {
      firebase.initializeApp(firebaseConfig);
    } catch(err){
      console.log('Error in firebase configuration',err)
    }
  }
  
  useEffect(() => {
    configurationFirebase()
  },[])
  
  const onFooterLinkPress = () => {
    navigation.navigate('LoginScreen');
  }

  const handleSignUp = async (values:any) => {
    try {
      if (!values.email || !values.password) {
        setError('Email and password cannot be empty');
        return;
      }
      setLoading(true);
      const res = await auth().createUserWithEmailAndPassword(values.email, values.password);
      await res.user.sendEmailVerification();
      const uid = res.user.uid;
      const usersRef = firebase.firestore().collection('users');
      await usersRef.doc(uid).set({
        email: values.email,
        fullName: values.fullName,
      });
      Alert.alert(`A verification has been set to your registered email address.`);
      navigation.navigate('LoginScreen');
    } catch (error:any) {
      console.log(error);
      
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };
  
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }
  }, [isFocused]);
  
  return (

    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/regis.png')} style={{ width: 200, height: 200 }} />
      </View>
      {loading ? ( 
        <ActivityIndicator size="large" color="#788eec" />
      ) : (
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          keyboardShouldPersistTaps="always">
          <Formik
            initialValues={{ email: '', password: '', fullName: '', confirmPassword: '' }}
            validationSchema={PasswordSchema}
            onSubmit={(values) => handleSignUp(values)}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  value={values.fullName}
                  placeholderTextColor={"grey"}
                />
                {touched.fullName && errors.fullName &&
                  <Text style={{ color: 'red', marginLeft: 30 }}>{errors.fullName}</Text>
                }
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholderTextColor={"grey"}
                />
                {touched.email && errors.email &&
                  <Text style={{ color: 'red', marginLeft: 30 }}>{errors.email}</Text>
                }
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  placeholderTextColor={"grey"}
                />
                {touched.password && errors.password &&
                  <Text style={{ color: 'red', marginLeft: 30 }}>{errors.password}</Text>
                }
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  placeholderTextColor={"grey"}
                />
                {touched.confirmPassword && errors.confirmPassword &&
                  <Text style={{ color: 'red', marginLeft: 30 }}>{errors.confirmPassword}</Text>
                }
                <Pressable style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                  <Text style={styles.buttonTitle}>Sign Up</Text>
                </Pressable>
                {error !== '' &&
                  <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{error}</Text>
                }
              </View>
            )}
          </Formik>
          <View style={styles.footerView}>
            <Text style={styles.footerText}>Already have an account? <Text style={styles.footerLink} onPress={onFooterLinkPress}>Log in</Text></Text>
          </View>   
        </ScrollView>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  headerContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15,
  },
  headerText: {
    fontSize: 24,
    color: '#fff', 
    fontWeight: 'bold',
  },
  logo: {
    flex: 1,
    height: 120,
    width: 90,
    alignSelf: "center",
    margin: 30
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
    marginTop: 20
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

export default SignUpScreen
