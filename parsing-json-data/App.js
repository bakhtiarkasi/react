import { FlatList, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';

import menuItems from './menuItems.json';

export default App = () => {
  const [data, setMenuData] = useState();


  const loadData = () => {
    const jsonData = menuItems;
    
    //requires also loads the file but import is a modern approach
    //require('./menuItems.json');
    
    //set the data variable and use the menu collection 
    setMenuData(jsonData.menu);
    
  };

  useEffect(() => {
    loadData();
  }, []);
  
  const Item = ({ name, price }) => (
    <View style={menuStyles.menuContainer}>
      <Text style={menuStyles.menuItem}>{name}</Text>
       <Text style={menuStyles.menuItem}>{'$' + price}</Text>
    </View>
  );

const renderListItem = ({ item }) => {return <Item name={item.title} price={item.price} />};

  return (
    <SafeAreaView style={menuStyles.container}>
      <Text style={menuStyles.headerText}>Little Lemon</Text>
      <FlatList
        data={data}
        keyExtractor={(index) => index.toString()}
        renderItem={renderListItem}></FlatList>
    </SafeAreaView>
  );
};

const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    color: '#f0c423',
    fontSize: 30,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 0.9,
    backgroundColor: '#495E57',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItem: {
    color: '#F4CE14',
    fontSize: 22,
    textAlign: 'left',
    padding: 30,
  },
});
