import * as React from 'react';

import {  View, StyleSheet, TouchableHighlight, Image, Platform, Linking, Share } from 'react-native';

import { connect } from 'react-redux';
import { fetchOffersDataSource, saveOffer } from './reducer';

import { Toast, Text, Button,  Icon, Root, Right, Left, Footer,  FooterTab }  from 'native-base';

import OfferInfo from '../../components/OfferInfo';
import AwesomeAlert from 'react-native-awesome-alerts';

class Oferta extends React.Component { 

  constructor(props) {
    super(props);

    this.state = {
        active: false,
        category:'',
        user: [],
        title:'No Data',
        image:[],
        daysRemain:0,
        desc:'No Data',
        pirice:'0.00',
        subscribed: true, //Scar esta info del usuario
        result: [],
        dataSource: [],
        showAlert: false,
        alertType: 'got',
        expired: false,
        offer:[] 
    };

  }

  arrayholder = [];
  
  static navigationOptions = ({ navigation }) => {
    return {
    headerTransparent: false,
    title: 'Oferta',
    headerBackTitle : null,
    headerTitleStyle : {width : '90%', textAlign: 'center'} ,  
    headerRight: (
        [
          global.testing == true?
          <Button transparent
            title="Go back"
            testID = "backBtn"
            onPress={() => navigation.goBack()}
          ><Text> </Text>
          </Button>
        : null , 
          <TouchableHighlight style={{backgroundColor:'transparent', height:35, width:35,  marginRight:20, padding:4, borderRadius:100}} 
            key="shareBtn" onPress={navigation.getParam('shareFunction')} > 
              <Icon name="md-share" type="Ionicons" style={[{ color:'#00be50'}]} />
          </TouchableHighlight>, 
          <TouchableHighlight  style={{backgroundColor:'transparent', height:35,width:35,  marginRight:15, padding:4, paddingLeft:9, borderRadius:100}} 
            key="locationBtn"  onPress={navigation.getParam('getDirections')} >
            <Icon name="md-pin" type="Ionicons" style={[{color:'#dd4b3e'}]} />
          </TouchableHighlight>,           
        ]
      ),
    }    
  };  

   //await AsyncStorage.removeItem('user')
  async componentWillMount() {
    const { user_id } = this.props.user;

    let data = await this.props.navigation.getParam('offer','no_offer_data');  

    this.setState({ 
        title: data.title,
        //category: data.data_post.post,
        desc:  data.desc,
        price: data.price,
        image: data.image,
        offer: data.offer,
        daysRemain: this._getDaysRemain(data.offer.post_meta.offer_exp_date), 
      });


      this.props.navigation.setParams({ 
        title: this.state.title,
        getDirections: () => { this._handlePressDirections(data.offer.post_meta.offer_location) } , 
        shareFunction: () => { this.onShare() }
       });

  }

  async componentDidMount() {
    //this.props.navigation.setParams({ cosa: this.state.title });
  }

  _handleOfferClick = (navigation, item) => {
    console.log("offer clicked",item);
  };

