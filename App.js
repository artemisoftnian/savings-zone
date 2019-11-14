//REACT / REACT NATIVE IMPORTS
const servers = ({
  local:"http://www.svz.com:8080", 
  test:"https://sv.artemisoftnian.com", 
  prod:"https://savingszonepr.com"   
})

console.disableYellowBox = true; 
global.wpSite = servers.prod;

//Set to true for Automation Tests purposes
global.testing = false;

import * as React from 'react';
import { AppLoading} from 'expo'; 
import {Asset} from 'expo-asset';
import Constants from 'expo-constants';
import * as Font from 'expo-font'
import { persistStore } from 'redux-persist'
import { Root} from "native-base"; 
import { DeviceEventEmitter} from 'react-native';

//REDUX IMPORTS
import { Provider } from 'react-redux';
import ConfigureStore from './screens/rootRedux';
import OneSignal from 'react-native-onesignal';

//NAVIGATION
import AppNavigation from './components/AppNavigation'

//LOCALIZATION
import { Lang } from './components/language'; 


//(node:81872) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 change listeners added. Use emitter.setMaxListeners() to increase limit
global.offerEmitter = DeviceEventEmitter;
global.advert = Constants.manifest.extra.advertising;


const store = ConfigureStore();

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
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      'Ionicons': require('native-base/Fonts/Ionicons.ttf'),
      'FontAwesome': require('native-base/Fonts/FontAwesome.ttf'),
      'MaterialIcons': require('native-base/Fonts/MaterialIcons.ttf'),
      'Material Icons': require('native-base/Fonts/MaterialIcons.ttf'),
    });

    const imageAssets = await Asset.loadAsync([
      require('./assets/icons/szCarMarker.png'),
      require('./assets/icons/szMapMarker.png'),
    ]);

     
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
        <Root> 
          <AppNavigation screenProps={screenProps} />
        </Root>
      </Provider>
    )
  }
}