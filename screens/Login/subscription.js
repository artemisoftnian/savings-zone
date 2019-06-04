import * as React from 'react';

import { ActivityIndicator, View,  Image,  Platform, StyleSheet, Alert,  
         TouchableOpacity, Linking, ScrollView, ImageBackground} from 'react-native';

import { Text,  Button, Body, Left,  Right,  ListItem, Radio } from 'native-base';

import {AndroidData} from '../../components/constants.js';

import { connect } from 'react-redux';
import { updateSubscription } from './reducer';

const itemSubs = Platform.select({
  ios: [
    'savings.zone.sub.year', 'savings.zone.sub.monthly', 'savings.zone.sub.sixmonths'
  ],
  android: [
    'com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths'
  ],
});

const testItems = ['android.test.canceled', 'android.test.refunded', 'android.test.item_unavailable', 'android.test.purchased' ];

const platformOs = Platform.select({
  ios: 'ios',
  android: 'android'
});

//const itemSubs = ['com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths'];

class SubscriptionScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      subscriptions:[],
      refreshing: false,
      selectedPlan: 'free',
      selectedPlanPrice: 'Free',
      selectedPlanCode: 'free',
      selectedPeriod: 'free'
    };
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <Image
        style={{ height: 25, width:50, flex: 1 }}
        resizeMode="contain"
        source={require('../../assets/logo-text.png')}
      />
    ),
    headerTitleStyle: { flex: 1, textAlign: 'center' },
    title: 'Step 2: Select a plan',
    
    headerRight: (
      <TouchableOpacity
        //icon={{ name: 'refresh' }}
        style={{ marginRight: 20 }}
        //onPress={ navigation.getParam('refreshClients')} 
        >
        {/*<Icon name="refresh" /> */}
      </TouchableOpacity>
    ),
    
 });

  async componentWillMount() {
      this.setState({ subscriptions: AndroidData })
  } 

  async componentDidMount(){

    try {
      const subscriptions = await RNIap.getSubscriptions(itemSubs, (error, products) => {
          console.log(products);
          //update store here.
          this.setState({subcriptions: products})
      });
    } catch (error) {
      // debug in device with the help of Alert component
      console.log(error);
    } finally {
      console.log("acabo de traer los productos")
    }   
     
  } 


  componentWillUnmount() {
    RNIap.endConnection();
  }


  getSubscription = async ( selectedProduct ) =>{
    console.log('seleccionaaaddooo', selectedProduct);

    if(selectedProduct != 'free'){
      try {

        //First check if purchases can be made
        RNIap.initConnection((canMakePayments) => {
            if(!canMakePayments) {
              Alert.alert('Not Allowed', 'This device is not allowed to make purchases. Please check restrictions on device');
              return;
            }
        })            

        RNIap.buySubscription(selectedProduct, async (error, response) => {

          console.log('algun error',error);
           // NOTE for v3.0: User can cancel the payment which will be available as error object here.
           if(response && response.productIdentifier) {
              //console.log('responseData', response);
              //Update User Data on server here
              console.log('Purchase Successful', 'Your Transaction ID is ' + response.transactionIdentifier);
              console.log('Purchase Data', response);
              this._gotit(response);
           }
           else{
            Alert.alert('Purchase Unsuccessful', 'An error ocurred during the subscription process! There will be no charge to your account');  
           }
        });

      } catch (err) {
        console.log(err)        
      } finally {  
        console.log("Purchase Compleated")
      } 
    }
    else{
      var detail = await this.props.updateSubscription(this.props.user.user.user_id, 'free', platformOs);
      console.log("yyyyy retornooooo...",detail);

      if(detail){
        this.props.navigation.navigate('Offers'); 
      }
      else{
        console.log("que error retorno?",detail); 
      }
      
    }

  }

  _gotit = async (response) => {
    var detail = await this.props.updateSubscription(this.props.user.user.user_id, response, platformOs);
    //then if all went good!
    if(detail){
      //unlock store here.
      this.props.navigation.navigate('Offers');
    }
    else{
      Alert.alert('Error!', 'Transaction Error');
    }
  }



  _handleSubscriptionType = async (selectedPlan) =>{
      if(selectedPlan == 'free'){
        await this.getSubscription(selectedPlan);
        this.props.navigation.navigate('Offers');
      }
      else{
        await this.getSubscription(selectedPlan);     
      }
  }  

  
  async checkSubscription() {
      try {
    } catch (err) {
      console.log(err);
    } finally {

    }
  }


  _handleRestorePurchases = async (productId) => {
    /*
      InAppUtils.restorePurchases((error, response) => {
        if(error) {
          Alert.alert('itunes Error', 'Could not connect to itunes store.');
        } else {
          Alert.alert('Restore Successful', 'Successfully restores all your purchases.');
          
          if (response.length === 0) {
            Alert.alert('No Purchases', "We didn't find any purchases to restore.");
            return;
          }
    
          response.forEach((purchase) => {
            if (purchase.productIdentifier === productId) {
              // Handle purchased product.
            }
          });
        }
    });    
  */
  }  


  onSelectedItem = (product)=>{
    console.log(product.productId);
    this.setState({ 
      selectedPlan: product.productId, 
      selectedPlanPrice: product.priceString, 
      selectedPlanCode: product.productId,
      selectedPeriod: product.productId
    })
  }

  render() {

    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }

    const { navigate } = this.props.navigation;
    const {screenProps} = this.props;

    return (
      <ScrollView style={[styles.mainView,{backgroundColor:'#fff'}]}  behavior="padding" enabled>

          
            <View enabled style={[styles.headBox, { flex:1, justifyContent: 'center', alignItems: 'center', padding:0 }]}>
              <ImageBackground source={require('../../assets/images/wallpaper.png')} style={{width: '100%', height: '100%'}}>
                <View enabled style={[{ flex:1, justifyContent: 'center', alignItems: 'center', padding:20 }]}>
                  <Text style={[styles.areaTitle,{color:'#fff'}]} >{ screenProps.lang.subscriptionScreen.title }</Text>
                  <Text style={{color:'#fff'}} >esta te permite obtener y canjear ofertasafada d a dfafda f fd afafdas a dfa df afd af asd</Text>
                </View>
              </ImageBackground> 
            </View>
                 



          <View enabled style={{ flex:1, justifyContent: 'center', alignItems: 'center', padding:20  }}>

              <View style={{backgroundColor:'#fff', maxWidth:400}}>

                      <ListItem
                          onPress={() => this.setState({ selectedPlan: 'free', selectedPlanPrice: 'Free', selectedPlanCode: 'free', selectedPeriod: 'free' })}
                          selected={this.state.selectedPlan == 'free'}
                          key='freePlan'
                          style={[styles.listItem, this.state.selectedPlan == 'free' ? styles.selectedItem : {}] }                   
                      >
                        <Body>
                          <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.listItemPrice,'free'== this.state.selectedPlan ? styles.selectedText : {}]}  >{screenProps.lang.subscriptionScreen.freeText}</Text>
                        </Body>                          
                      </ListItem>                 
                      
                      {
                          this.state.subscriptions.map((product, i) => {
                            return (
                              <ListItem
                                  onPress={() => this.onSelectedItem(product) }
                                  selected={ this.state.selectedPlan == product.productId } 
                                  key={i.toString()}   
                                  style={[styles.listItem,  this.state.selectedPlan == product.productId ? styles.selectedItem : {}]}                 
                              >
                                <Body style={{padding:0,margin:0}}>
                                  <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.listItemPrice, this.state.selectedPlan == product.productId ? styles.selectedText : {}]}  >{product.priceText} / 6 Months</Text>                                  
                                </Body>
                              </ListItem>
                            );
                          })
                      }

                  <Button 
                    block
                    style={[ styles.selectBtn, {marginTop:15} ]}
                    onPress={() => {
                      this._handleSubscriptionType(this.state.selectedPlan);
                    // this.props.navigation.navigate('App');
                    }}                      
                  >
                    <Text>Gratis</Text> 
                  </Button>
                  <Text style={styles.areaTitle} >Podrás ver, pero no obtener ni canjear ofertas</Text>


                  <Text style={{marginTop:10}} >                      
                      <Text  style={{textAlign: 'center', fontWeight:'bold'}}>{screenProps.lang.subscriptionScreen.noteTitle}</Text>
                      <Text>
                        {this.state.selectedPeriod == 'free'?
                          screenProps.lang.subscriptionScreen.freeNoteMessage
                          :
                          screenProps.lang.subscriptionScreen.iosNote.replace('$price', this.state.selectedPlanPrice)
                        }                       
                      </Text>
                  </Text>

              </View>
          </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => {
  const { user } = state;
  return { user };
};

export default connect(mapStateToProps, { updateSubscription } )(SubscriptionScreen);

const styles = StyleSheet.create({
  headBox:{
    backgroundColor:'purple',
    color:'#fff',
    padding:20
  },
  mainView: {
    flex: 1,
  },
  areaTitle:{
    fontSize:20, color:'#2e3159', marginBottom:10
  },
  listItem:{
    backgroundColor:'#d9dfea',
    borderRadius:10,
    padding:5,
    marginBottom: 5,
    marginLeft:0
  },
  listItemPrice:{     
     fontSize:25, 
     fontWeight:'bold',
     color:'#71839a',
     borderRightWidth:0,
     borderRightColor:'#71839a',
     textAlign:'center'  
  },
  listItemDescription:{
    color:'#71839a'
  },
  listItemRadio:{
  },
  selectedItem:{    
    backgroundColor:'#4e2e59'
  },
  selectedText:{
    color:'#ffffff',
    borderRightColor:'#ffffff',
  },
  selectBtn:{
    backgroundColor:'#2e3159',
    borderRadius:10    
  }

});