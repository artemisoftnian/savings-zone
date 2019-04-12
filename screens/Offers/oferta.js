import * as React from 'react';

import { FlatList, ActivityIndicator, View, StyleSheet, TouchableHighlight,  
  Modal, Alert,  RefreshControl, Image } from 'react-native';

import { Toast} from 'native-base'; 

import { connect } from 'react-redux';
import { fetchOffersDataSource, saveOffer } from './reducer';

import { Text, Button,  Icon, Picker, Form, Root }  from 'native-base';

import MainWrapper from '../../components/MainWrapper';
import OfferInfo from '../../components/OfferInfo';
import OfferPoster from '../../components/OfferPoster';
import AwesomeAlert from 'react-native-awesome-alerts';

class Oferta extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
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
  
  static navigationOptions = {
    title: 'Oferta',
    headerBackTitle : null,
    headerTitleStyle : {width : '90%', textAlign: 'center'} ,  
    headerRight: (
        <TouchableHighlight onPress={() => { console.log('shareeeee') }} >
            <Icon name="share" type="Ionicons" style={[{marginRight:20}]} />
        </TouchableHighlight>       
      ),    
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

  }

  async componentDidMount() { }

  _handleOfferClick = (navigation, item) => {
    console.log("offer clicked",item);
  };

  _checkOfferOwnership = (id) =>{
      var found = this.props.offerList.offlineDataSource.some((el) => {
        return el.post_data.ID === id;
      });
      return found;  
  }

  _handleAddToMyOffers = async (item) => {

    const {user} = this.props;
    if(user.user_meta.subscribed == 'false'){
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
                source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
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
            
            <View enabled style={{ flex:1 }}>
              <View style={styles.modalStyle}>
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

              {
                (!this.state.expired)
                ?
                  <Button full onPress = { () => this._handleAddToMyOffers(this.state.offer) } >
                    <Text>{ screenProps.lang.offerScreen.getBtnMessage }</Text>
                  </Button> 
                :
                  <Button danger full onPress={() => { this._toggleModal(!this.state.modalVisible, null) }}  >
                    <Text>{ screenProps.lang.offerScreen.expiredMessage }</Text> 
                  </Button>
              }

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
    //color: 'red'
  }

});


const mapStateToProps = state => {
	const { user, offerList } = state;
	return { user: { ...user, ...user.user }, offerList };
};

export default connect(mapStateToProps, { fetchOffersDataSource, saveOffer })(Oferta);
