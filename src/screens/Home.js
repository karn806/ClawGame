import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import { Button } from 'react-native-elements'

class Home extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Haiyo!
                </Text>
            </View>
        );
    }
}