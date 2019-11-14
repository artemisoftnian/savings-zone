import * as React from 'react';

import {
  View,
  StyleSheet,
  Vibration,
  Dimensions,
  ActivityIndicator
} from 'react-native';

import { BarCodeScanner, Permissions, Notifications } from 'expo';
import Constants from 'expo-constants';

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
      returnMessage: { message:''},
      isCanjeando: false,
    };

  }

  async componentWillMount(){

  }

  async componentDidMount() {
    let destino = await this.props.navigation.getParam('destiny','Offers'); 
    this.setState({ destino });
    //console.log(this.state.destino);    
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
      <View style={styles.container} testID="scanView">
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
        {
        this.state.isCanjeando?<ActivityIndicator style={{flex:1}}  size="large" color="yellow" />:null        
        }

        <Text>{this.state.returnMessage.message}</Text>
        
      </View>
    );
  }

  testRedem = async (data) => {
    // Get the token that uniquely identifies this device
    //let token = await Notifications.getExpoPushTokenAsync();
    //console.log('pushToken', token);

    var test = await this.props.merchantRedeemOffer(data);
    this.setState({returnMessage: this.props.merchant.message})    
  }

  _handleBarCodeRead = async ({ data }) => {   

    data = JSON.parse(data);
    
    //console.log('merchant',this.props.user);

    if(this.state.pause)
      return;

    const ENDPATTERN = [0, 200, 50, 200];
    //Vibration.vibrate(ENDPATTERN);

    //Verify if offers belongs to this merchant
    if(data.merchant_id != this.props.user.merchant_meta.merchant_id){  //check first with merchant_id if not match 
      if(data.merchant_id != this.props.user.merchant_meta.user_id){ //check then with user_id
        alert("La oferta que intentan redimir le pertenece a otro comerciante. Verifique con el cliente."); 
        return;
      }
    }


    if(data && !this.state.pause){
       this.setState({pause: true, isCanjeando:true});
      // var test= true;
       await this.props.merchantRedeemOffer(data).then(async (responseJson) => {
         //console.log('response from server', responseJson)
          if(responseJson){
            //first send Notification then navigate back to merchant home
              var redimedData = this.props.merchant.message;

              if(redimedData.goodToGo){
                await this.sendNotification(data['token']);
                this.props.navigation.navigate(this.state.destino, this.props.screenProps.lang.myOffers.redeemMessage);
              }
              else{
                alert(redimedData.message); 
                this.props.navigation.navigate(this.state.destino, this.props.screenProps.lang.myOffers.redeemMessage);
              }          

          }else{
                            
          }
       })

    }
    
  }

  sendNotification = async (token) =>  {
    let response = null;
    try{
      response = await fetch("https://exp.host/--/api/v2/push/send",{
        method: 'POST',
        headers: {
          host: 'exp.host',
          accept: 'application/json',
          'accept-encoding': 'gzip, deflate',
          'content-type': 'application/json' 
        },
        body: JSON.stringify({
          to: token,
          data: {offerID:'123'},
          title: 'Offer Redemption',
          body: 'Oferta Redimida Exitosamente',
          priority: 'default',
          sound: 'default',
        })
      });      
    }
    catch(e){
      console.warn(e.message);
      response = e.message;
    }
    finally{
      //console.log(response);
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