  onShare = async () => {
    try {
      const result = await Share.share({
        message: this.props.screenProps.lang.myAccount.shareMessage,
        url: this.props.screenProps.lang.myAccount.shareUrl,
        title: this.props.screenProps.lang.myAccount.shareTitle
      }, {
        // Android only:
        dialogTitle: this.props.screenProps.lang.myAccount.shareDialogAndroidOnlyTitle,
        // iOS only:
        excludedActivityTypes: [
          'com.apple.UIKit.activity.PostToTwitter'
        ]
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };  

  _handlePressDirections = (data) => {

    console.log("coords", data);

      let coords = `${data.latitude},${data.longitude}`;

      if (Platform.OS === 'ios') {
        Linking.openURL(`http://maps.apple.com/?daddr=${data}`);
      } else {
        Linking.openURL(`http://maps.google.com/?daddr=${data}`);
      }

  }

  _checkOfferOwnership = (id) =>{
      var found = this.props.offerList.offlineDataSource.some((el) => {
        return el.post_data.ID === id;
      });
      return found;  
  }

  _handleAddToMyOffers = async (item) => {

    const {user} = this.props;
    if(user.user_meta.app_subscribed == 'false'){
        // Works on both iOS and Android
        this.showAlert('unsubscribed');
    }
    else{  
 
      if( this._checkOfferOwnership(item.post_data.ID) ) {           
        
        Toast.show({
            text: "You Alaready Have This Offer!",
            buttonText: "Okay",
            duration: 4000,
            type: "danger"
        })

        return;
      }

      await this.props.saveOffer(item);
      this.showAlert('got');
    }
    
  }


  showAlert = (type) => {
    this.setState({ showAlert: true, alertType:type }); 
  }

  hideAlert = () => {
    this.setState({
      showAlert: false
    });
  }

  alertContents = () => {
      const {alertType} = this.state; 
      const { screenProps } = this.props;

      if(alertType == 'fail'){
        return(
          <View style= {styles.customMessage}>
            <Image
                style={{width: 50, height: 50}}
                source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png', cache: 'force-cache'}}
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
              <Text style={styles.alertMessageH1}>{screenProps.lang.offerScreen.noSubscriptionMsg.h1}</Text>
              <Text style={styles.alertMessageH2}>{screenProps.lang.offerScreen.noSubscriptionMsg.h2}</Text>
              <Button full  
                style={{borderRadius:50, marginBottom:5, backgroundColor:'#47d782'}} 
                onPress = { () => { this.hideAlert(); this.props.navigation.navigate('Subscription')} } >
                <Text>{screenProps.lang.offerScreen.noSubscriptionMsg.confirm}</Text>               
              </Button>             
              <Button full warning style={{borderRadius:50}} onPress = { () => this.hideAlert() } >
                <Text>{screenProps.lang.offerScreen.noSubscriptionMsg.cancel}</Text> 
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
              <Text style={styles.alertMessageH1}>{screenProps.lang.offerScreen.gotItMsg.h1}</Text>
              <Text style={styles.alertMessageH2}>{screenProps.lang.offerScreen.gotItMsg.h2}</Text>
              <Button small full transparent warning 
                style={styles.myOffersBtn} 
                onPress = { () => { this.hideAlert(); this.props.navigation.navigate('MyOffers')} } >
                <Text>{screenProps.lang.offerScreen.gotItMsg.confirm}</Text>               
              </Button>             
              <Button full style={styles.alertMessageConfirmBtn} onPress = { () => this.hideAlert() } >
                <Text>{screenProps.lang.offerScreen.gotItMsg.cancel}</Text> 
              </Button> 
            </View>           
          </View>
        )
      }
  }

  _getDaysRemain = (expiration_date) => {
    var today = new Date().getTime();
    var exp = new Date(expiration_date).getTime();
    return parseInt( (( exp - today ) / (1000 * 60 * 60 * 24)) + 2 ); 
  }


  render() {
    const {showAlert} = this.state;
    const { screenProps } = this.props;

    return (

        <Root>
            <View enabled style={{ flex:1, marginTop:0, marginBottom:0, marginLeft:0, marginRight:0 }}>
              <View style={[styles.modalStyle,{ marginTop:0, marginLeft:0, marginRight:0, paddingLeft:0, paddingRight:0, padding:0, paddingTop:0,}]}>
                  <OfferInfo 
                  title={this.state.title}
                  //category={this.state.category}
                  image={this.state.image}
                  desc={this.state.desc}
                  price={this.state.price}
                  daysRemain={this.state.daysRemain}
                  lang = { screenProps.lang.offerScreen }
                  />                
              </View>

              { /*

                <Fab
                active={this.state.active}
                direction="right"
                containerStyle={{left: '43.5%', top:170}}
                style={{ backgroundColor: '#4e2e59', borderWidth:2, borderColor:'#fff' }}
                position="topRight"
                //onPress={ () => this._handleAddToMyOffers(this.state.offer) }
                onPress={() => this.setState({ active: !this.state.active })}>                
                  <Icon name="add" />
                  <Button style={{ backgroundColor: '#34A34F' }}>
                    <Icon name="share" />
                  </Button>
                  <Button style={{ backgroundColor: '#3B5998' }}>
                    <Icon name="pin" />
                  </Button>
                </Fab>      
               */
              }
         
              <View style={{backgroundColor:"#fff", padding:6}}></View>
              <Footer style={{backgroundColor:"#f7f7f7"}}>
              <FooterTab style={{backgroundColor:"#f7f7f7", padding:10}}>
                <Left style={[styles.priceText, {paddingLeft:20, justifyContent:'center'}]}>                              
                    <Text style={{fontSize:21, color:'purple', fontWeight:'bold'}}>${ this.state.price }</Text>
                    {
                      (this.state.daysRemain >= 0)
                      ?
                        <Text  adjustsFontSizeToFit numberOfLines={1} style={{fontSize:12, color:'gray'}}> <Icon name="md-alarm" style={{fontSize:13, color:'gray'}}/> { screenProps.lang.offerScreen.expiresInDays.replace('$days',this.state.daysRemain) }  </Text>
                      :
                        <Text  adjustsFontSizeToFit numberOfLines={1} style={{fontSize:12, color:'red'}}> <Icon name="md-alarm" style={{fontSize:13, color:'red'}}/> { screenProps.lang.offerScreen.expiredMessage }   </Text>
                    }

                    
                </Left>

                </FooterTab>
                <FooterTab style={{backgroundColor:"#f7f7f7", padding:10}}>
                <Right style={[styles.expireText]}> 
                  {
                    (this.state.daysRemain >= 0)
                    ?
                      <Button  onPress = { () => this._handleAddToMyOffers(this.state.offer) } >
                        <Text adjustsFontSizeToFit numberOfLines={1}>{ screenProps.lang.offerScreen.getBtnMessage }</Text>
                      </Button> 
                    :
                      <Button danger >
                        <Text adjustsFontSizeToFit numberOfLines={1}>{ screenProps.lang.offerScreen.expiredMessage }</Text> 
                      </Button>
                  }                  
                </Right>
                </FooterTab>
              </Footer> 

            </View>

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
                onCancelPressed={() => { this.hideAlert() }}
                onConfirmPressed={() => { this.hideAlert() }}
                customView={ this.alertContents() }
            /> 

        </Root>
    );
  }
}

const styles = StyleSheet.create({
  priceText:{
    padding:5,
    flex:1,
    justifyContent:'center'
  },
  expireText:{
    padding:5,
    flex:1,
  },
  modalStyle:{
    backgroundColor:'#fff', 
    flex:1, 
    borderRadius: 0,
    margin:0,
    padding:5, 
    marginBottom:0, 
    borderBottomStartRadius:0, 
    borderBottomEndRadius:0
  },
  offerListTitle:{
    fontSize: 20, 
    fontWeight:'bold',
    padding:10,
    flexBasis:2
  },
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
  },
  noPadding:{
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,  
  }  

});


const mapStateToProps = state => {
	const { user, offerList } = state;
	return { user: { ...user, ...user.user }, offerList };
};

export default connect(mapStateToProps, { fetchOffersDataSource, saveOffer })(Oferta);
