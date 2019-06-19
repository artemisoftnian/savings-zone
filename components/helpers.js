import * as React from 'react';
import RNIap,  { PRoductPurchase, purchseUpdatedListener, purchseErrorListener } from 'react-native-iap';
import { Platform, Alert } from 'react-native';


const helpers = {

  itemSubs: {
    ios: ['savings.zone.sub.year', 'savings.zone.sub.sixmonths', 'savings.zone.sub.monthly' ],
    android: ['com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths'],
    androidTest: ['android.test.canceled', 'android.test.refunded', 'android.test.item_unavailable', 'android.test.purchased' ];
  },

  getAvertisingID: function(){
    var adverts = global.advert.split(" ");
    adverts = shuffle(adverts);
    advertId = adverts[(Math.random() * adverts.length) | 0]
    return advertId;
  },

  restoreSubscription: async function (){  
    subscriptions = Platform.select({
      ios: this.itemSubs.ios,
      android: this.itemSubs.android
    });

    try {
      this.setState({ inProgress: true });
      const purchases = await RNIap.getAvailablePurchases();
      let restoredTitles = '';
      purchases.forEach(purchase => { 

        for (let i = 0; i < purchases.length; i++) {
          if ( subscriptions.includes( purchases[i].productId) ) {
            return {restored:true,error:null};
          }
        }
                
        return {restored:false,error:null};
      })

    } catch(err) {
      return {restored:false,error:err.message}; //Alert.alert(err.message);
    }    
  }



}


export default helpers;

shuffle = (arra1) =>{
  var ctr = arra1.length, temp, index;

  // While there are elements in the array
  while (ctr > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
      ctr--;
      // And swap the last element with it
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
  }
  return arra1;
}
