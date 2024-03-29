import * as React from 'react';

import { FlatList, ActivityIndicator, View, StyleSheet, TouchableHighlight,  
  Modal, Alert,  RefreshControl, Image, InteractionManager, Dimensions, } from 'react-native';

import { Toast} from 'native-base'; 

import { connect } from 'react-redux';
import { fetchOffersDataSource, fetchOffersRemains,  saveOffer } from './reducer';

import { Text, Button,  Icon, Picker, Form, Root }  from 'native-base';

import Constants from 'expo-constants';

import MainWrapper from '../../components/MainWrapper';
import OfferInfo from '../../components/OfferInfo';
import OfferPoster from '../../components/OfferPoster';
import AwesomeAlert from 'react-native-awesome-alerts';
import helpers from '../../components/helpers';

const dim = Dimensions.get('window');

class Offers extends React.Component {

  remainIntervalID = 0;
  remainIntervalTimer = 5000;
  updateTimeout;
  pathService = `${global.wpSite}/wp-json/svapphelper/v2/offers/remain`; 

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      loading: false,
      error: '',
      user: [],
      modalVisible:false,
      title:'No Data',
      image:'https://via.placeholder.com/300x150.jpg/282463/FFFFFF?text=Savings+Zone',
      daysRemain:0,
      desc:'No Data',
      pirice:'0.00',
      subscribed: false, //Scar esta info del usuario
      result: [],
      dataSource: [],
			filter: '',
      offlineData: [],
      remainOffers: this.props.offerList.remainDataSource,
			refreshing: false,
			isConnected: true,
			start: false,
      selected: "*",
      alertType: 'got',
      expired: false,
      isFetching: false ,
      showAlert: false 
    };

    this.changeState = this.changeState.bind(this);

  }

  arrayholder = [];
  
  static navigationOptions = {
    title: 'Offer List',
    header: null,
  };  

   //await AsyncStorage.removeItem('user')
  async componentWillMount() {
    const { user_id } = this.props.user;
    this.props.fetchOffersDataSource();
    this.arrayholder = this.props.offerList.dataSource;
    this.setState({ start: true, dataSource: this.props.offerList.dataSource });
    //this.remainIntervalID = setInterval( ()=> this.noReduxRemains() , this.remainIntervalTimer); 
  }

  
  componentWillUnmount() {
    clearInterval(this.remainIntervalID); 
    clearTimeout(updateTimeout);
  }

  async componentDidMount() {
    //console.log("componentDidMount");
    //this.setState({ start: true });
    //Check Remains Offers Every X timeexp
    //this.updateMessages(); 
      
  }


  noReduxRemains = async () => {

    this.counter++;
    console.log(this.counter, 'isFetching', this.state.isFetching );
      
      if(this.state.isFetching == false){

        try{
          //clearInterval(this.remainIntervalID);
         this.setState({ isFetching:true});

         test = await this.props.fetchOffersRemains().then(this.setState({ isFetching:false}));        
         console.log('corrida', this.counter, this.props.offerList.remainDataSource);  
        }
        catch(e){
          console.log(e.message);
        }
        finally{
          //this.updateTimeout = setTimeout(this.noReduxRemains, this.remainIntervalTimer);
        }     
      
      }
      else{
        return false;
      }
  }


  counter = 0;

  remainOffers = async () => {
    this.counter++;
    InteractionManager.runAfterInteractions(async () => {
      try{
        clearInterval(this.remainIntervalID);
        test = await this.props.fetchOffersRemains();
        //this.setState({ remainOffers: this.props.offerList.remainDataSource})
        console.log('lo que hay', this.counter, this.state.remainOffers)
      }
      catch(e){
        console.log(e.message);
      }
      finally{
        this.remainIntervalID = setInterval( async ()=> await this.remainOffers() , this.remainIntervalTimer);
      }    
    });    

  }



	refreshOffers = async () => {
		this.setState({ isLoading: false, dataSource: null }); 
		this.fetchOfferData();
	};

  fetchOfferData = async () => {
    console.log("refreshing...");
    const { user_id } = this.props.user;
    await this.props.fetchOffersDataSource();
    this.arrayholder = this.props.offerList.dataSource;
    this.setState({ start: true, dataSource: this.props.offerList.dataSource }); 
    console.log(this.arrayholder);
    
  }

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
    if( user.user_meta.app_subscribed == 'false' || !user.user_meta.app_subscribed ){ 
        // Works on both iOS and Android
        this.showAlert('unsubscribed'); 
    }
    else{  
      if( this._checkOfferOwnership(item.post_data.ID) ) {           
        
        Toast.show({
            text: "You Alaready Have This Offer!",
            buttonText: "Ok!",
            duration: 3000,
            type: "danger"
        })

        return;
      }

      await this.props.saveOffer(item);
      //this._toggleModal(false, null)
      this.showAlert('got');
    }
    
  }

  showAlert = async (type) => {
    await this.setState({ showAlert: true, alertType:type });
    console.log('Offer AlertData:', this.state.showAlert, this.state.alertType);
  }

  changeState = async (navigate) => { 
    console.log("acativado");
    this.setState({ showAlert: false }) 
    //Go to view if needed
    if(navigate)
      this.props.navigation.navigate(navigate)
  }

  alertContents = () => {
      const {alertType} = this.state; 
      const { screenProps } = this.props;

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
              <Button small full transparent
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

  _toggleModal = (data, expired = false) => {

    console.log(data);

    if(data){
      console.log(data);
      this.setState({ 
        //modalVisible: visible,
        modalVisible: false,
        title: data.post_data.post_title,
        desc:  data.post_data.post_content,
        price: data.post_meta.offer_price,
        image: [data.post_meta.offer_image_1, data.post_meta.offer_image_2, data.post_meta.offer_image_3, data.post_meta.offer_image_4 ],
        offer: data,
        daysRemain: this._getDaysRemain(data.post_meta.offer_exp_date),
        expired: expired
      });

     this.props.navigation.navigate('Oferta',{'offer':data})

    }

  }

  _openOffer = async (data, expired = false) => {

    if(data){

      var estaOferta = {
        modalVisible: false,
        title: data.post_data.post_title,
        desc:  data.post_data.post_content,
        price: data.post_meta.offer_price,
        image: [data.post_meta.offer_image_1, data.post_meta.offer_image_2, data.post_meta.offer_image_3, data.post_meta.offer_image_4 ],
        offer: data,
        daysRemain: this._getDaysRemain(data.post_meta.offer_exp_date),
        expired: expired       
      } 

      this.props.navigation.navigate('Oferta',{'offer': estaOferta})

    }

  }

  handleSearchFilter = (text) => {
    this.setState({ filter: text, selected:'*' });
  }  

  getDataSourceFilter = () => {
    const { selected, filter } = this.state;
    const { dataSource } = this.props.offerList;

    if (!filter && selected === "*") return dataSource;    

		if(selected && !filter){
      return dataSource.filter(item => {
        const itemData = `${item.taxonomy[0]['category_nicename'].toUpperCase()}`;
        const textData = selected.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
    }
    else{
        return dataSource.filter(item => {
        const itemData = `${item.post_data['post_title'].toUpperCase()}`;
        const textData = filter.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });   
    }
	}

  onValueChange(value) {
    this.setState({ selected: value, filter: null });
  } 

  emptyComponent =() => {
    return(
      <View style={styles.emptyContainer}>
        <Text  style={styles.emptyActionText} >Arrastre el cohete hacia abajo para refrescar</Text>
        <View style={styles.CircleShapeView}>
          <Icon  style={[styles.emptyIcon, {marginLeft:45, marginTop:20}]} name='md-rocket' type='Ionicons'/>
        </View>
        <Text  style={styles.emptyText} >Estamos localizando nuevas ofertas para usted.</Text>        
      </View>
    )
  }
  
  render() {
    const {showAlert, alertType, remainOffers} = this.state;
    const { loading, dataSource, remainDataSource } = this.props.offerList;
    const getDataSourceFilter = this.getDataSourceFilter();
    const { navigate } = this.props.navigation; 
    const { screenProps } = this.props;

		if (this.state.start === false) {
			return (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<ActivityIndicator />
				</View>
			);
		}    

    let renderList = null;
    
    if(this.state.dataSource){
      renderList = this.state.dataSource;
      if(renderList.code == "no_posts")
        renderList = null;
      else
        renderList = this.state.dataSource;
    }    

    return (
      <MainWrapper
        //title="Savings Zone"
        onScanPress={() => this.props.navigation.navigate('MyOffers')} 
        view='horizontal'
        useSearchBar
        searchFunction = {this.handleSearchFilter}
        nav = { this.props.navigation }        
        refreshFunction={
          <RefreshControl
            refreshing={this.state.refreshing} 
            onRefresh={()=> this.refreshOffers() } 
          />
        } 
        lang={screenProps.lang}
        alertType = { alertType }
        showAlert = { this.state.showAlert }   
        changeState = { this.changeState }          
      >
      
      <FlatList
        style={{minHeight: dim.height}}
        testID="offersView"
        ListEmptyComponent = { this.emptyComponent() }
        ListHeaderComponent={  
          <View>
            <View style={{flexDirection:"row"}}>
                <View style={{flex:2}}>
                    <Text adjustsFontSizeToFit numberOfLines={1} style={styles.offerListTitle}> 
                      <Icon name='md-pricetags' type='Ionicons'/> {screenProps.lang.offerScreen.offerListTitle}
                    </Text>
                </View>
                <View style={{flex:1}}>
                      <Form>
                        <Picker note
                          mode="dropdown"
                          style={{ width: 120 }}
                          selectedValue={this.state.selected}
                          onValueChange={this.onValueChange.bind(this)}
                        >
                          <Picker.Item label={screenProps.lang.offerScreen.categoryPicker.todos} value="*" />
                          <Picker.Item label={screenProps.lang.offerScreen.categoryPicker.belleza} value="belleza" />
                          <Picker.Item label={screenProps.lang.offerScreen.categoryPicker.entretenimiento} value="entretenimiento" />
                          <Picker.Item label={screenProps.lang.offerScreen.categoryPicker.escapadas} value="escapadas" />
                          <Picker.Item label={screenProps.lang.offerScreen.categoryPicker.restaurantes} value="restaurantes" />
                          <Picker.Item label={screenProps.lang.offerScreen.categoryPicker.servicios} value="servicios" />
                          <Picker.Item label={screenProps.lang.offerScreen.categoryPicker.viajes} value="viajes" />                              
                        </Picker>
                      </Form> 
                </View>
            </View>                
          </View>
        }
          
        data={getDataSourceFilter}
        numColumns={2}        
        extraData={this.state}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          //console.log( (getDataSourceFilter.length % 2 == 0 ))
          return (                        
            <OfferPoster
              offer={item}
              testID={"offer_"+index.toString()}
              _isLast = {getDataSourceFilter.length-1 == index}
              _isEven = {getDataSourceFilter.length%2 == 0}
              _handleAddToMyOffers={this._handleAddToMyOffers}
              _openOffer = {this._openOffer}
              _getDaysRemain={this._getDaysRemain}
              lang = { this.props.screenProps.lang.offerScreen }
            />
          )
        }}
      />

      </MainWrapper>
    );
  }
}

const styles = StyleSheet.create({
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


const mapStateToProps = state => {
	const { user, offerList } = state;
	return { user: { ...user, ...user.user }, offerList };
};

export default connect(mapStateToProps, { fetchOffersDataSource, fetchOffersRemains,  saveOffer })(Offers);
