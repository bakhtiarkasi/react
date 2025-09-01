import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default App = () => {
  const [isLoading, setLoading] = useState(true);

  return (
    <SafeAreaView style={menuStyles.container}>
      <Text style={menuStyles.headerText}>Little Lemon</Text>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        {
          /* Render flatlist with menu items after fetching from API  here*/
        }
      )}
    </SafeAreaView>
  );
};

const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    color: '#495E57',
    fontSize: 30,
    textAlign: 'center',
  },
});
