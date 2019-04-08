//REACT / REACT NATIVE IMPORTS
import * as React from 'react';
import { AppLoading, Font } from 'expo'; 
import { persistStore } from 'redux-persist'
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { Root } from "native-base"; 


import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults'; 

//REDUX IMPORTS
import { Provider } from 'react-redux';
import ConfigureStore from './screens/rootRedux';

import EventEmitter from 'EventEmitter';

//SCREENS
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Login/register'; 
import SubscriptionScreen from './screens/Login/subscription'; 
import OffersScreen from './screens/Offers';
import Oferta from './screens/Offers/oferta';
import MapScreen from './screens/Offers/map';
import UserProfileScreen from './screens/UserProfile';
import AppLoadingScreen from './screens/AppLoading';

import MyOfferScreen from './screens/MyOffersScreen';
import ScannerScreen from './screens/scanner';
import MerchantHomeScreen from './screens/Merchant';

//LOCALIZATION
import { Lang } from './components/language';

global.wpSite = "https://savingszonepr.com";
global.offerEmitter = new EventEmitter();

const store = ConfigureStore();

const AppStack = createStackNavigator({
    Offers: SubscriptionScreen, //OffersScreen, 
    Oferta: Oferta,   
    Scanner: ScannerScreen,
    MyOffers: MyOfferScreen,
    UserProfile: UserProfileScreen,
    Subscription: SubscriptionScreen,
    Map: MapScreen
})

const AuthStack = createStackNavigator({
    Login: LoginScreen,
    Register: RegisterScreen
})

const MerchantStack = createStackNavigator({
    MerchantHome: MerchantHomeScreen,
    Scanner: ScannerScreen
})

const MainNav = createSwitchNavigator(
  {
    AppLoading: AppLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
    Merchant: MerchantStack
  },
  {
    initialRouteName: 'AppLoading',
  }
);

console.disableYellowBox = true; 

export default class App extends React.Component {

  constructor(props) {
    super(props);
		this.state = {
      loadingAssets: false, 
			persistLoaded: false,
			rejected: false
		};     
  }

  async componentWillMount(){

    await Font.loadAsync({      
      //Descomentar en Production
      'Roboto': require("native-base/Fonts/Roboto.ttf"),
      'Roboto_medium': require("native-base/Fonts/Roboto_medium.ttf"),
      'Ionicons': require('@expo/vector-icons/fonts/Ionicons.ttf'),
      'MaterialIcons': require('@expo/vector-icons/fonts/MaterialIcons.ttf'),
      'FontAwesome': require('@expo/vector-icons/fonts/FontAwesome.ttf')
    });

    
    this.setState({ loadingAssets: true }); 

		persistStore(store, null, () => { 
			this.setState({ persistLoaded: true }); 
			global.offerEmitter.addListener('offersOffline', () => {	this.runSyncData(store); } );
      this.runSyncData(store);
		});
  }


  async runSyncData(store, flag = false) {
		const { offerList, user: { user, isAuth } } = store.getState();
		if (this.state.rejected && !flag) return;
	}

  render() {

    const screenProps = {
      lang:Lang.es
    }

    if (!this.state.loadingAssets) {
      return <AppLoading />;
    }

    if (!this.state.persistLoaded) return null;

    return (
      <Provider store={ store }>
        <Root > 
          <MainNav screenProps={screenProps} />
        </Root>
      </Provider>
    )
  }
}