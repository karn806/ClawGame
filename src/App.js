/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {Platform, StyleSheet, Text, View, Button, FlatList, Switch, TouchableOpacity, TouchableHighlight,
    ToastAndroid, TouchableWithoutFeedback, ScrollView, Alert, Modal, Image, ImageBackground} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import { Col, Row, Grid } from 'react-native-easy-grid'
import { BleManager } from 'react-native-ble-plx'
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
            deviceId: '',
            showToast: false,
            count: 15,
            singleDigit: false,
            gameStart: false,
            debugMode: false,
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

    startCountDown = () => {
        this.myInterval = setInterval(() => {
            this.clockWork();
        }, 1000)
    }

    clockWork = () => {
        if (this.state.count > 0){
            if (this.state.count <= 10){
                this.setState({singleDigit: true});
            }
            this.setState(prevState => ({
                count: prevState.count - 1
            }))
        } else if(this.state.count === 0) {
            Alert.alert("TIME'S UP!!!");
            this.setState({
                singleDigit: false,
                gameStart: false,
                count: 15,
            });
            clearInterval(this.myInterval);
            this.send('G');
        }

    }

    componentWillUnmount() {
        clearInterval(this.myInterval)
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
        if (!this.state.gameStart && !this.state.debugMode && this.state.connection){
            this.startCountDown();
            this.setState({
                gameStart: true,
            })
        }
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
        clearInterval(this.myInterval);
        this.setState({
            singleDigit: false,
            gameStart: false,
            count: 15,
        });
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

    debugMode = (value) => {
        if(value === 'on'){
            this.setState({
                debugMode: true,
            })
        } else if (value === 'off') {
            this.setState({
                debugMode: false,
            })
        }
    }

    render() {
        const count = this.state.count;
        const singleDigit = this.state.singleDigit;
        const countStart = '00:'+count;
        const countSingle = '00:0'+count;
        const connected = this.state.connection;
        const debugStatus = this.state.debugMode;

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

        const debugOff = <TouchableOpacity
            style={styles.debugOffBtn}
            onPress={() => {
                this.debugMode('off')
            }}>
            <Text>Debug OFF</Text>
        </TouchableOpacity>;

        const debugOn = <TouchableOpacity
            style={styles.debugOnBtn}
            onPress={() => {
                this.debugMode('on')
            }}>
            <Text>Debug ON</Text>
        </TouchableOpacity>;

        return (
            <View style={styles.container}>
                <ImageBackground source={require('./static/bg2.png')} style={styles.bgImage}>
                    <View style={styles.toolbar}>
                        <Grid style={styles.connectContainer}>
                            <Row>
                                { connected ? disconnect : connect }
                            </Row>
                            // <Row>
                            //     { debugStatus ? debugOff : debugOn }
                            // </Row>
                        </Grid>
                        <Grid style={styles.textGrid}>
                            <Text style={styles.countDownFont}>
                                {singleDigit ? countSingle : countStart}
                            </Text>
                        </Grid>
                    </View>
                    <Grid style={{paddingBottom: 15}}>
                        <Col style={styles.leftBox}>
                            <View style={styles.controlBtn}>
                                <View style={{flex: 1, flexDirection: 'row'}}>
                                    <View></View>
                                    <TouchableOpacity
                                        style={styles.upBtn}
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
                                        style={styles.downBtn}
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
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#2d66a0',
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 130,
    },
    countDownFont: {
        fontSize: 50,
        fontFamily: 'KarmaFuture',
    },
    textGrid: {
        paddingTop: 60,
        paddingRight: 300,
    },
    bgImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    connectContainer:{
        marginLeft: 25,
        color: '#000',
    },
    controlBox: {
      margin: 10,
    },
    debugOnBtn:{
        color: '#000',
        marginTop: 10,
        // shadowColor: '#FFF', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#5fca00',
        elevation: 2, // Android
        height: 40,
        width: 87,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    debugOffBtn:{
        color: '#000',
        marginTop: 10,
        // shadowColor: '#FFF', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#d11b1b',
        elevation: 2, // Android
        height: 40,
        width: 87,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
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
    upBtn: {
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
        marginBottom: 50,
        paddingBottom: 48
    },
    downBtn: {
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
        marginTop: 32
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
        margin: 10,
        paddingBottom: 10
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
        paddingTop: 18
    },
    grabText: {
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
