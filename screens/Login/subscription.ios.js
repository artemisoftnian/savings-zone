import * as React from 'react';
import { ActivityIndicator, View,  Image,  StyleSheet, Alert,  TouchableOpacity, Linking, ScrollView } from 'react-native';

import {  Text,  Button, Body, Left,  Right,  ListItem, Radio } from 'native-base';

import RNIap,  { PRoductPurchase, purchseUpdatedListener, purchseErrorListener } from 'react-native-iap';

import {iosData, iosNonAutoData} from '../../components/constants.js';

import { connect } from 'react-redux';
import { updateSubscription } from './reducer';

import helpers from '../../components/helpers';

const itemSubs = helpers.itemSubs.ios;


class SubscriptionScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      subscriptions:[],
      refreshing: false,
      selectedPlan: 'free',
      selectedPlanPrice: 'Free',
      selectedPlanCode: 'free',
      selectedPeriod: 'free',
      inProgress:false,
      loadingAssets:false
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
    headerRight:(
      global.testing == true?
        <Button transparent
          title="Go back"
          testID = "backBtn"
          onPress={() => navigation.goBack()}
        ><Text> </Text>
        </Button>
      : null  
    ),
    headerTitleStyle: { flex: 1, textAlign: 'center' },
    title: 'Step 2: Select a plan',
    
 });

  async componentWillMount() {
      
  } 

  async componentDidMount(){

    try {
      this.setState({ loadingAssets:true })
      const products = await RNIap.getSubscriptions(itemSubs);
      console.log(products);
      this.setState({ subscriptions: products });
    } catch(err) {
      console.warn(err); // standardized err.code and err.message available
      this.setState({ subscriptions: iosNonAutoData })
    } finally {
      this.setState({ loadingAssets:false })
      console.log("acabo de traer los productos")
    } 

  } 

  getSubscription = async ( selectedProduct ) =>{
    console.log('seleccionaaaddooo', selectedProduct);

    if(selectedProduct != 'free'){
      this.setState({ inProgress: true });
      try {
        if(this.subscription) {
          this.subscription.remove();
        }
        // Will return a purchase object with a receipt which can be used to validate on your server.
        const purchase = await RNIap.buyProduct(selectedProduct);
        console.log('purchase Info:', purchase);
        this.setState({
          receipt: purchase.transactionReceipt, // save the receipt if you need it, whether locally, or to your server.
        });
        this._gotit(purchase);
      } catch(err) {
        // standardized err.code and err.message available
        console.warn(err.code, err.message);
        this.subscription = RNIap.addAdditionalSuccessPurchaseListenerIOS(async (purchase) => {
          this.setState({ receipt: purchase.transactionReceipt }, () => this.goToNext());
          this.subscription.remove();
        });
      }finally{
        this.setState({ inProgress: false, loadingAssets:false  });
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
    console.log("EN DETALLE:", detail)

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
      this.setState({ loadingAssets:true })     
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
      var test = helpers.restoreSubscription();
      console.log(test);
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

  _openUrl = (url)=> {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
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
      <ScrollView style={[styles.mainView,{backgroundColor:'#efeff4'}]}  behavior="padding" enabled>
          
          <View enabled style={[styles.headBox, { flex:1, justifyContent: 'center', alignItems: 'center', padding:0, backgroundColor:'#4e2e59' }]}>           
              <View enabled style={[{ flex:1, justifyContent: 'center', alignItems: 'center', padding:20 }]}>   
                {this.state.inProgress?<ActivityIndicator style={{flex:1}} />:null}               
                <Text style={[styles.areaTitle,{color:'#fff'}]} >{ screenProps.lang.subscriptionScreen.title }</Text>                             
                <Text style={{color:'#fff'}} >
                  {'\u2022'} {screenProps.lang.subscriptionScreen.whatYouGetText}                  
                </Text>                
              </View>            
          </View>

          <View enabled style={{ flex:1, justifyContent: 'center', alignItems: 'center', padding:20  }}>

              <View style={{backgroundColor:'#efeff4', maxWidth:400}}>
                  {this.state.loadingAssets?<ActivityIndicator size="large" style={{flex:1}} />:null}    
                  {
                      this.state.subscriptions.map((product, i) => {
                        return (
                          <ListItem
                              onPress={() => this.onSelectedItem(product) }
                              selected={ this.state.selectedPlan == product.productId } 
                              key={i.toString()}   
                              style={[styles.listItem,  this.state.selectedPlan == product.productId ? styles.selectedItem : {}]}  
                              testID={"test_"+i.toString()}               
                          >
                            <Body style={{padding:0,margin:0}}>
                              <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.listItemPrice, this.state.selectedPlan == product.productId ? styles.selectedText : {}]}  >
                                {/*product.localizedPrice} | {product.title} {product.subscriptionPeriodUnitIOS}{product.subscriptionPeriodNumberIOS>1?"S":""*/}
                                {product.localizedPrice} | {product.title}
                              </Text>
                              <Text style={[{textAlign:"center", marginTop:2}, this.state.selectedPlan == product.productId ? styles.selectedText : {} ]}>{product.description}</Text>                               
                            </Body>
                          </ListItem>
                        );
                      })
                  }

                  <Button 
                    block
                    style={[ styles.selectBtn, {marginTop:20} ]}
                    onPress={() => {
                      this._handleSubscriptionType(this.state.selectedPlan);
                    }}                      
                  >
                    <Text>{screenProps.lang.subscriptionScreen.planSelectBtnText}</Text> 
                  </Button>

                  <Text style={{color: 'gray', fontWeight:'bold', textAlign:'center', marginTop:20}}
                    onPress={ async () => {
                      await this.setState({ selectedPlan: 'free', selectedPlanPrice: 'Free', selectedPlanCode: 'free', selectedPeriod: 'free' })
                      this._handleSubscriptionType(this.state.selectedPlan);
                    }}  
                  >
                    {this.props.screenProps.lang.subscriptionScreen.freeText}
                  </Text>

                  <ScrollView style={{}}>

                    <Text style={{marginTop:10}} >                      
                        
                        <Text style={{ color: '#4F4F4F', fontSize:11 }}>
                          
                          {/*this.state.selectedPeriod == 'free'?
                            screenProps.lang.subscriptionScreen.freeNoteMessage
                            :
                            screenProps.lang.subscriptionScreen.iosNote.replace('$price', this.state.selectedPlanPrice )
                          */} 

                          {screenProps.lang.subscriptionScreen.iosNote.replace('$price', this.state.selectedPlanPrice )}                      
                        </Text>

                    </Text>

                    <Text style={styles.termsStyle} 
                          onPress={ async ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.termsConditionsUrl) } }>
                        {this.props.screenProps.lang.myAccount.termsConditionsText}
                    </Text>

                    <Text style={styles.termsStyle}
                          onPress={ async ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.privacyPolicyUrl) } }> 
                      {this.props.screenProps.lang.myAccount.privacyPolicyText} 
                    </Text>

                  </ScrollView>

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
  termsStyle:{
    textAlign: 'center', 
    width:'100%', 
    color:'#4F4F4F', 
    padding:3, 
    fontSize:12,
    marginTop:5,
    marginBottom:5
  },
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
    //borderRightColor:'#ffffff',
  },
  selectBtn:{
    backgroundColor:'#2e3159',
    borderRadius:10    
  }

});
