import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';


//SCREENS
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Login/register'; 
import SubscriptionScreen from '../screens/Login/subscription'; 
//import ManageSubscription from './screens/Login/manageSubscription';
import OffersScreen from '../screens/Offers';
import Oferta from '../screens/Offers/oferta';
import MapScreen from '../screens/Offers/map';
import UserProfileScreen from '../screens/UserProfile';
import AppLoadingScreen from '../screens/AppLoading';

import MyOfferScreen from '../screens/MyOffersScreen';
import ScannerScreen from '../screens/scanner';
import MerchantHomeScreen from '../screens/Merchant';
import MerchantStats from '../screens/Merchant/stats';


const AppStack = createStackNavigator(
    { 
        Offers: OffersScreen, //screenDev,// SubscriptionScreen,//
        Oferta: Oferta,   
        Scanner: ScannerScreen,
        MyOffers: MyOfferScreen,
        UserProfile: UserProfileScreen,
        Subscription: SubscriptionScreen,
        //ManageSubscription: ManageSubscription,
        Map: MapScreen
    },	
    {   //Default Navigation Options
        defaultNavigationOptions: {
            header: null,
            headerVisible: false,
            headerStyle: {
                backgroundColor: '#616161',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        },
     
    }
)

const AuthStack = createStackNavigator({
  Login: LoginScreen,
  Register: RegisterScreen
})

const MerchantStack = createStackNavigator({
  MerchantHome: MerchantHomeScreen,
  MerchantStats: MerchantStats,
  Scanner: ScannerScreen
})

const AppNavigation = createAppContainer(
  createSwitchNavigator(
    {   
      AppLoading: AppLoadingScreen,
      App: AppStack,
      Auth: AuthStack,
      Merchant: MerchantStack
    },
    {
      initialRouteName: 'AppLoading',
    }
  )
);

export default AppNavigation;