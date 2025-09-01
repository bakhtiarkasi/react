import { useState } from 'react';
import {
  View,
  Image,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';

import { validateEmail } from '../utils/index';

const SubscribeScreen = () => {
  const [email, onEmailTextChanged] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);

  const handleEmailChange = (email) => {
    onEmailTextChanged(email);
    if (validateEmail(email)) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  };

  const handlePress = () => {
    // Dismiss the keyboard first
    Keyboard.dismiss();

    Alert.alert('Thanks for subscribing, stay tuned!');

    onEmailTextChanged('');
    setIsDisabled(true);
  };

  return (
    <View style={styles.container}>
      <Image
        resizeMode="contain"
        style={styles.imageIcon}
        accessible={true}
        accessibilityLabel={'Little Lemon Logo'}
        source={require('../img/little-lemon-logo-grey.png')}></Image>
      <Text style={styles.headerText}>
        Subscribe to our newsletter for our latest delicious recipes!
      </Text>
      <TextInput
        style={styles.textInput}
        value={email}
        placeholder={'Type your email'}
        onChangeText={handleEmailChange}
        keyboardType={'email-address'}></TextInput>
      <Pressable
        disabled={isDisabled}
        style={() => [styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handlePress}>
        <Text style={styles.buttonText}>Subscribe</Text>
      </Pressable>
    </View>
  );
};

export default SubscribeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  imageIcon: {
    height: 160,
    width: 120,
    borderRadius: 10,
    margin: 5,
  },
  headerText: {
    marginHorizontal: 30,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 3,
  },
  button: {
    padding: 15,
    backgroundColor: '#3E524B',
    borderRadius: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
  textInput: {
    borderWidth: 2,
    padding: 15,
    fontSize: 20,
    borderColor: '#3E524B',
    width: '80%',
    borderRadius: 10,
    margin: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
