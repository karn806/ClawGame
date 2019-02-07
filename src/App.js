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

export default class App extends React.Component {



    constructor() {
        super();
        this.manager = new BleManager();
        this.device = null;
        this.serUUID = '';
        this.charUUID = '';
        this.deviceId = '';
        this.deviceIdentifier = '';
        this.state = {
            showToast: false
        };
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
            if (device.name === 'JDY-09-V4.3') {

                // Stop scanning as it's not necessary if you are scanning for one device.
                this.manager.stopDeviceScan();
                this.device = device;

                // Proceed with connection.
            }
        });
    }

    connect = () => {
        if (this.device !== null) {
            this.device.connect()
                .then((device) => {
                    return this.manager.discoverAllServicesAndCharacteristicsForDevice(device.id, device.transaction.id)
                })
                .then((device) => {
                    this.serUUID = device.serviceUUID;
                    this.charUUID = device.characteristicUUID;
                    this.deviceId = device.id;
                    this.deviceIdentifier = device.identifier;
                })
                .catch((error) => {
                    // Handle errors
                });
        } else {
            console.log('some error with connection.')
            this.refs.toast.show('Connection failed. Please try again.', DURATION.LENGTH_SHORT)
        }

    }

    disconnect = () => {
        if (this.deviceId !== '') {
            this.manager.cancelDeviceConnection(this.deviceId);
        } else {
            this.refs.toast.show('not connected yet')
        }
    }

    write = (value) => {
        this.manager.writeCharacteristicWithResponseForDevice(
            this.deviceId,
            this.serUUID,
            this.charUUID,
            value,
        ).then((response) => {
            console.log('yay done')
            console.log('response here: ', response)
        }).catch((error) => {
            // handle error
        })
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
                        <Row>
                            <Button
                                raised
                                onPress={this.connect}
                                title="Connect"
                                color="#841584"
                            />
                            <Button
                                raised
                                onPress={this.disconnect}
                                title="Disconnect"
                            />
                        </Row>
                    </Grid>
                </View>

                <View>
                    <Grid style={styles.textContainer}>
                        <Text style={styles.inputText}>
                            YAY
                        </Text>
                    </Grid>
                </View>

                <Grid>
                    <Col style={styles.leftBox}>
                        <View style={styles.controlBtn}>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View></View>
                                <AwesomeButtonCartman
                                    type="primary"
                                    width={80}
                                    common>
                                    UP
                                </AwesomeButtonCartman>
                                <View></View>
                            </View>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <AwesomeButtonCartman
                                    type="primary"
                                    width={80}
                                    common>
                                    LEFT
                                </AwesomeButtonCartman>
                                <View style={{width: 80, height: 50}} />
                                <AwesomeButtonCartman
                                    type="primary"
                                    width={80}
                                    common>
                                    RIGHT
                                </AwesomeButtonCartman>
                            </View>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View></View>
                                <AwesomeButtonCartman
                                    type="primary"
                                    width={80}
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
                                type="secondary"
                                height={90}
                                width={140}
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
        paddingTop:30,
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

