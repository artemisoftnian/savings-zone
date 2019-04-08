import * as React from 'react';
import { ActivityIndicator, View,  Image,  StyleSheet, Alert,  
  Platform,  KeyboardAvoidingView, TouchableOpacity, Linking } from 'react-native';

import {  Text,  Button, Body, Left,  Right,  ListItem, Radio } from 'native-base';

import {AndroidData} from '../../components/constants.js';

import InAppBilling from "react-native-billing";

const testItems = [ 'android.test.purchased', 'android.test.canceled', 'android.test.refunded', 'android.test.item_unavailable' ];
const itemSubs = ['com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths'];

class SubscriptionScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      subscriptions:[],
      refreshing: false,
      selectedPlan: '0',
      selectedPlanPrice: 'Free',
      selectedPlanCode: 'free',
      selectedPeriod: 'free'
    };
  }

  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <Image
        style={{ width: 120, height: 39, flex: 1 }}
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
      // make sure the service is close before opening it
      await InAppBilling.close();
      await InAppBilling.open();

      // product with Google Play id: gems.pack.500
      const subcriptions = await InAppBilling.getSubscriptionDetailsArray(itemSubs)
      .then(
        //console.log(subscriptions)
        this.setState({subcriptions: subcriptions})
      );
      //const details = await InAppBilling.getProductDetails('gems.pack.500');
      //this.gemsPack.priceText = details.priceText;
    } catch (error) {
      // debug in device with the help of Alert component
      console.log(error);
    } finally {
      await InAppBilling.close(); 
    }    
  } 


  async purchase() {
    try {
      await InAppBilling.open();

      const response = InAppBilling.subscribe(this.state.selectedPlanCode).then(details => {

        console.log(details);

        if(details.purchaseState == 'PurchasedSuccessfully'){
          //Update User Data on server here
          //then
          this.props.navigation.navigate('Offers');
        }
        
      });
     //const details = await InAppBilling.purchase(this.state.selectedPlanCode);
    } catch (err) {
      console.log(err);
    } finally {
      await InAppBilling.close();
    }
  }
  
  async checkSubscription() {
      try {
      await InAppBilling.open();
      // If subscriptions/products are updated server-side you
      // will have to update cache with loadOwnedPurchasesFromGoogle()
      await InAppBilling.loadOwnedPurchasesFromGoogle();
      const isSubscribed = await InAppBilling.isSubscribed("myapp.productId")
      console.log("Customer subscribed: ", isSubscribed);
    } catch (err) {
      console.log(err);
    } finally {
      await InAppBilling.close();
    }
  }

  buyItem = async(sku) => {
    try {
      console.info('buyItem: ' + sku);
      //const purchase = await RNIap.buyProduct(sku);
      //const products = await RNIap.buySubscription(sku);
      const purchase = "test";//await RNIap.buyProductWithoutFinishTransaction(sku);
      console.info(purchase);
      this.setState({ receipt: purchase.transactionReceipt }, () => this.goToNext());
    } catch (err) {
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  }  

  _handleSubscriptionType = async () =>{
      if(this.state.selectedPlan == '0'){
        this.props.navigation.navigate('Offers');
      }
      else{
          await this.purchase(product.productId);

          Alert.alert(
            'Not Programed Yet!',
            'This area is in development',
            [
              {text: 'Continue to offers', onPress: () => this.props.navigation.navigate('Offers') },
            ],
            { cancelable: false }
          )          
      }
  }

  onSelectedItem = (product)=>{
    console.log(product.subscriptionPeriod);
    this.setState({ 
      selectedPlan: product.productId, 
      selectedPlanPrice: product.priceText, 
      selectedPlanCode: product.productId,
      selectedPeriod: product.subscriptionPeriod
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
      <KeyboardAvoidingView style={[styles.mainView,{backgroundColor:'#fff'}]}  behavior="padding" enabled>
          <View enabled style={{ flex:1, justifyContent: 'center', alignItems: 'center', padding:20  }}>

              <Text style={styles.areaTitle} >{ screenProps.lang.subscriptionScreen.title }</Text>

              <View style={{backgroundColor:'#fff', maxWidth:400}}>

                      <ListItem
                          onPress={() => this.setState({ selectedPlan: '0', selectedPlanPrice: 'Free', selectedPlanCode: 'free', selectedPeriod: 'free' })}
                          selected={this.state.selectedPlan == '0'}
                          key='freePlan'
                          style={[styles.listItem,'free'=== this.state.selectedPeriod ? styles.selectedItem : {}]}                   
                      >
                        <Left>
                          <Text  style={[styles.listItemPrice,'free'=== this.state.selectedPeriod ? styles.selectedText : {}]}  >{screenProps.lang.subscriptionScreen.freeText}</Text>                          
                        </Left>
                        <Body>
                          <Text  style={[styles.listItemDescription,'free'=== this.state.selectedPeriod ? styles.selectedText : {}]}  >{screenProps.lang.subscriptionScreen.freeDescription}</Text>
                        </Body>                          
                        <Right>
                          <Radio
                            onPress={() => this.setState({ selectedPlan: '0', selectedPlanPrice:'Free', selectedPeriod:'free' })}
                            color={'#71839a'}  selectedColor={'#fff'}
                            selected={this.state.selectedPlan == '0'} 
                            style={[styles.listItemRadio,{}]} 
                          />
                        </Right>
                      </ListItem>                 

                      {
                          this.state.subscriptions.map((product, i) => {
                            return (

                              <ListItem
                                  onPress={() => this.onSelectedItem(product) }
                                  selected={this.state.selectedPlan == product.productId} 
                                  key={i.toString()}   
                                  style={[styles.listItem, product.subscriptionPeriod === this.state.selectedPeriod ? styles.selectedItem : {}]}                 
                              >
                                <Left>
                                  <Text style={[styles.listItemPrice,product.subscriptionPeriod === this.state.selectedPeriod ? styles.selectedText : {}]}  >{product.priceText}</Text>                                  
                                </Left>
                                <Body>
                                  <Text style={[styles.listItemDescription,product.subscriptionPeriod === this.state.selectedPeriod ? styles.selectedText : {}]}  >{product.description}</Text>
                                </Body>                                
                                <Right>
                                  <Radio
                                    onPress={() => this.onSelectedItem(product)  }
                                    color={'#71839a'}  selectedColor={'#fff'}
                                    selected={this.state.selectedPlan == product.productId}
                                    style={[styles.listItemRadio,{}]}
                                  />
                                </Right>
                                
                              </ListItem> 

                            );
                          })
                      }
                      
 

                  <Text style={{marginTop:30}} >                      
                      <Text  style={{textAlign: 'center', fontWeight:'bold'}}>{screenProps.lang.subscriptionScreen.noteTitle}</Text>
                      <Text>
                        {this.state.selectedPeriod == 'free'?
                          screenProps.lang.subscriptionScreen.freeNoteMessage
                          :
                          screenProps.lang.subscriptionScreen.noteMessage.replace('$price', this.state.selectedPlanPrice)
                        }
                       
                      </Text>
                  </Text>
                     

                  <Button 
                    block
                    style={[styles.selectBtn,{marginTop:30}]}
                    onPress={() => {
                      this._handleSubscriptionType();
                    // this.props.navigation.navigate('App');
                    }}                      
                  >
                    <Text>{screenProps.lang.subscriptionScreen.planSelectBtnText}</Text> 
                  </Button>

                  <Button small full transparent warning 
                    style={{marginTop:20}} 
                    onPress = { () => { 
                      Linking.openURL(this.props.screenProps.lang.myAccount.privacyPolicyUrl)
                      .catch((err) => console.error('An error occurred', err)) } 
                    } >
                    <Text style={{textDecorationLine:'underline', color:'blue'}}>{screenProps.lang.myAccount.privatePolicyText}</Text>               
                  </Button>                   
              </View>
              

          </View>

      </KeyboardAvoidingView>
    );
  }
}

export default SubscriptionScreen;

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
