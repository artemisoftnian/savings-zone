import * as React from 'react';

import {
  View,
  StyleSheet,
  AsyncStorage, FlatList,
  ActivityIndicator, RefreshControl
} from 'react-native';

import { connect } from 'react-redux';
import { fetchOffersDataSource, saveOffer, getMerchantStats } from './reducer'; 

import { Text,  Button,  Badge ,  Body, Card, CardItem, Left, Right, Icon} from 'native-base';
import reducer from '../Offers/reducer';



class MerchantStats extends React.Component {

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
      selected: "key1",
      myStats: [],
      myOffers: []
    };

  }

  arrayholder = [];
  
  static navigationOptions = ({ navigation }) => {
    return {
    headerTransparent: false,
    title: 'Merchant Stats',
    headerBackTitle : null,
    headerTitleStyle : {width : '90%', textAlign: 'center'} ,  
    headerRight: (
        [
          global.testing == true?
          <Button transparent
            key="backBtn"
            title="Go back"
            testID = "backBtn"
            onPress={() => navigation.goBack()}
          ><Text> </Text>
          </Button>
        : null ,        
        ]
      ),
    }    
  };  

   //await AsyncStorage.removeItem('user')
  async componentWillMount() {
    this.fetchOfferData();
    //this.setState({ isLoading: false }); 
  }

  async componentDidMount() {  }

	refreshOffers = async () => {
		this.setState({myOffers:[], isRefreshing: true }); 
    this.fetchOfferData();   
  }; 

  fetchOfferData = async () => {
    console.log("refreshing...");
    const { user_id } = this.props.user;    
    this.props.getMerchantStats( user_id )
    .then( offers => {
      if(offers){
        this.setState({ myOffers: this.props.merchant.merchantStats.myOffers})
      }      
    })
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

  emptyComponent =() => {
    return(
        (this.state.refreshing == true) ?

        <View style={styles.emptyContainer}>
          <Text  style={styles.emptyActionText} >Arrastre el cohete hacia abajo para refrescar</Text>
          <View style={styles.CircleShapeView}>
            <Icon  style={[styles.emptyIcon, {marginLeft:45, marginTop:20}]} name='md-rocket' type='Ionicons'/>
          </View>
          <Text  style={styles.emptyText} >No hay datos disponibles en estos momentos.</Text>         
        </View>         
        :
        <View style={styles.emptyContainer}>
          <Text  style={styles.emptyActionText} >Refrescando Datos  </Text>
          
          <View style={styles.CircleShapeView}>            
            <Icon  style={[styles.emptyIcon, {marginLeft:40, marginTop:25, color:'gray'}]} name='md-refresh' type='Ionicons'/>    
            <ActivityIndicator /> 
          </View>  
            
        </View> 
    )
  }    

  render() {


    const { navigate } = this.props.navigation; 
    const {screenProps} = this.props;

    let renderList = null;
    
    if(this.state.dataSource){
      renderList = this.state.dataSource;
      if(renderList.code == "no_posts")
        renderList = null;
      else
        renderList = this.state.dataSource;
    }   

    //console.log("state logico", this.state.myOffers[0].offer_title);
    
    return (
      <View style={{ width: '100%', height: '100%' }}>          
            <FlatList         
            data={ this.state.myOffers } 
            ListEmptyComponent = { this.emptyComponent() }
            extraData={this.state}       
            style={{ marginTop:2 }}
            refreshing={this.state.refreshing} 
            onRefresh={()=> this.refreshOffers() }            
            refreshFunction={
              <RefreshControl
                refreshing={this.state.refreshing} 
                onRefresh={()=> this.refreshOffers() }
              />
            }             
            keyExtractor={(item, index) => item.toString()}
            renderItem={({item, index}) => {
              return (
                <View>
                  <Card>
                      <CardItem>
                        <Left>
                          <Body>
                            <Text>{index+1}. {item.offer_title}</Text>
                            <Text note></Text>
                          </Body>
                        </Left>
                      </CardItem>
                      <CardItem>
                        <Left style={{width:'50%'}}>
                          <Button transparent>                            
                            <Badge warning><Text>Redimidos: <Text style={{fontWeight:'bold'}}>{item.reddemend}</Text></Text></Badge>                              
                          </Button>
                        </Left>
                        <Right style={{width:'50%'}}>                           
                          <Badge><Text>Restantes: <Text style={{fontWeight:'bold'}}>{item.remain}</Text></Text></Badge>
                        </Right>
                      </CardItem>                        
                  </Card>
                </View>
              )       
              }
            }        
            /> 
            

    </View>
    );
  }
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
    paddingTop: 22
   },
   item: {
     padding: 10,
     fontSize: 18,
     height: 44,
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
	const { user, merchant } = state;
	return { user: { ...user, ...user.user }, merchant}; 
};

export default connect(mapStateToProps, { fetchOffersDataSource, saveOffer, getMerchantStats })(MerchantStats);
