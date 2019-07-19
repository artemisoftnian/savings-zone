import * as React from 'react';

import {
  View,
  StyleSheet,
  RefreshControl, AsyncStorage
} from 'react-native';

import { connect } from 'react-redux';
import { fetchOffersDataSource, saveOffer } from './reducer'; 

import { Text,  Button,  Icon } from 'native-base';

import MainWrapper from '../../components/MainWrapper'; 
let appInfo = require('../../build.json') 


class MerchantHomeScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      loading: false,
      error: '',
      user: [],
      modalVisible:false,
      title:'No Data',
      image: '',
      daysRemain:0,
      desc:'No Data',
      pirice:'0.00',
      subscribed: true, //cambiar a false antes de publicar
      result: [],
      dataSource: [],
			filter: '',
			offlineData: [],
			refreshing: false,
			isConnected: true,
			start: false,
      selected: "key1"
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
    //this.props.fetchOffersDataSource();
    //this.arrayholder = this.props.offerList.dataSource;
    //this.setState({ start: true, dataSource: this.props.offerList.dataSource });
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

  _handleLogOut = async () => {
    try {
        AsyncStorage.removeItem('user_data', () => {
          this.props.navigation.navigate('Auth');
        });
        return true;
      } catch (exception) {
        return false;
      }
  };  

  render() {

    const { navigate } = this.props.navigation; 

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
        onScanPress={() => this.props.navigation.navigate('Scanner', {'destiny':'MerchantHome'} )} 
        rightIcon = 'md-qr-scanner'
        view='horizontal'
        searchFunction = {this.handleSearchFilter}
        nav = { this.props.navigation }     
        refreshFunction={
          <RefreshControl
            refreshing={this.state.refreshing} 
            onRefresh={()=> this.refreshOffers() }
          />
        }
        showFooter={false}         
      > 
      <Text style={{margin:20, marginBottom:5, flex:1, textAlign:'center', fontSize:20}} >Merchant Tools</Text>
      <Text style={{marginTop:5, flex:1, textAlign:'center', fontSize:15}} >{this.props.user.merchant_meta.merchant_name}</Text> 
      <View testID="merchantView" style={{margin:20, flex:1}}>
          <Button 
            testID="btnScan"          
            iconLeft full bordered rounded success 
            style={{margin:10, flex:1}}
            onPress={() => this.props.navigation.navigate('Scanner', {'destiny':'MerchantHome'} )}
          >
            <Icon name='md-qr-scanner' />
            <Text>Redeem Offers</Text>
          </Button>
          <Button
            testID="btnStats"
            iconLeft full bordered rounded primary
            style={{margin:10, flex:1}} 
            onPress={() => this.props.navigation.navigate('MerchantStats')}
          >
            <Icon name='md-stats' />
            <Text>Stats</Text>
          </Button>

          <Button 
            testID="btnExit"
            iconLeft full bordered rounded warning
            style={{margin:10, flex:1}} 
            onPress={ ()=>{ this._handleLogOut() } }
          >
            <Icon name='exit' />
            <Text>Log Out</Text>
          </Button>
                 
      </View>     
       <Text style={{fontSize:9, textAlign:'center', color:'gray'}}>r.{appInfo.version}.{appInfo.build}.{appInfo.jsBuildNumber}</Text>
       <Text style={{fontSize:9, textAlign:'center', color:'gray'}}>m({this.props.user.merchant_meta.merchant_id}).({this.props.user.merchant_meta.user_id})</Text>
       
      </MainWrapper>
    );
  }
}

const styles = StyleSheet.create({  

});


const mapStateToProps = state => {
	const { user, offerList } = state;
	return { user: { ...user, ...user.user }, offerList };
};

export default connect(mapStateToProps, { fetchOffersDataSource, saveOffer })(MerchantHomeScreen);
