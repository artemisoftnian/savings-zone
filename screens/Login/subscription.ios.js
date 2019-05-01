import * as React from 'react';
import { ActivityIndicator, View,  Image,  StyleSheet, Alert,  TouchableOpacity, Linking, ScrollView } from 'react-native';

import {  Text,  Button, Body, Left,  Right,  ListItem, Radio } from 'native-base';


import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules
import {iosData} from '../../components/constants.js';

import { connect } from 'react-redux';
import { updateSubscription } from './reducer';

const itemSubs = ['com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths'];

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
      this.setState({ subscriptions: iosData })
  } 

  async componentDidMount(){
    try {
      const subscriptions = await InAppUtils.loadProducts(itemSubs, (error, products) => {
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


  getSubscription = async ( selectedProduct ) =>{
    console.log('seleccionaaaddooo', selectedProduct);

    if(selectedProduct != 'free'){
      try {

        //First check if purchases can be made
        InAppUtils.canMakePayments((canMakePayments) => {
            if(!canMakePayments) {
              Alert.alert('Not Allowed', 'This device is not allowed to make purchases. Please check restrictions on device');
              return;
            }
        })            

        InAppUtils.purchaseProduct(selectedProduct, async (error, response) => {

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
      var detail = await this.props.updateSubscription(this.props.user.user.user_id, 'free', "ios");
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
    var detail = await this.props.updateSubscription(this.props.user.user.user_id, response, "ios");
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
  
  }  


  onSelectedItem = (product)=>{
    console.log(product.identifier);
    this.setState({ 
      selectedPlan: product.identifier, 
      selectedPlanPrice: product.priceString, 
      selectedPlanCode: product.identifier,
      selectedPeriod: product.identifier
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
          <View enabled style={{ flex:1, justifyContent: 'center', alignItems: 'center', padding:20  }}>

              <Text style={styles.areaTitle} >{ screenProps.lang.subscriptionScreen.title }</Text>

              <View style={{backgroundColor:'#fff', maxWidth:400}}>

                      <ListItem
                          onPress={() => this.setState({ selectedPlan: 'free', selectedPlanPrice: 'Free', selectedPlanCode: 'free', selectedPeriod: 'free' })}
                          selected={this.state.selectedPlan == 'free'}
                          key='freePlan'
                          style={[styles.listItem, this.state.selectedPlan == 'free' ? styles.selectedItem : {}] }                   
                      >
                        <Left>
                          <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.listItemPrice,'free'== this.state.selectedPlan ? styles.selectedText : {}]}  >{screenProps.lang.subscriptionScreen.freeText}</Text>                          
                        </Left>
                        <Body>
                          <Text adjustsFontSizeToFit numberOfLines={3} style={[styles.listItemDescription,'free'== this.state.selectedPlan ? styles.selectedText : {}]}  >{screenProps.lang.subscriptionScreen.freeDescription}</Text>
                        </Body>                          
                        <Right>
                          <Radio
                            onPress={() => this.setState({ selectedPlan: 'free', selectedPlanPrice:'Free', selectedPeriod:'free' })}
                            color={'#71839a'}  selectedColor={'#fff'}
                            selected={ this.state.selectedPlan == 'free' } 
                            style={[styles.listItemRadio,{}]} 
                          />
                        </Right>
                      </ListItem>                 

                      {
                          this.state.subscriptions.map((product, i) => {
                            return (

                              <ListItem
                                  onPress={() => this.onSelectedItem(product) }
                                  selected={ this.state.selectedPlan == product.identifier } 
                                  key={i.toString()}   
                                  style={[styles.listItem,  this.state.selectedPlan == product.identifier ? styles.selectedItem : {}]}                 
                              >
                                <Left style={{padding:0,margin:0}}>
                                  <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.listItemPrice, this.state.selectedPlan == product.identifier ? styles.selectedText : {}]}  >{product.priceString}</Text>                                  
                                </Left>
                                <Body style={{padding:0,margin:0}}>
                                  <Text adjustsFontSizeToFit numberOfLines={3} style={[styles.listItemDescription, this.state.selectedPlan == product.identifier ? styles.selectedText : {}]}  >{product.description}</Text>
                                </Body>                                
                                <Right>
                                  <Radio 
                                    onPress={() => this.onSelectedItem(product)  }
                                    color={'#71839a'}  selectedColor={'#fff'}
                                    selected={this.state.selectedPlan == product.identifier}
                                    style={[styles.listItemRadio,{}]}
                                  />
                                </Right>
                                
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
                    <Text>{screenProps.lang.subscriptionScreen.planSelectBtnText}</Text> 
                  </Button>

                  <Button small full transparent warning 
                    style={{marginTop:5}} 
                    onPress = { () => { 
                      this.props.navigation.navigate('ManageSubscription')
                      .catch((err) => console.error('An error occurred', err)) } 
                    } >
                    <Text style={{textDecorationLine:'underline', color:'purple'}}>{screenProps.lang.subscriptionScreen.subscribedAlreadyLink}</Text>               
                  </Button>                   

                  <Button small full transparent warning 
                    style={{marginTop:5}} 
                    onPress = { () => { 
                      Linking.openURL(this.props.screenProps.lang.myAccount.privacyPolicyUrl)
                      .catch((err) => console.error('An error occurred', err)) } 
                    } >
                    <Text style={{textDecorationLine:'underline', color:'blue'}}>{screenProps.lang.myAccount.privatePolicyText}</Text>               
                  </Button> 

                  <Text style={{marginTop:10}} >                      
                      <Text  style={{textAlign: 'center', fontWeight:'bold'}}>{screenProps.lang.subscriptionScreen.noteTitle}</Text>
                      <Text>
                        {this.state.selectedPeriod == 'free'?
                          screenProps.lang.subscriptionScreen.freeNoteMessage
                          :
                          screenProps.lang.subscriptionScreen.noteMessage.replace('$price', this.state.selectedPlanPrice)
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
     width:140,
     fontSize:25, 
     fontWeight:'bold',
     paddingLeft:10,
     color:'#71839a',
     borderRightWidth:1,
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
