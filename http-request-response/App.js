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
  const [data, setData] = useState([]);

  const getMenuData = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/menu-items-by-category.json'
      );
      const jsonMenu = await response.json();
      setData(jsonMenu.menu);
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMenuData();
  });

  const Item = ({ name, price }) => (
    <View style={menuStyles.menuContainer}>
      <Text style={menuStyles.menuItem}>{name}</Text>
       <Text style={menuStyles.menuItem}>${price}</Text>
    </View>
  );

  const renderListItem = ({ item }) => <Item name={item.title} price={item.price} />;

  return (
    <SafeAreaView style={menuStyles.container}>
      <Text style={menuStyles.headerText}>Little Lemon</Text>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={data}
          keyExtractor={({ id }, index) => id}
          renderItem={renderListItem}></FlatList>
      )}
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
  menuContainer:{
    flex:0.9,
    backgroundColor: '#485c58',
    flexDirection:'row',
    justifyContent: 'space-between'
  },
  menuItem:{
    color: '#f0c423',
    fontSize: 24,
    textAlign: 'left',
    padding:30
  }
});
