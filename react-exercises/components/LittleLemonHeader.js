import { View, Text, StyleSheet } from 'react-native';

export default function LittleLemonHeader() {
  return (
    <View style={styles.container}>
      <Text
        style={styles.headerText}>
        Little Lemon
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    height: 110,
    backgroundColor: '#EE9972'
  },
  headerText: {
    marginTop: 60,
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    justifyContent: 'flex-end'
  }

});