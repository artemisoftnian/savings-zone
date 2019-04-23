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

import {Constants} from 'expo';

import QRCode from 'react-native-qrcode';
import { Toast,  Thumbnail,  Text,  Button,  Icon,   SwipeRow } from 'native-base';

import MainWrapper from '../components/MainWrapper';

import { removeOffer } from './Offers/reducer';
import { connect } from 'react-redux';
const SCREEN_HEIGHT = Dimensions.get("window").height;

import { merchantRedeemOffer } from './Merchant/reducer';


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
      returnMessage: 'mensaje returno aqui'
    };

    this.offlineUserOffers = [];
  }

  static navigationOptions = {
    title: 'Offer List',
    header: null,
  };  

  taskListurl = global.wpSite + '/wp-json/apphelper/v2/tasks';

  async componentWillMount() {
    this.setState({myOffers: this.props.offerList.offlineDataSource});
  }

  async componentDidMount() {
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

      var qrData = {
        "redemption_user_id":  this.props.user.user.user_id,
        "redemption_offer_id": data.post_data.ID,
        "redemption_date_time": Date.now()
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

  testRedem = async (data) => {
    var test = await this.props.merchantRedeemOffer(data);
    this.setState({returnMessage: this.props.merchant.message})
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
        ListEmptyComponent={

            (this.props.user.user.user_meta.app_subscribed === "true")?
              <View style={styles.emptyContainer}>
                <Icon style={styles.emptyIcon} name='alert' type='Ionicons'/>
                <Text style={styles.emptyText} >{screenProps.lang.myOffers.emptyListMessage}</Text>
              </View>
            :
              <View style={[styles.emptyContainer,{margin:20}]}>
                <Icon name='alert' style={{fontSize: 100, color: '#939393'}}/>
                <View style={[{margin:20, borderWidth:1, borderColor:'purple', borderRadius:15, padding:5}]}>
                  <Text style={{textAlign:'center'}} >{this.props.screenProps.lang.offerScreen.noSubscriptionMsg.h2}</Text>
                  <Button small full transparent warning 
                    style={{marginTop:1}} 
                    onPress = { ()=>{ this.props.navigation.navigate('Subscription') }  } >                           
                    <Text style={{textDecorationLine:'underline', color:'purple'}}>{this.props.screenProps.lang.offerScreen.noSubscriptionMsg.confirm}</Text>               
                  </Button>
                </View>
              </View>
        }
        contentContainerStyle={[ { flexGrow: 1 } , this.state.myOffers.length ? null : { justifyContent: 'center'} ]}
        ListHeaderComponent={ () => {
          if(!this.state.myOffers.lenght)
            return null
          else
            return <Text  style={{fontSize: 20, fontWeight:'bold'}}> <Icon name='md-pricetags' type='Ionicons'/> My Offers</Text>
        }
          
            
        }

        data={this.state.myOffers}
        extraData={this.state}
        style={{ marginTop:30}}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item}) => {
            var id = item.post_meta.ID;
            return (

            <SwipeRow
                key={"item_id_"+item.post_meta.ID}
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
                      <Thumbnail small style={{marginLeft:10}} source={{uri: item.post_meta.offer_image_1}} />  
                    </View>

                    <View style={{flex:8}} >
                      <Text style={{marginTop:8, paddingLeft:5}}  ellipsizeMode='tail' numberOfLines={1} > {item.post_data.post_title}</Text>
                    </View>   

                  </View>
                }
                right={
                  <Button danger 
                  //onPress={() => alert('Trash')}
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
          avoidKeyboard={true}>

          <View enabled style={{ flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={styles.modalStyle}>

              <TouchableHighlight
                onPress={() => { this._toggleModal(!this.state.modalVisible, null) }} 
                style={{margin:5,alignItems:'center',
                justifyContent:'center', flexBasis:25, height:25, alignSelf:'flex-end' }}>
                <Icon name="md-close-circle"  color={'#999'}/>
              </TouchableHighlight>

              <View style={styles.container}>
              
                <QRCode
                  value={JSON.stringify(this.state.qrData)}
                  size={200}
                  bgColor='purple'
                  fgColor='white'/>

                  <Button full success 
                    onPress = { () => this.testRedem(this.state.qrData) } >
                    <Text>Test Redemption Here</Text>
                  </Button>  
                  <Text>{this.state.returnMessage}</Text>

              </View>
            </View>
          </View>
        </Modal>
      </MainWrapper>
    );
  }
}


const styles = StyleSheet.create({
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
