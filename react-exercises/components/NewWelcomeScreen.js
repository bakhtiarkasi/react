import { View, Text, Image, StyleSheet, useColorScheme  } from 'react-native';

function NewWelcomeScreen(){

  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, colorScheme==="dark"?styles.backgroundDark:styles.backgroundLight]}>
      <View style={styles.headerRow}>
      <Text style={{color: 'red', fontSize:24}}>Hi: {colorScheme}</Text>
        <Image
          resizeMode="contain"
          style={styles.imageIcon}
          source={require('../img/logo.png')}></Image>
        <Text style={[styles.headerText, styles.container, colorScheme==="dark"?styles.fontDark:styles.fontLight]}>Little Lemon</Text>
      </View>
      <Text style={[styles.bodyText, styles.container, colorScheme==="dark"?styles.fontDark:styles.fontLight]}>
        Little Lemon is a charming neighborhood bistro that serves simple food
        and classic cocktails in a lively but casual environment. We would love
        to hear your experience with us!
      </Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // Positions the view at the very bottom
  },
  backgroundLight: {
    backgroundColor: '#FFFFFF',
  },
  backgroundDark:
  {
    backgroundColor: '#333333',
  },
  headerRow:
  {
    flexDirection:'row', 
  justifyContent: 'center', 
  alignItems: 'center', 
  marginTop: 10},

  headerText: {
    margin: 10,
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bodyText: {
    padding: 10,
    fontSize: 20,
    textAlign: 'center',
  },
  imageIcon: {
    height: 100,
    width: 100,
    borderRadius: 10
  },
  fontDark:
  {
    color: '#EDEFEE',
  },
  fontLight:{
    color: 'black',
  },
});

export default NewWelcomeScreen;
