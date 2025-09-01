import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';

function WelcomeScreen() {
   // declare the variables
  const [firstName, onChangeFirstName] = useState('');
  const [lastName, onChangeLastName] = useState('');
  const [message, onChangeMessage] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardDismissMode="on-drag">
        <Text style={styles.headerText}>
          How was your visit to Little Lemon?
        </Text>
        <Text style={styles.bodyText}>
          Little Lemon is a charming neighborhood bistro that serves simple food
          and classic cocktails in a lively but casual environment. We would
          love to hear your experience with us!
        </Text>
        <TextInput
          style={styles.textInput}
          value={firstName}
          onChangeText={onChangeFirstName}
        />
        <TextInput
          style={styles.textInput}
          value={lastName}
          onChangeText={onChangeLastName}
        />
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={onChangeMessage}
          numberOfLines={3}
          multiline={true}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
  },
  headerText: {
    padding: 40,
    fontSize: 40,
    color: '#EDEFEE',
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 24,
    padding: 20,
    marginVertical: 8,
    color: '#EDEFEE',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#F4CE14',
    fontSize: 24,
    height: 44,
    margin:12,
    paddingHorizontal:15,
    borderWidth: 1, 
    borderColor: '#EDEFEE', 
  },
    messageInput: {
    height: 100,
    margin: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 24,
    backgroundColor: '#F4CE14',
    borderColor: '#EDEFEE',
  },
});

export default WelcomeScreen;
