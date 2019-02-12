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
    ScrollView} from 'react-native';
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
        this.state = {
            connection: false,
            device: null,
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
                // Stop scanning as it's not necessary if you are scanning for one device.
                this.manager.stopDeviceScan();

                this.setState({
                    device: device,
                    deviceId: device.id,
                    serUUIDs: device.serviceUUIDs,
                    serUUID: device.serviceUUIDs[0],
                })

                device.connect()
                    .then((device) => {
                        return device.discoverAllServicesAndCharacteristics()
                    })
                    .then((device) => {
                        // yay
                        this.setState({
                            connection: true,
                            charUUIDs: device.characteristicsForService(this.state.serUUID)
                        })
                        this.refs.toast.show('connected')
                    })
                    .catch((error) => {
                        this.error(error.message)
                    })


                // const serviceDevice = this.manager.servicesForDevice(device.id)
                // this.setState({
                //     device: device,
                //     deviceId: device.id,
                // })
            }
        });
    }

    connect = () => {
        if (!this.state.connection) {
            this.manager.connectToDevice(this.state.deviceId)
                .then((device) => {
                    if (this.manager.isDeviceConnected(device.id)){
                        this.setState({
                            connection: this.manager.isDeviceConnected(device.id)
                        })
                    }
                    if (this.state.connection){
                        this.refs.toast.show('connected')
                    }
                })
                .catch((error) => {
                    // error
                })


            // this.state.device.connect()
            //     .then((device) => {
            //         return this.manager.discoverAllServicesAndCharacteristicsForDevice(device.id, device.transaction.id)
            //     })
            //     .then((device) => {
            //         // this.refs.toast.show('connected')
            //         this.setState({
            //             serUUID: device.serviceUUID,
            //             charUUID: device.characteristicUUID,
            //             deviceId: device.id,
            //             deviceIdentifier: device.identifier,
            //         })
            //         if (this.manager.isDeviceConnected(device.identifier)){
            //             this.setState({
            //                 connected: this.manager.isDeviceConnected(device.identifier)
            //             })
            //         }
            //         if (this.state.connected){
            //             this.refs.toast.show('connected')
            //         }
            //     })
            //     .catch((error) => {
            //         // Handle errors
            //     });
        } else {
            console.log('some error with connection.')
            this.refs.toast.show('Connection failed. Please try again.', DURATION.LENGTH_SHORT)
        }

    }

    disconnect = () => {
        if (this.state.connection){
            this.manager.cancelDeviceConnection(this.state.deviceId);
            this.refs.toast.show('disconnected');
        } else {
            this.refs.toast.show('no device is connected')
        }
        // this.manager.cancelDeviceConnection(this.state.deviceId)
        // this.refs.toast.show('disconnected')
    }

    testTwo = (msg) => {
        this.setState({
            text: msg
        })
    }

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


        // this.manager.writeCharacteristicWithResponseForDevice(
        //     this.state.deviceId,
        //     this.state.serUUID,
        //     this.state.charUUID,
        //     'UTF-8',
        //     value,
        // ).then((response) => {
        //     this.refs.toast.show('sent.');
        //     console.log('yay done');
        //     console.log('response here: ', response)
        // }).catch((error) => {
        //     // handle error
        // })
    }

    readData = () => {
        this.manager.readCharacteristicForDevice(
            this.deviceIdentifier,
            serviceUUID,
            characteristicUUID,
            transactionId
        )
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.toolbar}>
                    <Grid>
                        <Button
                            onPress={() => {
                                this.disconnect()
                            }}
                            title="disconnect"
                        />
                    </Grid>
                    <Grid style={styles.textContainer}>
                        {/*<Text style={styles.inputText}>*/}
                            {/*{this.state.text}*/}
                        {/*</Text>*/}
                        <Text>
                            {this.state.serUUID}
                        </Text>
                    </Grid>
                    <Grid style={styles.textContainer}>
                        <FlatList
                            data={this.state.charUUIDs}
                            renderItem={({item}) => <Text>{item}</Text>}
                        />
                        {/*<Text>{this.state.serUUID}</Text>*/}
                    </Grid>
                </View>

                <Grid>
                    <Col style={styles.leftBox}>
                        <View style={styles.controlBtn}>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View></View>
                                <AwesomeButtonCartman
                                    onPress={ () => {
                                        this.send('F')
                                    }}
                                    type="primary"
                                    width={90}
                                    common>
                                    UP
                                </AwesomeButtonCartman>
                                <View></View>
                            </View>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <AwesomeButtonCartman
                                    onPress={ () => {
                                        this.send('F')
                                    }}
                                    type="primary"
                                    width={90}
                                    common>
                                    LEFT
                                </AwesomeButtonCartman>
                                <View style={{width: 80, height: 50}} />
                                <AwesomeButtonCartman
                                    onPress={ () => {
                                        this.send('F')
                                    }}
                                    type="primary"
                                    width={90}
                                    common>
                                    RIGHT
                                </AwesomeButtonCartman>
                            </View>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View></View>
                                <AwesomeButtonCartman
                                    onPress={ () => {
                                        this.send('F')
                                    }}
                                    type="primary"
                                    width={90}
                                    common>
                                    DOWN
                                </AwesomeButtonCartman>
                                <View></View>
                            </View>
                        </View>
                    </Col>
                    <Col style={styles.rightBox}>
                        <View style={styles.grabBtn}>
                            <AwesomeButtonCartman
                                onPress={() => {
                                    this.send("N")
                                }}
                                type="secondary"
                                height={110}
                                width={160}
                                common>
                                GRAB
                            </AwesomeButtonCartman>
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
    inputText: {
      fontSize: 40,
    },
    grabBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#EB5EBC',
    },
    controlBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#F7DC2B',
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
        // backgroundColor: '#F7DC2B',
    },
    rightBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

