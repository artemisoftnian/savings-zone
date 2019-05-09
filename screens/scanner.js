import * as React from 'react';

import {
  View,
  StyleSheet,
  Vibration,
  Dimensions
} from 'react-native';

import { Constants, BarCodeScanner, Permissions } from 'expo';

import { Text, Button } from 'native-base';

import { connect } from 'react-redux';
import { merchantRedeemOffer } from './Merchant/reducer';

class ScannerScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true, 
      error: null,
      user: [],
      hasCameraPermission: null,
      pause: false,
      destino: 'Offers', 
      returnMessage: { message:''}
    };

  }

  async componentWillMount(){
     let destino = await this.props.navigation.getParam('destiny','Offers'); 
     this.setState({ destino });
  }

  componentDidMount() {
    this._requestCameraPermission();
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  render() {
    const { screenProps } = this.props;

    return (
      <View style={styles.container}>
        {this.state.hasCameraPermission === null ?
          <Text>Requesting for camera permission</Text> :
          this.state.hasCameraPermission === false ?
            <Text>Camera permission is not granted</Text> :
            <BarCodeScanner  onBarCodeRead={this._handleBarCodeRead}  style={[StyleSheet.absoluteFill, styles.container]} >             
                <View style={styles.topScanBar}/>
                <Text style={styles.description}>{screenProps.lang.scannerScreen.message}</Text>
                <View style={styles.middleScanbar}/>
                <View style={styles.bottomScanBar}/>
            </BarCodeScanner>            
        }
        
        <Button full round success onPress = { () => this.testRedem(this.state.qrData) } >
          <Text>Test Redemption Here</Text>
        </Button>
        <Text>{this.state.returnMessage.message}</Text>
        
      </View>
    );
  }

  testRedem = async (data) => {
    // Get the token that uniquely identifies this device
    //let token = await Notifications.getExpoPushTokenAsync();
    console.log('pushToken', token);

    var test = await this.props.merchantRedeemOffer(data);
    this.setState({returnMessage: this.props.merchant.message})    
  }

  _handleBarCodeRead = async ({ type, data }) => {
    const ENDPATTERN = [0, 200, 50, 200];
    Vibration.vibrate(ENDPATTERN);

    if(data && !this.state.pause){
       this.setState({pause: true});
       var test = await this.props.merchantRedeemOffer(data);
       //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
       if(test){
         this.props.nav.navigate(this.state.destino, screenProps.lang.myOffers.redeemMessage);
       }
    }
    
  }


}


const { width } = Dimensions.get('window')
const qrSize = width * 0.7

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  topScanBar:{
    top:0,
    width: '100%',
    height: qrSize,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor:'red',
    borderWidth:0,
    borderBottomWidth:1
  },
  middleScanbar:{
    bottom: 0,
    width: '100%',
    height: qrSize,
    backgroundColor:'transparent',
    borderColor:'red',
    borderWidth:0,
    borderBottomWidth:1
    
  },
  bottomScanBar:{
    bottom: 0,
    width: '100%',
    height: qrSize,
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  description: {
    fontSize: 12,
    marginTop: '2%',
    textAlign: 'center',
    width: '70%',
    color: 'yellow',
  },  
});


const mapStateToProps = state => {
	const { user, merchant } = state;
	return { user: { ...user, ...user.user }, merchant };
};

export default connect(mapStateToProps, { merchantRedeemOffer } )(ScannerScreen);