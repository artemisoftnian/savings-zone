import * as React from 'react';
import { View, Root, Icon, Button, Text,Toast} from 'native-base';
import { Constants, MapView , Location, Permissions } from 'expo';
import { StyleSheet, Platform, Linking, Modal, TouchableHighlight, Alert } from 'react-native';

import { connect } from 'react-redux';

import OfferInfo from '../../components/OfferInfo';

const demoMarkers = [
    { latlng : { latitude: 18.408464,  longitude: -66.064522 } , title :'Walgreens', description : 'test description 1'},
    { latlng : { latitude: 18.399943,  longitude: -66.069321 } , title :'Cosvi', description : 'test description 2'},
    { latlng : { latitude: 18.403804,  longitude: -66.069565 } , title :'Inter Metro', description : 'test description 3'},
    { latlng : { latitude: 18.403340,  longitude: -66.063995 } , title :'Col. Sagrado Corazon', description : 'test description 4'},
    { latlng : { latitude: 18.407962,  longitude: -66.061978 } , title :'Schotia Bank', description : 'test description 5'},
]

const offerMarkers = [];

class MapScreen extends React.Component { 

  constructor(props) {
    super(props);

    // <MapView.Marker coordinate='18.429389, -66.070311' />
    this.state = {
      mapRegion:{ latitude: 18.406680, longitude: -66.066754, latitudeDelta: 0.01,  longitudeDelta: 0.01 },
      markers: demoMarkers,
      //mapRegion: null,
      hasLocationPermissions: false,
      locationResult: null,
      //offer modal view
      modalVisible:false,
      title:'No Data',
      image: 'https://via.placeholder.com/300x150.jpg/282463/FFFFFF?text=Savings+Zone',//require('../../assets/offer_img/300x150.png'),
      daysRemain:0,
      desc:'No Data',
      pirice:'0.00',
      debugData: '',
    }; 

  }

  static navigationOptions = {
    title: 'Caza Ofertas',
  };  

  componentDidMount() {
    this._getLocationAsync();
    this.getOfferMarkers(); 
  }

  componentWillUnmount() {
    //this.setState({ mapRegion:null, debugData:'' });
    
  }

  _handleMapRegionChange = mapRegion => {
    //console.log(mapRegion);
    this.setState({ mapRegion, debugData:mapRegion });
  };

  _handlePressDirections = (data) => {

    //console.log(data);

      let coords = `${data.latitude},${data.longitude}`;

      if (Platform.OS === 'ios') {
        Linking.openURL(`http://maps.apple.com/?daddr=${coords}`);
      } else {
        Linking.openURL(`http://maps.google.com/?daddr=${coords}`);
      }

  }

  _handleAddToMyOffers = async (item) => {

    if(!this.state.subscribed){
        // Works on both iOS and Android
        Alert.alert(
          'Subscription Alert!',
          'Sorry! You are on Test Drive:  You need a real plan to redeem offers',
          [
            {text: 'Get a real plan here!', onPress: () => this.props.navigation.navigate('Subscription') }, 
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}
          ],
          { cancelable: false }
        )  

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

  _getDaysRemain = (expiration_date) => {
    var today = new Date().getTime();
    var exp = new Date(expiration_date).getTime();
    return parseInt( (( exp - today ) / (1000 * 60 * 60 * 24)) + 2 ); 
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      this.setState({
        //locationResult: 'Permission to access location was denied',
      });
    } else {
      //this.setState({ hasLocationPermissions: true });
    }

    if(this.state.locationResult === null){
      //this.setState({debugData: 'Finding your current location...'})  
    }

    if(this.state.hasLocationPermissions === false){
      //this.setState({debugData: 'Location permissions are not granted.'})  
    }

    if(this.state.mapRegion === null){
      //this.setState({debugData: "Map region doesn't exist."}) 
    }    

    let location = await Location.getCurrentPositionAsync({});
    //this.setState({ locationResult: JSON.stringify(location) });
    
    // Center the map on the location we just fetched.
    //this.setState({mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }});//latitudeDelta: 0.0922, longitudeDelta: 0.0421 }});
  }; 

