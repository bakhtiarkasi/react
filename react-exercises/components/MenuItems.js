import { View, Text, SectionList, StyleSheet } from 'react-native';

const menuItemsToDisplay = [
  {
    title: 'Appetizers',
    data: [
      { name: 'Hummus', price: '$5.00' },
      { name: 'Moutabal', price: '$5.00' },
      { name: 'Falafel', price: '$7.50' },
      { name: 'Marinated Olives', price: '$5.00' },
      { name: 'Kofta', price: '$5.00' },
      { name: 'Eggplant Salad', price: '$8.50' },
    ],
  },
  {
    title: 'Main Dishes',
    data: [
      { name: 'Lentil Burger', price: '$10.00' },
      { name: 'Smoked Salmon', price: '$14.00' },
      { name: 'Kofta Burger', price: '$11.00' },
      { name: 'Turkish Kebab', price: '$15.50' },
    ],
  },
  {
    title: 'Sides',
    data: [
      { name: 'Fries', price: '$3.00', id: '11K' },
      { name: 'Buttered Rice', price: '$3.00' },
      { name: 'Bread Sticks', price: '$3.00' },
      { name: 'Pita Pocket', price: '$3.00' },
      { name: 'Lentil Soup', price: '$3.75' },
      { name: 'Greek Salad', price: '$6.00' },
      { name: 'Rice Pilaf', price: '$4.00' },
    ],
  },
  {
    title: 'Desserts',
    data: [
      { name: 'Baklava', price: '$3.00' },
      { name: 'Tartufo', price: '$3.00' },
      { name: 'Tiramisu', price: '$5.00' },
      { name: 'Panna Cotta', price: '$5.00' },
    ],
  },
];

const Item = ({ name, price }) => (
  <View style={styles.innerContainer}>
    <Text style={styles.itemText}>{name}</Text>
    <Text style={styles.itemText}>{price}</Text>
  </View>
);

const renderSectionHeader = ({ section: { title } }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Footer = () => (
    <Text style={styles.footerText}>
      All Rights Reserved by Little Lemon 2022
  </Text>
);

const Separator = () => <View style={styles.separator} />;

function MenuItems (){
  const renderItem = ({ item }) => <Item name={item.name} price={item.price} />;

  return (
    <View style={styles.container}>
      <SectionList
        sections={menuItemsToDisplay}
        keyExtractor={(item, index) => item + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListFooterComponent={Footer}
        ItemSeparatorComponent={Separator}
        ></SectionList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.95,
  },
  innerContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  itemText: {
    color: '#F4CE14',
    fontSize: 24,
  },
  sectionHeader: {
    backgroundColor: '#F4CE14',
    color: '#333333',
    fontSize: 30,
    flexWrap: 'wrap',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: 0,
    borderColor: '#EDEFEE',
  },
  footerText: {
    color: 'black',
    backgroundColor: '#EE9972',
    fontSize: 20,
    flexWrap: 'wrap',
    textAlign: 'center',
    fontStyle: 'italic'
  },
});

export default MenuItems;
