import * as React from 'react';
import { ActivityIndicator, View,  Image,  StyleSheet, Alert,  
  Platform,  KeyboardAvoidingView, TouchableOpacity } from 'react-native';

import {  Text,  Button,  Left,  Right,  ListItem, Radio } from 'native-base';

import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules

import {DemoSubs} from '../../components/constants.js';

const itemSubs = ['com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths'];

class SubscriptionScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      subscriptions:[],
      refreshing: false,
      selectedPlan: '0',
      selectedPlanPrice: 'Free'
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
      this.setState({ subscriptions: DemoSubs })
  } 

  async componentDidMount(){
    InAppUtils.loadProducts(itemSubs, (error, products) => {
      console.log(products);
      this.setState({subcriptions: products})
    });
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
          //this.buyItem(product.productId)

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

          <Text>(iOS) { screenProps.lang.subscriptionScreen.title }</Text>

              <View style={{backgroundColor:'#fff', maxWidth:400}}>

                      {
                          this.state.subscriptions.map((product, i) => {
                            return (

                              <ListItem
                                  onPress={() => this.setState({ selectedPlan: product.productId, selectedPlanPrice: product.localizedPrice })}
                                  selected={this.state.selectedPlan == product.productId} 
                                  key={i.toString()}                    
                              >
                                <Left>
                                  <Text>{product.localizedPrice} - {product.title} </Text>
                                </Left>
                                <Right>
                                  <Radio
                                    onPress={() => this.setState({ selectedPlan: product.productId, selectedPlanPrice: product.localizedPrice })}
                                    color={"#f0ad4e"}
                                    selectedColor={"#5cb85c"}
                                    selected={this.state.selectedPlan == product.productId}
                                  />
                                </Right>
                              </ListItem>

                            );
                          })
                      }
                      
                      <ListItem
                          onPress={() => this.setState({ selectedPlan: '0', selectedPlanPrice:'Free' })}
                          selected={this.state.selectedPlan == '0'}
                          key='freePlan'                   
                      >
                        <Left>
                          <Text>Test Drive</Text>
                        </Left>
                        <Right>
                          <Radio
                            onPress={() => this.setState({ selectedPlan: '0', selectedPlanPrice:'Free' })}
                            color={"#f0ad4e"}
                            selectedColor={"#5cb85c"}
                            selected={this.state.selectedPlan == '0'}
                          />
                        </Right>
                      </ListItem>    

                      <Text style={{marginTop:30}} >                      
                         <Text  style={{textAlign: 'center', fontWeight:'bold'}}>{screenProps.lang.subscriptionScreen.noteTitle}</Text>
                         <Text>
                            {screenProps.lang.subscriptionScreen.noteMessage.replace('$price', this.state.selectedPlanPrice)} 
                         </Text>
                      </Text>

                  <Button 
                    block
                    style={{marginTop:30}}
                    onPress={() => {
                      this._handleSubscriptionType();
                    // this.props.navigation.navigate('App');
                    }}                      
                  >
                    <Text>{screenProps.lang.subscriptionScreen.planSelectBtnText}</Text> 
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
  /*
  buttonStyle: {
    borderRadius: 10,
    backgroundColor: '#428bca',
    paddingLeft: 20,
    paddingRight: 20,
    margin: 20,
  },
  */

});
