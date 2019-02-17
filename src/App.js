/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {Platform,
    StyleSheet,
    Text,
    View,
    Button,
    FlatList,
    Switch,
    TouchableOpacity,
    ToastAndroid,
    ScrollView,
    Alert} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import { Col, Row, Grid } from "react-native-easy-grid"
import AwesomeButton from 'react-native-really-awesome-button';
import { BleManager } from 'react-native-ble-plx';
import AwesomeButtonCartman from 'react-native-really-awesome-button/src/themes/cartman';
import base64 from 'react-native-base64'

export default class App extends React.Component {



    constructor() {
        super();
        this.manager = new BleManager();
        this.timer = null;
        this.device = null;
        this.state = {
            scanAble: false,
            connection: false,
            serUUID: '0000FFE0-0000-1000-8000-00805F9B34FB',
            charUUID: '0000FFE1-0000-1000-8000-00805F9B34FB',
            // deviceId: 'D5C292CF-9F26-4D7A-D106-5181CA7B10B4',
            deviceId: '',
            showToast: false,
            test: false,
            text: 'hi',
        }
    }

    componentWillMount() {
        const subscription = this.manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                this.scanAndConnect();
                subscription.remove();
            }
        }, true);
    }

    scanAndConnect = () => {
        this.manager.startDeviceScan(null, null, (error, device) => {

            if (error) {
                // Handle error (scanning will be stopped automatically)
                return
            }

            // Check if it is a device you are looking for based on advertisement data
            // or other criteria.
            if (device.name === 'KARN-BLE') {
                this.setState({
                    scanAble: true,
                });
                // Stop scanning as it's not necessary if you are scanning for one device.
                this.manager.stopDeviceScan();

                this.device = device;

                this.setState({
                    deviceId: device.id,
                    serUUIDs: device.serviceUUIDs,
                    serUUID: device.serviceUUIDs[0],
                });
            }
        });
    }

    connectDevice = () => {
        if (this.state.scanAble){
            if (!this.state.connection) {
                this.device.connect()
                    .then((device) => {
                        return device.discoverAllServicesAndCharacteristics()
                    })
                    .then((device) => {
                        this.setState({
                            connection: true,
                            charUUIDs: device.characteristicsForService(this.state.serUUID)
                        })
                        this.refs.toast.show('connected')
                    })
                    .catch((error) => {
                        this.error(error.message)
                    })
            } else {
                console.log('some error with connection.')
                this.refs.toast.show('Connection failed. Please try again.', DURATION.LENGTH_SHORT)
            }
        } else {
            Alert.alert("Please turn on bluetooth device.")
        }
    };

    disconnectDevice = () => {
        if (this.state.connection){
            this.manager.cancelDeviceConnection(this.state.deviceId);
            this.setState({
                connection: false,
            })
            this.refs.toast.show('disconnected');
        } else {
            this.refs.toast.show('no device is connected')
        }
        // this.manager.cancelDeviceConnection(this.state.deviceId)
        // this.refs.toast.show('disconnected')
    };

    send = (value) => {
        this.manager.writeCharacteristicWithoutResponseForDevice(
            this.state.deviceId,
            this.state.serUUID,
            this.state.charUUID,
            base64.encode(value))
            .catch((error) => {
                console.log('error in writing data');
                console.log(error);
            })
        this.timer = setTimeout(() => {this.send(value)}, 100);
    };

    stopTimer = () => {
        clearTimeout(this.timer);
    }

    render() {
        const connected = this.state.connection;
        const connect = <Button
            onPress={() => {
                this.connectDevice()
            }}
            title="connect"
        />;
        const disconnect = <Button
            onPress={() => {
                this.disconnectDevice()
            }}
            title="disconnect"
        />;

        return (
            <ScrollView style={styles.container}>
                <View style={styles.toolbar}>
                    <Grid style={styles.connectContainer}>
                        { connected ? disconnect : connect }
                    </Grid>
                </View>
                <Grid>
                    <Col style={styles.leftBox}>
                        <View style={styles.controlBtn}>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View></View>
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPressIn={() => {this.send('U')}}
                                    onPressOut={() => {this.stopTimer()}}>
                                    <Text>UP</Text>
                                </TouchableOpacity>
                                <View></View>
                            </View>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPressIn={() => {this.send('L')}}
                                    onPressOut={() => {this.stopTimer()}}>
                                    <Text>LEFT</Text>
                                </TouchableOpacity>
                                <View style={{width: 80, height: 50}} />
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPressIn={() => {this.send('R')}}
                                    onPressOut={() => {this.stopTimer()}}>
                                    <Text>RIGHT</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View></View>
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPressIn={() => {this.send('D')}}
                                    onPressOut={() => {this.stopTimer()}}>
                                    <Text>DOWN</Text>
                                </TouchableOpacity>
                                <View></View>
                            </View>
                        </View>
                    </Col>
                    <Col style={styles.rightBox}>
                        <View style={styles.grabBtn}>
                            <TouchableOpacity
                                style={styles.grabButton}
                                onPressIn={() => {this.send('G')}}
                                onPressOut={() => {this.stopTimer()}}>
                                <Text style={styles.grabText}>GRAB</Text>
                            </TouchableOpacity>
                        </View>
                    </Col>
                </Grid>

                <Toast ref="toast"/>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        // backgroundColor: '#F5FCFF',
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectContainer:{
      marginLeft: 25,
    },
    controlButton: {
        shadowColor: '#000', // IOS
        shadowOffset: { height: 2, width: 2 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFD33C',
        elevation: 2, // Android
        height: 50,
        width: 80,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    grabButton: {
        shadowColor: '#000', // IOS
        shadowOffset: { height: 2, width: 2 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#F00626',
        elevation: 2, // Android
        height: 150,
        width: 200,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    grabText: {
        fontSize: 40,
    },
    inputText: {
      fontSize: 40,
    },
    grabBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
        // backgroundColor: '#EB5EBC',
    },
    controlBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#F7DC2B',
        margin: 40,
        marginLeft: 40
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
    leftBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 30,
        // backgroundColor: '#F7DC2B',
    },
    rightBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 30,
        // backgroundColor: '#EB5EBC',
    },
    gridContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolbar:{
        paddingTop:10,
        paddingBottom:30,
        flexDirection:'row'
    },
    toolbarButton:{
        width: 50,
        marginTop: 8,
    },
    toolbarTitle:{
        textAlign:'center',
        fontWeight:'bold',
        fontSize: 20,
        flex:1,
        marginTop:6
    },
    deviceName: {
        fontSize: 17,
        color: "black"
    },
    deviceNameWrap: {
        margin: 10,
        borderBottomWidth:1
    }
});

