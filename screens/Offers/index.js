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

class Offers extends React.Component {

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
			refreshing: false,
			isConnected: true,
			start: false,
      selected: "*",
      showAlert: false,
      alertType: 'got',
      expired: false    
    };

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

  }

  async componentDidMount() {
    //this.setState({ start: true });
  }

	refreshOffers = async () => {
		this.setState({ isLoading: false, dataSource: null }); 
		this.fetchOfferData();
	};

  fetchOfferData = async () => {
    console.log("refreshing...");
    const { user_id } = this.props.user;
    this.props.fetchOffersDataSource();
    this.setState({ start: true, dataSource: this.props.offerList.dataSource });
    this.arrayholder = this.props.offerList.dataSource;
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
    if(user.user_meta.subscribed == 'true'){
        // Works on both iOS and Android
        this.showAlert('unsubscribed');
    }
    else{  

      if( this._checkOfferOwnership(item.post_data.ID) ) {           
        
        Toast.show({
            text: "You Alaready Have This Offer!",
            buttonText: "Ok!",
            duration: 4000,
            type: "danger"
        })

        return;
      }

      await this.props.saveOffer(item);
      //this._toggleModal(false, null)
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
      //console.log("llego aqui");
      return dataSource.filter(item => {
        //console.log(selected, item.taxonomy[0]['category_nicename']);
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
  
  /*

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

  */

  render() {
    const {showAlert} = this.state;
    const { loading, dataSource } = this.props.offerList;
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
        onScanPress={() => this.props.navigation.navigate('Scanner')}
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
      > 
      <FlatList
        ListHeaderComponent={  
          <View>
            <View style={{flexDirection:"row"}}>
                <View style={{flex:2}}>
                    <Text style={styles.offerListTitle}> 
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

          
        //data={ renderList } 
        data={getDataSourceFilter}
        numColumns={2}        
        extraData={this.state}
        keyExtractor={(item, index) => item.id}     
       
        renderItem={({ item }) => {
          return (
                        
            <OfferPoster
              offer={item}
              _handleAddToMyOffers={this._handleAddToMyOffers}
              _openOffer = {this._openOffer}
              _getDaysRemain={this._getDaysRemain}
              lang = { this.props.screenProps.lang.offerScreen }
            />

          );
        }}
      />

        {/*INFO BOX - MODAL
        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          animationType="slide"
          style={{}}
          onRequestClose = {() => {this.renderModalContent()}} 
          avoidKeyboard={true}
          >
          {this.renderModalContent()} 
        </Modal>
        */}

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
  }

});


const mapStateToProps = state => {
	const { user, offerList } = state;
	return { user: { ...user, ...user.user }, offerList };
};

export default connect(mapStateToProps, { fetchOffersDataSource, saveOffer })(Offers);