  renderMap = () => {

    const{ locationResult, hasLocationPermissions, mapRegion, markers} = this.state;

    //else{

      //this.getOfferMarkers();

      return (
        <MapView
          style={{ alignSelf: 'stretch', height: '100%', zIndex: -1 }}
          initialRegion={mapRegion}        
          onRegionChange={this._handleMapRegionChange}
        >
          {
            [
              <MapView.Marker
                key="me-car-hunting-offers"
                coordinate={mapRegion}
                title={"I'ts me Ma...?"}
                description={'In the hunt for offers!'}
                image={require('../../assets/icons/szCarMarker.png')}
              />,

              offerMarkers.map( (item, index) => (
                <MapView.Marker
                  key={index.toString()}
                  coordinate={item.latlng}
                  title={item.title}
                  description={item.description}
                  image={require('../../assets/icons/szMapMarker.png')}
                  //onCalloutPress={() => { this._handlePressDirections(item.latlng) } }
                  onCalloutPress={() => { this._toggleModal(!this.state.modalVisible, item.offer) }}
                />
              ))
              
            ]
          }

        </MapView> 
      )
    //}
};

getOfferMarkers = () => {

  var offers = this.props.offerList.dataSource;

  if(offers){

    for(var i in offers) {
      var item = offers[i];
      var coors = this.getCoordinates(item.post_meta.offer_location);

      if(coors){
        var title = item.post_data.post_title;
        var marker = { latlng : { latitude: coors.latitude,  longitude: coors.longitude } , title : title.substring(0,30) , description : "ver oferta", offer: item};
        offerMarkers.push( marker);
      }

    }

  }


}

getCoordinates = (data) => {

  if( data != undefined ){
    var coors = data.split(',');
    return { latitude: parseFloat(coors[0]),  longitude: parseFloat(coors[1]) };
  }

}

renderModalContent = () => {
  const {screenProps} = this.props;

  if(this.state.modalVisible){
    return (
        <Root>
          <View enabled style={{ flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={styles.modalStyle}>

                <TouchableHighlight
                  onPress={() => { this._toggleModal(!this.state.modalVisible, null) }} 
                  style={{  
                            alignItems:'center', justifyContent:'center', flexDirection:'row',
                            height:30, backgroundColor: '#393863', overflow:'visible'
                        }}>

                  <Icon name="chevron-down" type="FontAwesome"  style={{color:'white', backgroundColor:'purple', padding: 20, borderRadius:50}}/>                   
                </TouchableHighlight>
              
              <OfferInfo 
                title={this.state.title}
                image={this.state.image}
                desc={this.state.desc}
                price={this.state.price}
                daysRemain={this.state.daysRemain}
                lang = { screenProps.lang.offerScreen }
              />

              {
                  ( !this.state.expired ) ?
                    <Button full onPress = { () => this._handleAddToMyOffers(this.state.offer) } >
                      <Text>{ screenProps.lang.offerScreen.getBtnMessage }</Text> 
                    </Button> 
                  :
                    <Button danger full onPress={() => { this._toggleModal(!this.state.modalVisible, null) }}  >
                      <Text>{ screenProps.lang.offerScreen.expiredMessage }</Text> 
                    </Button>
              }
              
            </View>

          </View>
        </Root>
    );
  }
  else{
    return(
      <View style={styles.modalStyle} /> 
    )
  }

};   


_toggleModal = (visible, data, expired = false) => {

  if(data){
    this.setState({ 
      modalVisible: visible,
      title: data.post_data.post_title,
      desc:  data.post_data.post_content,
      price: data.post_meta.offer_price,
      image: data.post_meta.offer_image_1,
      offer: data,
      daysRemain: this._getDaysRemain(data.post_meta.offer_exp_date), //data.remain
      expired: expired
    });
  }
  else{
    this.setState({ modalVisible: visible });      
  }

}

  // Render any loading content that you like here
  render() {
    
    return (
      <View style={styles.container2}>

        <Text style={{
              position: 'absolute',
              width:'100%',
              height: 20,
              top: 10,
              left: 10,
              zIndex: 10,
              textAlign:'center'
        }}>Las Zonas Mas Cercanas</Text>

        <Text style={{
              position: 'absolute',
              width:'95%',
              height: 80,
              bottom: 20,
              left: 10,
              zIndex: 10,
              textAlign:'center',
              backgroundColor:'#0000001a',
              borderRadius:10
        }}>{JSON.stringify(this.state.debugData)}</Text>        

        {this.renderMap()}       

        {/*INFO BOX - MODAL*/}
        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          animationType="slide"
          style={[ styles.modalStyle, StyleSheet.absoluteFill ]} 
          onRequestClose = {() => {this.renderModalContent()}} 
          avoidKeyboard={true}
          >
          {this.renderModalContent()} 
        </Modal>

      </View>
    );
  }  

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //paddingTop: Constants.statusBarHeight-50,
    backgroundColor: '#ecf0f1',
  },
  container2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {    
    
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
    backgroundColor: 'transparent'
  }, 
  modalStyle:{
    backgroundColor:'#fff', 
    flex:1, 
    borderRadius: 0,
    margin:0,
    marginTop:60, 
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
  }   
});


const mapStateToProps = state => {
	const { user, offerList } = state;
	return { user: { ...user, ...user.user }, offerList };
};

export default connect(mapStateToProps)(MapScreen);
