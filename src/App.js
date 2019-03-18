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
    TouchableHighlight,
    ToastAndroid,
    TouchableWithoutFeedback,
    ScrollView,
    Alert,
    Image, ImageBackground} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import { Col, Row, Grid } from 'react-native-easy-grid'
import AwesomeButton from 'react-native-really-awesome-button';
import { BleManager } from 'react-native-ble-plx'
import AwesomeButtonCartman from 'react-native-really-awesome-button/src/themes/cartman';
import base64 from 'react-native-base64'
import { Fonts } from './utils/Fonts'

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
            deviceId: '',
            showToast: false,
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

    sendHold = (value) => {
        this.manager.writeCharacteristicWithoutResponseForDevice(
            this.state.deviceId,
            this.state.serUUID,
            this.state.charUUID,
            base64.encode(value))
            .catch((error) => {
                console.log('error in writing data');
                console.log(error);
            })
        this.timer = setTimeout(() => {this.sendHold(value)}, 80);
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
    };

    stopTimer = () => {
        clearTimeout(this.timer);
    };

    render() {
        const connected = this.state.connection;
        const connect = <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => {
                this.connectDevice()
            }}>
            <Text>Connect</Text>
        </TouchableOpacity>;
        const disconnect = <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => {
                this.disconnectDevice()
            }}>
            <Text>Disconnect</Text>
        </TouchableOpacity>;

        return (
            <ScrollView style={styles.container}>
                <ImageBackground source={require('./static/bg2.png')} style={styles.bgImage}>
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
                                        onPressIn={() => {this.sendHold('U')}}
                                        onPressOut={() => {this.stopTimer()}}>
                                        <Image source={require('./static/upBtn.png')}></Image>
                                        {/*<Text>UP</Text>*/}
                                    </TouchableOpacity>
                                    <View></View>
                                </View>
                                <View style={{flex: 1, flexDirection: 'row'}}>
                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPressIn={() => {this.sendHold('L')}}
                                        onPressOut={() => {this.stopTimer()}}>
                                        <Image source={require('./static/leftBtn.png')}></Image>
                                        {/*<Text>LEFT</Text>*/}
                                    </TouchableOpacity>
                                    <View style={{width: 80, height: 50}} />
                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPressIn={() => {this.sendHold('R')}}
                                        onPressOut={() => {this.stopTimer()}}>
                                        <Image source={require('./static/rightBtn.png')}></Image>
                                        {/*<Text>RIGHT</Text>*/}
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex: 1, flexDirection: 'row'}}>
                                    <View></View>
                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPressIn={() => {this.sendHold('D')}}
                                        onPressOut={() => {this.stopTimer()}}>
                                        <Image source={require('./static/downBtn.png')}></Image>
                                        {/*<Text>DOWN</Text>*/}
                                    </TouchableOpacity>
                                    <View></View>
                                </View>
                            </View>
                        </Col>
                        <Col style={styles.rightBox}>
                            <View style={styles.grabBtn}>
                                <TouchableOpacity
                                    style={styles.grabButton}
                                    onPress={() => {this.send('G')}}>
                                    {/*<Text style={styles.grabText}>GRAB</Text>*/}
                                    <Image source={require('./static/grab.png')}></Image>
                                </TouchableOpacity>
                            </View>
                        </Col>
                    </Grid>
                    <Toast ref="toast"/>
                </ImageBackground>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        fontFamily: Fonts.KarmaFuture,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#2d66a0',
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    connectContainer:{
        marginLeft: 25,
        color: '#000',
    },
    connectBtn:{
        color: '#000',
        marginTop: 10,
        // shadowColor: '#FFF', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#E8E8E8',
        elevation: 2, // Android
        height: 40,
        width: 87,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    controlButton: {
        shadowColor: '#FFF', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        // backgroundColor: '#FFF',
        elevation: 2, // Android
        height: 60,
        width: 85,
        borderRadius: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    grabButton: {
        shadowColor: '#FFF', // IOS
        shadowOffset: { height: 3, width: 3 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 3, //IOS
        // backgroundColor: '#FFF',
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

