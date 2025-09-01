import * as React from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        resizeMode="contain"
        style={styles.imageIcon}
        accessible={true}
        accessibilityLabel={'Little Lemon Logo'}
        source={require('../img/little-lemon-logo.png')}></Image>
      <Text style={styles.headerText}>
        Little Lemon, your local Mediterranean Bistro
      </Text>
      <Pressable 
        style={styles.button}
        onPress={() => navigation.navigate("Subscribe")}>
        <Text style={styles.buttonText}>Newsletter</Text>
      </Pressable>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  imageIcon: {
    height: 200,
    width: 120,
    borderRadius: 10,
    margin: 10,
    marginTop: '30%',
  },
  headerText: {
    margin: 10,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 50,
  },
  button: {
    padding: 15,
    backgroundColor: '#3E524B',
    borderRadius: 10,
    width: '80%',
    position:'absolute',
    bottom: 40
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
});
