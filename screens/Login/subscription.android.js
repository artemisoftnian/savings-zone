import * as React from 'react';
import { ActivityIndicator, View,  Image,  StyleSheet, Alert,  TouchableOpacity, Linking, ScrollView, TouchableNativeFeedback } from 'react-native';

import {  Text,  Button, Body, Left,  Right,  ListItem, Radio } from 'native-base';

import {AndroidDataNew, gpbErrors} from '../../components/constants.js';

import { connect } from 'react-redux';
import { updateSubscription } from './reducer';

import helpers from '../../components/helpers';

import RNIap, {
  ProductPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';

const testItems = helpers.itemSubs.androidTest;
const itemSubs = helpers.itemSubs.android;

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

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
      storeTest: false,
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

    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
   if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  } 

  async componentWillUnmount() {
    if (RNIap.endConnectionAndroid === "function") { 
      RNIap.endConnectionAndroid();
    }
  }

  async componentDidMount(){

    try {
      const result = await RNIap.initConnection();
      console.log('result', result);
    } catch (err) {
      console.warn(err.code, err.message);
    }

    try {
      this.setState({ loadingAssets:true })
      const products = await RNIap.getSubscriptions(itemSubs);
      console.log(products);
      this.setState({ subscriptions: products });
    } catch(err) {
      console.warn(err); // standardized err.code and err.message available
      this.setState({ subscriptions: AndroidDataNew })
    } finally {
      this.setState({ loadingAssets:false }) 
      console.log("Getting Products Done!")
    }  

    purchaseUpdateSubscription = purchaseUpdatedListener((purchase: ProductPurchase) => {
      console.log('purchaseUpdatedListener', purchase);
      this.setState({ receipt: purchase.transactionReceipt }, () => this.goNext());
    });

    purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.log('purchaseErrorListener', error);
      Alert.alert('purchase error', JSON.stringify(error));
    });


  } 



  processReturnedPurchase = async (details) => { 
    await console.log('a ver que retorno', details);  
    if(details.purchaseState == 'PurchasedSuccessfully'){ 
       console.log('compras procesada por google correctametne');
      //Update User Data on server here
      var detail = await this.props.updateSubscription(this.props.user.user.user_id, details, "android");
      //then if all went good!
      console.log('detalle del server', detail);
      //this.props.navigation.navigate('Offers');
    }  
  }

  getSubscription = async ( selectedProduct ) =>{
    const {screenProps} = this.props;

    var response = null;

    if( selectedProduct != 'free' ){
      try {
        console.log("about to get:", selectedProduct );      

        if(this.state.storeTest)
          response = await RNIap.buyProduct(selectedProduct).then( async details => { this.processReturnedPurchase(details) });
        else
          response = await RNIap.requestSubscription(selectedProduct).then( async details => { this.processReturnedPurchase(details) });
   
      } catch (error) {

          console.log(error);
        
          if (error.message === gpbErrors.PAYMENT_BUG) {

          } else if ( error.message === gpbErrors.PAYMENT_DECLINED ) {
            // Communicate to the user that the payment was declined
            Alert.alert(screenProps.lang.subscriptionScreen.errorDeclinedTitle, screenProps.lang.subscriptionScreen.errorDeclinedMessage);
          } else if ( error.message === gpbErrors.PAYMENT_CANCELLED ) {
            Alert.alert(screenProps.lang.subscriptionScreen.errorCancelledTitle, screenProps.lang.subscriptionScreen.errorCancelledMessage);
          }
        
      } finally {
  
        await RNIap.endConnection();
      } 
    }
    else{

      //Local Test for ios from Windows
      var returned = {
        "originalTransactionDate": 1556673916000,
        "originalTransactionIdentifier": "1000000524185971",
        "productIdentifier": "com.savings.zone.sub.monthly",
        "transactionDate": 1556674215000,
        "transactionIdentifier": "1000000524186226",
        "transactionReceipt": "ewoJInNpZ25hdHVyZSIgPSAiQTNaRUxXWlN5YWd2SzYrU2UxUUhWNWZWTGNEUlVPdTUvQ0lxdTdpLzlFeVpjcksyL2k3WjV3c3lNejVxK3dvUVJlQi9xbDhFbnBxWTNTOHZwTEZUNDA4U3kyUXFvZnA1VzQvbzZQSFU2YnRHRkYya0Y1cG41MWF6NWc1M0lpNlIyaXd2N0p0dWhwTERNTzZoQWdyK1lxUjRIaVRwL1hUS3MwSXhLZGxEQlRPLzhzNmtweFJLTzFIdmtYcGJvR2xYV1RTRTJaQXF5VDJwQ3NHZG5XVmF5bnFkbVpxdElOc3RPODdTWDZ1SHhiaFk1aE5ScWhrdTEyRE5QTDNpTzE2cUdGQ25kRHZEZThjLzE1SU1SNzdYdWVHN1d0M3ZXREhYc0RlRENKNVl0TEo2Tmc2dXMydUVjOTIrZnpBQ1ZBaFU2WE1mVWhocFhlMzBOYVRSRlhaYW9qQUFBQVdBTUlJRmZEQ0NCR1NnQXdJQkFnSUlEdXRYaCtlZUNZMHdEUVlKS29aSWh2Y05BUUVGQlFBd2daWXhDekFKQmdOVkJBWVRBbFZUTVJNd0VRWURWUVFLREFwQmNIQnNaU0JKYm1NdU1Td3dLZ1lEVlFRTERDTkJjSEJzWlNCWGIzSnNaSGRwWkdVZ1JHVjJaV3h2Y0dWeUlGSmxiR0YwYVc5dWN6RkVNRUlHQTFVRUF3dzdRWEJ3YkdVZ1YyOXliR1IzYVdSbElFUmxkbVZzYjNCbGNpQlNaV3hoZEdsdmJuTWdRMlZ5ZEdsbWFXTmhkR2x2YmlCQmRYUm9iM0pwZEhrd0hoY05NVFV4TVRFek1ESXhOVEE1V2hjTk1qTXdNakEzTWpFME9EUTNXakNCaVRFM01EVUdBMVVFQXd3dVRXRmpJRUZ3Y0NCVGRHOXlaU0JoYm1RZ2FWUjFibVZ6SUZOMGIzSmxJRkpsWTJWcGNIUWdVMmxuYm1sdVp6RXNNQ29HQTFVRUN3d2pRWEJ3YkdVZ1YyOXliR1IzYVdSbElFUmxkbVZzYjNCbGNpQlNaV3hoZEdsdmJuTXhFekFSQmdOVkJBb01Da0Z3Y0d4bElFbHVZeTR4Q3pBSkJnTlZCQVlUQWxWVE1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGMrQi9TV2lnVnZXaCswajJqTWNqdUlqd0tYRUpzczl4cC9zU2cxVmh2K2tBdGVYeWpsVWJYMS9zbFFZbmNRc1VuR09aSHVDem9tNlNkWUk1YlNJY2M4L1cwWXV4c1FkdUFPcFdLSUVQaUY0MWR1MzBJNFNqWU5NV3lwb041UEM4cjBleE5LaERFcFlVcXNTNCszZEg1Z1ZrRFV0d3N3U3lvMUlnZmRZZUZScjZJd3hOaDlLQmd4SFZQTTNrTGl5a29sOVg2U0ZTdUhBbk9DNnBMdUNsMlAwSzVQQi9UNXZ5c0gxUEttUFVockFKUXAyRHQ3K21mNy93bXYxVzE2c2MxRkpDRmFKekVPUXpJNkJBdENnbDdaY3NhRnBhWWVRRUdnbUpqbTRIUkJ6c0FwZHhYUFEzM1k3MkMzWmlCN2o3QWZQNG83UTAvb21WWUh2NGdOSkl3SURBUUFCbzRJQjF6Q0NBZE13UHdZSUt3WUJCUVVIQVFFRU16QXhNQzhHQ0NzR0FRVUZCekFCaGlOb2RIUndPaTh2YjJOemNDNWhjSEJzWlM1amIyMHZiMk56Y0RBekxYZDNaSEl3TkRBZEJnTlZIUTRFRmdRVWthU2MvTVIydDUrZ2l2Uk45WTgyWGUwckJJVXdEQVlEVlIwVEFRSC9CQUl3QURBZkJnTlZIU01FR0RBV2dCU0lKeGNKcWJZWVlJdnM2N3IyUjFuRlVsU2p0ekNDQVI0R0ExVWRJQVNDQVJVd2dnRVJNSUlCRFFZS0tvWklodmRqWkFVR0FUQ0IvakNCd3dZSUt3WUJCUVVIQWdJd2diWU1nYk5TWld4cFlXNWpaU0J2YmlCMGFHbHpJR05sY25ScFptbGpZWFJsSUdKNUlHRnVlU0J3WVhKMGVTQmhjM04xYldWeklHRmpZMlZ3ZEdGdVkyVWdiMllnZEdobElIUm9aVzRnWVhCd2JHbGpZV0pzWlNCemRHRnVaR0Z5WkNCMFpYSnRjeUJoYm1RZ1kyOXVaR2wwYVc5dWN5QnZaaUIxYzJVc0lHTmxjblJwWm1sallYUmxJSEJ2YkdsamVTQmhibVFnWTJWeWRHbG1hV05oZEdsdmJpQndjbUZqZEdsalpTQnpkR0YwWlcxbGJuUnpMakEyQmdnckJnRUZCUWNDQVJZcWFIUjBjRG92TDNkM2R5NWhjSEJzWlM1amIyMHZZMlZ5ZEdsbWFXTmhkR1ZoZFhSb2IzSnBkSGt2TUE0R0ExVWREd0VCL3dRRUF3SUhnREFRQmdvcWhraUc5Mk5rQmdzQkJBSUZBREFOQmdrcWhraUc5dzBCQVFVRkFBT0NBUUVBRGFZYjB5NDk0MXNyQjI1Q2xtelQ2SXhETUlKZjRGelJqYjY5RDcwYS9DV1MyNHlGdzRCWjMrUGkxeTRGRkt3TjI3YTQvdncxTG56THJSZHJqbjhmNUhlNXNXZVZ0Qk5lcGhtR2R2aGFJSlhuWTR3UGMvem83Y1lmcnBuNFpVaGNvT0FvT3NBUU55MjVvQVE1SDNPNXlBWDk4dDUvR2lvcWJpc0IvS0FnWE5ucmZTZW1NL2oxbU9DK1JOdXhUR2Y4YmdwUHllSUdxTktYODZlT2ExR2lXb1IxWmRFV0JHTGp3Vi8xQ0tuUGFObVNBTW5CakxQNGpRQmt1bGhnd0h5dmozWEthYmxiS3RZZGFHNllRdlZNcHpjWm04dzdISG9aUS9PamJiOUlZQVlNTnBJcjdONFl0UkhhTFNQUWp2eWdhWndYRzU2QWV6bEhSVEJoTDhjVHFBPT0iOwoJInB1cmNoYXNlLWluZm8iID0gImV3b0pJbTl5YVdkcGJtRnNMWEIxY21Ob1lYTmxMV1JoZEdVdGNITjBJaUE5SUNJeU1ERTVMVEEwTFRNd0lERTRPakkxT2pFMklFRnRaWEpwWTJFdlRHOXpYMEZ1WjJWc1pYTWlPd29KSW5GMVlXNTBhWFI1SWlBOUlDSXhJanNLQ1NKMWJtbHhkV1V0ZG1WdVpHOXlMV2xrWlc1MGFXWnBaWElpSUQwZ0lqTTJNMEUzUmtOQkxUY3lPVUV0TkRVNFFTMDRNekJETFRGQlFrVTFRelZGTTBOR05pSTdDZ2tpYjNKcFoybHVZV3d0Y0hWeVkyaGhjMlV0WkdGMFpTMXRjeUlnUFNBaU1UVTFOalkzTXpreE5qQXdNQ0k3Q2draVpYaHdhWEpsY3kxa1lYUmxMV1p2Y20xaGRIUmxaQ0lnUFNBaU1qQXhPUzB3TlMwd01TQXdNVG96TlRveE5TQkZkR012UjAxVUlqc0tDU0pwY3kxcGJpMXBiblJ5YnkxdlptWmxjaTF3WlhKcGIyUWlJRDBnSW1aaGJITmxJanNLQ1NKd2RYSmphR0Z6WlMxa1lYUmxMVzF6SWlBOUlDSXhOVFUyTmpjME1qRTFNREF3SWpzS0NTSmxlSEJwY21WekxXUmhkR1V0Wm05eWJXRjBkR1ZrTFhCemRDSWdQU0FpTWpBeE9TMHdOQzB6TUNBeE9Eb3pOVG94TlNCQmJXVnlhV05oTDB4dmMxOUJibWRsYkdWeklqc0tDU0pwY3kxMGNtbGhiQzF3WlhKcGIyUWlJRDBnSW1aaGJITmxJanNLQ1NKcGRHVnRMV2xrSWlBOUlDSXhORFEzT1RrMU5UWTVJanNLQ1NKMWJtbHhkV1V0YVdSbGJuUnBabWxsY2lJZ1BTQWlaalU0WVdVeFpUWXlObUU1WkRjNE9USTNaakU0T0dRMFkySTBZV1U1T1RRelptRXpNR1JtTVNJN0Nna2liM0pwWjJsdVlXd3RkSEpoYm5OaFkzUnBiMjR0YVdRaUlEMGdJakV3TURBd01EQTFNalF4T0RVNU56RWlPd29KSW1WNGNHbHlaWE10WkdGMFpTSWdQU0FpTVRVMU5qWTNORFV4TlRBd01DSTdDZ2tpZEhKaGJuTmhZM1JwYjI0dGFXUWlJRDBnSWpFd01EQXdNREExTWpReE9EWXlNallpT3dvSkltSjJjbk1pSUQwZ0lqUWlPd29KSW5kbFlpMXZjbVJsY2kxc2FXNWxMV2wwWlcwdGFXUWlJRDBnSWpFd01EQXdNREF3TkRReE5UYzVOREFpT3dvSkluWmxjbk5wYjI0dFpYaDBaWEp1WVd3dGFXUmxiblJwWm1sbGNpSWdQU0FpTUNJN0Nna2lZbWxrSWlBOUlDSmpiMjB1YzJGMmFXNW5jeTU2YjI1bElqc0tDU0p3Y205a2RXTjBMV2xrSWlBOUlDSmpiMjB1YzJGMmFXNW5jeTU2YjI1bExuTjFZaTV0YjI1MGFHeDVJanNLQ1NKd2RYSmphR0Z6WlMxa1lYUmxJaUE5SUNJeU1ERTVMVEExTFRBeElEQXhPak13T2pFMUlFVjBZeTlIVFZRaU93b0pJbkIxY21Ob1lYTmxMV1JoZEdVdGNITjBJaUE5SUNJeU1ERTVMVEEwTFRNd0lERTRPak13T2pFMUlFRnRaWEpwWTJFdlRHOXpYMEZ1WjJWc1pYTWlPd29KSW05eWFXZHBibUZzTFhCMWNtTm9ZWE5sTFdSaGRHVWlJRDBnSWpJd01Ua3RNRFV0TURFZ01ERTZNalU2TVRZZ1JYUmpMMGROVkNJN0NuMD0iOwoJImVudmlyb25tZW50IiA9ICJTYW5kYm94IjsKCSJwb2QiID0gIjEwMCI7Cgkic2lnbmluZy1zdGF0dXMiID0gIjAiOwp9",
      }


      //var detail = await this.props.updateSubscription(this.props.user.user.user_id, returned, "ios");

      var detail = await this.props.updateSubscription(this.props.user.user.user_id, 'free', "android");

      console.log("que retorno?",detail);

      if(detail){
        this.props.navigation.navigate('Offers'); 
      }
      else{
        console.log("que error retorno?",detail);
        console.log("something went wrong", detail.message)
      }
      
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

  _handleRestoreSubscription = async () => {
    var test = await helpers.restoreSubscription();
    console.log(test);
}  

  onSelectedItem = (product)=>{
    console.log(product.productId);
    this.setState({ 
      selectedPlan: product.productId, 
      selectedPlanPrice: product.priceText, 
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
                  {this.state.loadingAssets?<ActivityIndicator style={{flex:1}} />:null} 
                  {
                      this.state.subscriptions.map((product, i) => {
                        var periodo = null;

                        switch(product.subscriptionPeriodAndroid) {
                          case "P1M":
                            periodo = "1 mes";
                            break;
                          case "P6M":
                            periodo = "6 meses";
                            break;
                          case "P1Y":
                            periodo = "1 año";
                            break;
                        } 

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
                                {product.localizedPrice} / {periodo}
                              </Text>  
                              <Text style={[{textAlign:"center", marginTop:2, fontSize:12}, this.state.selectedPlan == product.productId ? styles.selectedText : {} ]}>{product.description}</Text>                                 
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

                  <TouchableNativeFeedback
                    onPress={this._onPressButton}
                    background={TouchableNativeFeedback.Ripple('#000000')} >    
                    <Text style={{color: 'gray', fontWeight:'bold', textAlign:'center', marginTop:20, paddingTop:20, paddingBottom:20}}
                      onPress={ async () => {
                        await this.setState({ selectedPlan: 'free', selectedPlanPrice: 'Free', selectedPlanCode: 'free', selectedPeriod: 'free' })
                        this._handleSubscriptionType(this.state.selectedPlan);
                      }}  
                    >
                      {this.props.screenProps.lang.subscriptionScreen.freeText}
                    </Text> 
                  </TouchableNativeFeedback>     

                 <TouchableNativeFeedback
                    onPress={this._onPressButton}
                    background={TouchableNativeFeedback.Ripple('#000000')} >    
                    <Text style={{color: 'gray', fontWeight:'bold', textAlign:'center', paddingTop:20, paddingBottom:20}}
                      onPress={ async () => {
                        await this.setState({ selectedPlan: 'free', selectedPlanPrice: 'Free', selectedPlanCode: 'free', selectedPeriod: 'free' })
                        this._handleRestoreSubscription();
                      }}  
                    >
                      {this.props.screenProps.lang.subscriptionScreen.subscribedAlreadyLink}
                    </Text> 
                  </TouchableNativeFeedback>                               

                  <ScrollView style={{}}>

                    <Text style={{marginTop:10}} >                      
                        
                        <Text style={{ color: '#4F4F4F', fontSize:11 }}>
                          
                          {/*this.state.selectedPeriod == 'free'?
                            screenProps.lang.subscriptionScreen.freeNoteMessage
                            :
                            screenProps.lang.subscriptionScreen.iosNote.replace('$price', this.state.selectedPlanPrice )
                          */} 

                          {screenProps.lang.subscriptionScreen.noteMessage.replace('$price', this.state.selectedPlanPrice )}                      
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
  const { user, subscribed } = state;
  return { user, subscribed };
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
