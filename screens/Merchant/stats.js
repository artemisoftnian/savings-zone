import * as React from 'react';

import {
  View,
  StyleSheet,
  AsyncStorage, FlatList, Image
} from 'react-native';

import { connect } from 'react-redux';
import { fetchOffersDataSource, saveOffer, getMerchantStats } from './reducer'; 

import { Text,  Button,  Badge ,  Body, Card, CardItem, Icon, Left, Right, Thumbnail} from 'native-base';
import reducer from '../Offers/reducer';


const testData = [
  {
    "offer_id": 12,
    "offer_title": "Hotel San Walde, San Juan: Estadía de 2 noches para 2 personas que incluye cama full, wifi y desayuno continental",
    "reddemend": "38",
    "remain": "-17",
  },
  {
    "offer_id": 11,
    "offer_title": "Pesca Fresca Beer Garden, Fajardo: 2 Platos a escoger: Chillo Entero, El Volcán o Chuleta Can Can + Sangría + Flan",
    "reddemend": "5",
    "remain": "5",
  },
  {
    "offer_id": 9,
    "offer_title": "¡Road Trip por Utuado con Spotin! Visita a la Piedra Sofá + Ruta del Río Cañon Blanco y más",
    "reddemend": "7",
    "remain": "93",
  },
]

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
      myOffers: testData,
      myStats: testData
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
    const { user_id } = this.props.user;
    var test = await this.props.getMerchantStats( user_id );

    //this.props.fetchOffersDataSource();
    //this.arrayholder = this.props.offerList.dataSource;
    //this.setState({ start: true, dataSource: this.props.offerList.dataSource });
  }

  async componentDidMount() {
    const { user_id } = this.props.user;
    //console.log("diMount", this.props.merchant.merchantStats.myOffers);
    this.setState({ myOffers: this.props.merchant.merchantStats.myOffers})
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
      <View style={{}}>
            <FlatList         
            data={ this.state.myOffers } 
            extraData={this.state}       
            style={{ marginTop:2 }}
            keyExtractor={(item, index) => index}
            renderItem={({item, index}) => {
              console.log("joder->",item.offer_title);
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
                            <Badge warning><Text>Redemmed: {item.reddemend}</Text></Badge>                              
                          </Button>
                        </Left>
                        <Right style={{width:'50%'}}>                           
                          <Badge><Text>Remain: {item.remain}</Text></Badge>
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
});


const mapStateToProps = state => {
	const { user, merchant } = state;
	return { user: { ...user, ...user.user }, merchant}; 
};

export default connect(mapStateToProps, { fetchOffersDataSource, saveOffer, getMerchantStats })(MerchantStats);
