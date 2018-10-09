/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

type Props = {};
export default class App extends Component {

    constructor() {
        super();
        this.manager = new BleManager();
    }

    static propTypes = {
        deviceName: PropTypes.string,
    };

    state = {
        deviceName: ''
    }

    componentWillMount() {
        const subscription = this.manager.onStateChange((state) => {
            console.log('component will mount');
            if (state === 'PoweredOn') {
                console.log('power on');
                this.scanAndConnect();
                subscription.remove();
            }
        }, true);
    }

    scanAndConnect() {
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                return
            }

            console.log("device name:")
            console.log(device.name);

            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            if (device.name === 'TI BLE Sensor Tag' ||
                device.name === 'SensorTag') {

                // Stop scanning as it's not necessary if you are scanning for one device.
                this.manager.stopDeviceScan();

                // Proceed with connection.
            }
        });
    }

    render() {
        const {
            deviceName
        } = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    <p>Welcome to React Native!</p>
                    <p>Device name: {deviceName}</p>
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
