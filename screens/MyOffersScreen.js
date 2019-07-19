import * as React from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableHighlight, 
  Modal,
  ListView,
  Dimensions
} from 'react-native'; 

import {Permissions, Notifications , Constants} from 'expo';

import QRCode from 'react-native-qrcode';
import { Toast,  Thumbnail,  Text,  Button,  Icon,   SwipeRow } from 'native-base';

import MainWrapper from '../components/MainWrapper';

import { removeOffer } from './Offers/reducer';
import { connect } from 'react-redux';
const SCREEN_HEIGHT = Dimensions.get("window").height;

import { merchantRedeemOffer } from './Merchant/reducer';

const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';


class MyOffersScreen extends React.Component {

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      isLoading: true,
      loading: false,
      error: null,
      user: [],
      qrData: 'http://www.savinszonepr.com',
      modalVisible:false,
      basic: true,
      listViewData: this.props.offerList.offlineDataSource,
      debug: true,
      returnMessage: 'mensaje returno aqui',
      notification: {},
    };

    this.offlineUserOffers = [];
  }

  static navigationOptions = {
    title: 'Offer List',
    header: null,
  };  

  taskListurl = global.wpSite + '/wp-json/apphelper/v2/tasks';

  async componentWillMount() {
    this.setState({myOffers: this.props.offerList.offlineDataSource });   

  }

  async componentDidMount() {
    let token = await Notifications.getExpoPushTokenAsync();
    this.setState({userPushToken: token });
    console.log('expo notification token', this.state.userPushToken);

    this.checkOrFetchData();
  }

  checkOrFetchData = async () => {
    this.setState({ isLoading: false, dataSource: this.props.offerList.offlineDataSource });
  };

  deleteRow(secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();
    const newData = [...this.state.listViewData];
    newData.splice(rowId, 1);
    this.setState({ listViewData: newData });
  }

  _removeLocalOfferHandler = async (item) => {
    var before = this.props.offerList.offlineDataSource.length;
    await this.props.removeOffer(item);
    var after = this.props.offerList.offlineDataSource.length;
    this.setState({myOffers: this.props.offerList.offlineDataSource});

    Toast.show({
      text: "Offer Removed!",
      duration: 4000,
      type: "success"
    })    

  }



  _toggleModal = (visible, data) => {


    if(data){
      console.log('merchant_ID', data.post_meta.offer_merchant_id);

      var qrData = {
        "redemption_user_id":  this.props.user.user.user_id,
        "redemption_offer_id": data.post_data.ID,
        "redemption_date_time": Date.now(),
        "merchant_id": data.post_meta.offer_merchant_id,
        "token": this.state.userPushToken
      }

      this.setState({ 
        modalVisible: visible,
        qrData: qrData
       // daysRemain: this._getDaysRemain(data.post_meta.offer_exp_date) //data.remain
      });
    }
    else{
      this.setState({  modalVisible: visible });      
    }

  } 
  
  
  render() {

    const { navigate } = this.props.navigation;
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const {screenProps} = this.props;

    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }    

    return (
      
      <MainWrapper
        onScanPress={() => this.props.navigation.navigate('MyOffers')}
        view='horizontal'
        nav = { this.props.navigation }
        lang = {screenProps.lang}
      >       

      <FlatList 
        testID="myOffersView"
        ListEmptyComponent={

            (this.props.user.user.user_meta.app_subscribed === "true")?
              <View style={styles.emptyContainer}>
                <Icon  style={styles.emptyIcon} name='alert' type='Ionicons'/>
                <Text  style={styles.emptyText} >{screenProps.lang.myOffers.emptyListMessage}</Text>
              </View>
            :
              <View style={[styles.emptyContainer,{margin:20}]}>
                <Icon name='alert' style={{fontSize: 100, color: '#939393'}}/>
                <View style={[{margin:20, borderWidth:1, borderColor:'purple', borderRadius:15, padding:10}]}>
                  <Text style={{textAlign:'center'}} >{'\u2022'}{this.props.screenProps.lang.offerScreen.noSubscriptionMsg.h2}</Text>
                  <Button small block dark 
                    testID="gotoSubscription"
                    style={{marginTop:10, marginBottom:5}} 
                    onPress = { ()=>{ this.props.navigation.navigate('Subscription') }  } >                           
                    <Text style={{}}>{this.props.screenProps.lang.offerScreen.noSubscriptionMsg.confirm}</Text>               
                  </Button>
                </View>
              </View>
        }
        contentContainerStyle={[ { flexGrow: 1 } , this.state.myOffers.length ? null : { justifyContent: 'center'} ]}
        ListHeaderComponent={ () => {
            if(!this.state.myOffers.lenght)
              return null
            else
              return <Text style={{fontSize: 20, fontWeight:'bold'}}> <Icon name='md-pricetags' type='Ionicons'/> My Offers</Text>
          } 
        }

        data={this.state.myOffers}
        extraData={this.state}
        style={{ marginTop:30}}
        keyExtractor={(item, index) => index.toString()}
        renderItem={ ( {item} ) => {
            return (
              <SwipeRow
                key={"row_id_"+item.post_data.ID}
                leftOpenValue={75}
                rightOpenValue={-75}
                style={{margin:0, padding:0}}
                left={
                  <Button success onPress={() => this._toggleModal(true, item) }>
                    <Icon active name="cart" />
                  </Button>
                }
                body={
                  <View style={{flexDirection:"row", alignItems: 'stretch', justifyContent: 'center'}}>
                  
                    <View style={{flex:1}}>
                      <Thumbnail small style={{marginLeft:10}} source={{uri: item.post_meta.offer_image_1 , cache: 'force-cache'}} />  
                    </View>

                    <View style={{flex:8}} >
                      <Text style={{marginTop:8, paddingLeft:5}}  ellipsizeMode='tail' numberOfLines={1} > {item.post_data.post_title}</Text>
                    </View>   

                  </View>
                }
                right={
                  <Button danger 
                  onPress={ () => this._removeLocalOfferHandler(item) }
                  >
                    <Icon active name="trash" /> 
                  </Button>
                }
              />
            );
          }}
      />


        {/*REDEMTION MODAL*/}


        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          animationType="slide"
          style={{margin:15}}
          onRequestClose = {() => console.log("closing modal now!")} 
          avoidKeyboard={false}
          hardwareAccelerated={true}
          >

            <View enabled style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={[styles.modalStyle]} >               
              
                <TouchableHighlight
                  onPress={() => { this._toggleModal(!this.state.modalVisible, null) }} 
                  style={{ justifyContent:'center', flexDirection:'row',  zIndex:1  }}>
                  <Icon name="md-close-circle"  style={{color:'black', padding:20}}/> 
                </TouchableHighlight>

                <Text style={{textAlign:'center', fontSize:18}}>{screenProps.lang.myOffers.redeemMessage}</Text>
                

              <View style={[ {flex:1, alignItems: 'center', justifyContent: 'center', overflow:'hidden'} ]}>             

                <QRCode
                    value={JSON.stringify(this.state.qrData)} 
                    size={300}
                    bgColor='purple'
                    fgColor='white'
                />

              </View>
            </View>
          </View>
        </Modal>


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
  emptyContainer: {    
    flex:1,
		alignItems: 'center',
    justifyContent: "center",
    height: SCREEN_HEIGHT - 90 - Constants.statusBarHeight , //responsible for 100% height, 
	},
  emptyIcon:{
    color:'#c6c6c6',
    fontSize:100
  },
  emptyText:{
    fontSize:30,
    color:'#c6c6c6',
    fontWeight:'bold',
    
		justifyContent: 'center', 
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 0.5},
    textShadowRadius: 10   
  }
});


const mapStateToProps = state => {
	const { user, offerList, merchant } = state;
	return { user: { ...user, ...user.user }, offerList, merchant };
};

export default connect( mapStateToProps, { removeOffer, merchantRedeemOffer } )(MyOffersScreen);
