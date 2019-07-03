import * as React from 'react';
import PropTypes from 'prop-types';
import {  Dimensions,  Image,  StyleSheet, View } from 'react-native';
import { Card, CardItem, Text,  Button,  Icon, Left, Right } from 'native-base';

import AwesomeAlert from 'react-native-awesome-alerts';

// Get screen dimensions
const { width, height } = Dimensions.get('window');
// How many offers we want to have in each row and column 
const cols = 2, rows = 3;


export default class PopMessages extends React.Component {

    // Component prop types
  static propTypes = { 
    //language: PropTypes.object.isRequired,
  }


  constructor(props) {
    super(props);

    this.state = {
      showAlert: false,
      alertType: 'got',
    };

  }


  static getDerivedStateFromProps(props, state) {
    // Cada vez que el usuario actual cambia,
    // Reiniciar cualquier parte del estado que esté atada a ese usuario.
    // En este ejemplo, es solo email.
    if (props.showAlert !== state.showAlert) {
      console.log(props.showAlert, state.showAlert);
      return {
        showAlert: props.showAlert,
        alertType: props.alertType,
      };
    }
    return null;
  }


  alertContents = () => {
   // const {alertType} = this.state; 
    const {language,  navigation} = this.props; 
    const {alertType,}  = this.state;

    console.log(alertType);

    if(alertType == 'fail'){
      return(
        <View style= {styles.customMessage}>
          <Image
              style={{width: 50, height: 50}}
              source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png', cache: 'force-cache' }}
              
          />    
          <Text style={{ marginTop:20 }}>¡oooohh ohhh!</Text>
          <Text>Ya tienes esta oferta</Text>
        </View>
      )
    }
    else if(alertType == 'unsubscribed'){
      return(
        <View style= {styles.alertMessageContainer}>            
        <Icon name="ios-close-circle" type="Ionicons" style={[styles.alertMessageIcon, {backgroundColor:'#d9534f'}]} />
        <View style={[styles.alertMessageBorder,{borderColor:'#d9534f'}]}>
          <Text style={styles.alertMessageH1}>{language.offerScreen.noSubscriptionMsg.h1}</Text>
          <Text style={styles.alertMessageH2}>{language.offerScreen.noSubscriptionMsg.h2}</Text>
          <Button full  
            style={{borderRadius:50, marginBottom:5, backgroundColor:'#47d782'}} 
            onPress = { () => this.props._hideAlert('Subscription') } >
            <Text>{language.offerScreen.noSubscriptionMsg.confirm}</Text>               
          </Button>             
          <Button full warning style={{borderRadius:50}} onPress = { () => this.props._hideAlert(null) } > 
            <Text>{language.offerScreen.noSubscriptionMsg.cancel}</Text> 
          </Button>
        </View>          
      </View> 
    )      
  }
  else{
    return(
      <View style= {styles.alertMessageContainer}>             
        <Icon name="thumbs-up" type="Ionicons" style={styles.alertMessageIcon} />
        <View style={[styles.alertMessageBorder,{borderColor:'#47d782'}]}>
          <Text style={styles.alertMessageH1}>{language.offerScreen.gotItMsg.h1}</Text>
          <Text style={styles.alertMessageH2}>{language.offerScreen.gotItMsg.h2}</Text>
          <Button small full transparent
            style={styles.myOffersBtn} 
            onPress = { () => this.props._hideAlert('MyOffers')}  >
            <Text>{language.offerScreen.gotItMsg.confirm}</Text>               
          </Button>             
          <Button full style={styles.alertMessageConfirmBtn} onPress = { () => this.props._hideAlert(null) } > 
            <Text>{language.offerScreen.gotItMsg.cancel}</Text> 
          </Button> 
        </View>           
      </View>
      )
    }
}  


  render() {
     
    const { showAlert,} = this.state;
    const { language,  alertyType } = this.props;

   // console.log('popMessages - showAlertProp:', this.props.showAlert)
    //console.log('popMessages - showAlertState:', this.state.showAlert) 

    return (
      <AwesomeAlert
        contentContainerStyle={{margin:0, width:'70%' }}
        overflow='visible'
        show={showAlert}
        showProgress={false}
        title=""
        message=""
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={false}
        cancelButtonStyle={{}}  
        confirmButtonStyle={{}}        
        //onCancelPressed={() => { this.hideAlert() }}
        //onConfirmPressed={() => { this.hideAlert() }}
        customView={ this.alertContents() }
        //key={'AwesomeAlert_'+this.props.showAlert}
      />    
    );
  }
}

const styles = StyleSheet.create({

  alertMessageContainer:{
    width:'100%'
  },
  alertMessageIcon:{
    color:'#fff', 
    fontSize:50, 
    backgroundColor:'#47d782', 
    padding: 20, 
    width:'100%', 
    textAlign: 'center'
  },
  alertMessageH1:{
    marginTop:20, textAlign: 'center', fontSize:18, marginBottom:5, fontWeight:'bold'
  },
  alertMessageH2:{
    marginBottom:10, textAlign: 'center'
  },
  alertMessageConfirmBtn:{
    marginBottom:5,
    backgroundColor:'#326e3d',
    borderRadius:50
  },
  alertMessageBorder:{
    borderWidth:1,  width:'100%', padding:10, borderBottomStartRadius:5, borderBottomEndRadius:5, paddingBottom:20
  },
  myOffersBtn:{
    marginTop:0,
    paddingTop:0,
    color: 'red'
  },

  emptyContainer: {    
    flex:1,
		alignItems: 'center',
    justifyContent: "center",
	},
  emptyIcon:{
    color:'#ff704d',
    fontSize:100
  },
  emptyText:{
    fontSize:20,
    color:'darkgray',
    fontWeight:'bold',
    padding:30,
    paddingTop:20, paddingBottom:5,
		justifyContent: 'center', 
    textShadowColor: 'rgba(0, 0, 0, 0.1)', 
    textShadowRadius: 10,
    textAlign:'center'  
  },
  emptyActionText:{
    fontSize:15,
    color:'darkgray',
    fontWeight:'bold',
    padding:60,
    paddingTop:5,
    marginTop:40,
    paddingBottom:10,
		justifyContent: 'center', 
    textShadowColor: 'rgba(0, 0, 0, 0.1)', 
    textShadowRadius: 10,
    textAlign:'center' 
  },
  CircleShapeView: {
    width: 150,
    height: 150,
    borderRadius: 150/2,
    backgroundColor: '#E0E0E0',
    textAlign:'center'
  },
  
});

