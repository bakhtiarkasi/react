import { View, StyleSheet } from 'react-native';
import LittleLemonHeader from './components/LittleLemonHeader';
import LittleLemonFooter from './components/LittleLemonFooter';
import WelcomeScreen from './components/WelcomeScreen';
import MenuItems from './components/MenuItems';
import LoginScreen from './components/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './components/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//const tabNavigator = createBottomTabNavigator();
//const Stack = createNativeStackNavigator();

const drawerNavigator = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <LittleLemonHeader />
        <drawerNavigator.Navigator
          useLegacyImplementation
          screenOptions={{ drawerPosition: 'right' }}>
          <drawerNavigator.Screen name="Login" component={LoginScreen} />
          <drawerNavigator.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{ title: 'Home' }}
          />
        </drawerNavigator.Navigator>
        <LittleLemonFooter />
      </View>
    </NavigationContainer>
  );
}

////screenOptions={{ drawerPosition: 'right' }}>

/* stack navigator code:

 <NavigationContainer>
      <View style={styles.container}>
        <LittleLemonHeader />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerStyle: { backgroundColor: 'white' } }}>
          <Stack.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{ title: 'Home' }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
        <LittleLemonFooter />
      </View>
    </NavigationContainer>
*/

/* Tab navigator code:

 <NavigationContainer>
      <View style={styles.container}>
        <LittleLemonHeader />
        <tabNavigator.Navigator
          initialRouteName="Login"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'WelcomeScreen') {
                iconName = focused
                  ? 'home'
                  : 'home-outline';
              } else if (route.name === 'Login') {
                 iconName = focused
                  ? 'enter'
                  : 'enter-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}>
          <tabNavigator.Screen name="Login" component={LoginScreen} />
          <tabNavigator.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{ title: 'Home' }}
          />
          
        </tabNavigator.Navigator>
        <LittleLemonFooter />
      </View>
    </NavigationContainer>
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#495E57',
  },
});
