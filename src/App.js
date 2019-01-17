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
    ToastAndroid} from 'react-native';
// import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text } from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid"
import AwesomeButton from 'react-native-really-awesome-button';
import { BleManager } from 'react-native-ble-plx';

export default class App extends React.Component {

    constructor() {
        super();
        this.manager = new BleManager();
        this.device = null;
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
        this.device.connect()
            .then((device) => {
                return device.discoverAllServicesAndCharacteristics()
            })
            .then((device) => {
                // Do work on device with services and characteristics
            })
            .catch((error) => {
                // Handle errors
            });
    }

    disconnect = () => {
        this.manager.cancelDeviceConnection(this.device.id);
        this.device = null;
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.toolbar}>
                    <Text style={styles.toolbarTitle}>Bluetooth Device List</Text>
                </View>
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


                {/*<Grid style={styles.textContainer}>*/}
                    {/*<Text style={styles.inputText}>*/}
                        {/*READY!*/}
                    {/*</Text>*/}
                {/*</Grid>*/}
                {/*<Grid>*/}
                    {/*<Col style={styles.leftBox}>*/}
                        {/*<View style={styles.controlBtn}>*/}
                            {/*<View style={{flex: 1, flexDirection: 'row'}}>*/}
                                {/*<View></View>*/}
                                {/*<Button danger>*/}
                                    {/*<Text> ^ </Text>*/}
                                {/*</Button>*/}
                                {/*<View></View>*/}
                            {/*</View>*/}
                            {/*<View style={{flex: 1, flexDirection: 'row'}}>*/}
                                {/*<Button danger>*/}
                                    {/*<Text> LEFT </Text>*/}
                                {/*</Button>*/}
                                {/*<View style={{width: 80, height: 50}} />*/}
                                {/*<Button danger>*/}
                                    {/*<Text> RIGHT </Text>*/}
                                {/*</Button>*/}
                            {/*</View>*/}
                            {/*<View style={{flex: 1, flexDirection: 'row'}}>*/}
                                {/*<View></View>*/}
                                {/*<Button danger>*/}
                                    {/*<Text> v </Text>*/}
                                {/*</Button>*/}
                                {/*<View></View>*/}
                            {/*</View>*/}
                        {/*</View>*/}
                    {/*</Col>*/}
                    {/*<Col style={styles.rightBox}>*/}
                        {/*<View style={styles.grabBtn}>*/}
                            {/*<Button danger large>*/}
                                {/*<Text> GRAB !!! </Text>*/}
                            {/*</Button>*/}
                        {/*</View>*/}
                    {/*</Col>*/}
                {/*</Grid>*/}
            </View>
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

