//REACT / REACT NATIVE IMPORTS
import * as React from 'react';
import { AppLoading, Font, Constants } from 'expo'; 
import { persistStore } from 'redux-persist'
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import { Root, Container } from "native-base"; 

import { DeviceEventEmitter} from 'react-native';

import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults'; 

//REDUX IMPORTS
import { Provider } from 'react-redux';
import ConfigureStore from './screens/rootRedux';

//SCREENS
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Login/register'; 
import SubscriptionScreen from './screens/Login/subscription'; 
//import ManageSubscription from './screens/Login/manageSubscription';
import OffersScreen from './screens/Offers';
import Oferta from './screens/Offers/oferta';
import MapScreen from './screens/Offers/map';
import UserProfileScreen from './screens/UserProfile';
import AppLoadingScreen from './screens/AppLoading';

import MyOfferScreen from './screens/MyOffersScreen';
import ScannerScreen from './screens/scanner';
import MerchantHomeScreen from './screens/Merchant';
import MerchantStats from './screens/Merchant/stats';

import OneSignal from 'react-native-onesignal';

import screenDev from './screens/Login/screenDev';


//LOCALIZATION
import { Lang } from './components/language';

//Dev Remote
global.wpSite = "https://sv.artemisoftnian.com";

//Dev Local
//global.wpSite = "http://www.svz.com:8080"  

//Production
//global.wpSite = "https://savingszonepr.com";

//Set to true for Automation Tests purposes
global.testing = false;


//(node:81872) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 change listeners added. Use emitter.setMaxListeners() to increase limit
global.offerEmitter = DeviceEventEmitter;
global.advert = Constants.manifest.extra.advertising;


const store = ConfigureStore();

const AppStack = createStackNavigator({ 
    Offers: SubscriptionScreen,//OffersScreen, //screenDev,//
    Oferta: Oferta,   
    Scanner: ScannerScreen,
    MyOffers: MyOfferScreen,
    UserProfile: UserProfileScreen,
    Subscription: SubscriptionScreen,
    //ManageSubscription: ManageSubscription,
    Map: MapScreen
})

const AuthStack = createStackNavigator({
    Login: LoginScreen,
    Register: RegisterScreen
})

const MerchantStack = createStackNavigator({
    MerchantHome: MerchantHomeScreen,
    MerchantStats: MerchantStats,
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
    
    if(!global.testing){

        OneSignal.init("d40ccaf4-8671-49c4-820e-a6d5e5a09d8c");
        
        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('ids', this.onIds);
        OneSignal.configure();
        
    }
    


  }

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }


  onReceived(notification) {
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log('Device info: ', device);
  }

  async componentWillMount(){

    await Font.loadAsync({
      'Roboto': require("native-base/Fonts/Roboto.ttf"),
    });
    await Font.loadAsync({
      'Roboto_medium': require("native-base/Fonts/Roboto_medium.ttf"),
    });
    await Font.loadAsync({
      'Ionicons': require('@expo/vector-icons/fonts/Ionicons.ttf'),
    });
    await Font.loadAsync({
      'FontAwesome': require('@expo/vector-icons/fonts/FontAwesome.ttf')
    });    
    await Font.loadAsync({
      'MaterialIcons': require('@expo/vector-icons/fonts/MaterialIcons.ttf'),
    }); 
    await Font.loadAsync({
      'Material Icons': require('@expo/vector-icons/fonts/MaterialIcons.ttf'),
    });     

    
    this.setState({ loadingAssets: true }); 

		persistStore(store, null, () => { 
			this.setState({ persistLoaded: true }); 
      global.offerEmitter.addListener('offersOffline', () => {	this.runSyncData(store); } );
      global.offerEmitter.removeListener("offersOffline");
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