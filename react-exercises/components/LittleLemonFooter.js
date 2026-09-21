import { View, Text, StyleSheet } from 'react-native';

export default function LittleLemonFooter() {
    return (
        <View style={styles.container}>
            <Text
                style={styles.footerTest}>
                All rights reserved by the Little Lemon, 2022{' '}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 0.25,
        width: '100%', // Occupies full width
        backgroundColor: '#EE9972', // Example background color
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute', // Key to absolute positioning
        bottom: 0, // Positions the view at the very bottom
    },
    footerTest: {
        padding: 10,
        marginBottom: 10,
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
        fontStyle: 'italic',
        fontWeight: 'bold', 
    }

});