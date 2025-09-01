import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
  View,
} from 'react-native';
import { useState } from 'react';

function LoginScreen ({ navigation }){

  const [email, onEmailTextChanged] = useState('');
  const [password, onPasswordTextChanged] = useState('');
  const [loginBtnState, setLoginBtnPress] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headingText}>Welcome to Little Lemon</Text>
      <Text style={styles.regularText}>
        {loginBtnState ? 'You are logged in!' : 'Login to continue'}
      </Text>
      {!loginBtnState && (
        <>
          <TextInput
            style={styles.textInput}
            value={email}
            placeholder={'email'}
            onChangeText={onEmailTextChanged}
            keyboardType={'email-address'}
            // onFocus={() => Alert.alert("Email input is focused")}
            // onBlur={() => Alert.alert("Email input is blurred")}
          ></TextInput>
          <TextInput
            style={styles.textInput}
            value={password}
            placeholder="password"
            onChangeText={onPasswordTextChanged}
            secureTextEntry={true}
            // clearButtonMode={"always"}
          ></TextInput>
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('WelcomeScreen')}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

/*onPress={() => setLoginBtnPress(!loginBtnState)}>*/
            


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
  },
  headingText: {
    padding: 40,
    fontSize: 30,
    color: '#EDEFEE',
    textAlign: 'center',
  },
  textInput: {
    height: 43,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
    borderColor: '#EDEFEE',
    backgroundColor: '#EDEFEE',
    //color: 'black',
  },
  regularText: {
    fontSize: 24,
    padding: 20,
    marginVertical: 8,
    color: '#EDEFEE',
    textAlign: 'center',
  },

  button: {
    //fontSize: 22,
    padding: 15,
    marginVertical: 12,
    margin: 40,
    backgroundColor: '#EE9972',
    //borderColor: '#EE9972',
    //borderWidth: 2,
    borderRadius: 30,
  },
  buttonText: {
    color: '#333333',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
