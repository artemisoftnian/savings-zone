import * as React from 'react';
import RNIap,  { PRoductPurchase, purchseUpdatedListener, purchseErrorListener } from 'react-native-iap';
import { Platform, Alert } from 'react-native';

const itemSubs = Platform.select({
  ios: ['savings.zone.sub.monthly.ar', 'com.savings.zone.sub.sixmonths.ar', 'com.savings.zone.sub.year.ar'],
  android: ['com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths']
});


const helpers = {

  getAvertisingID: function(){
    var adverts = global.advert.split(" ");
    adverts = shuffle(adverts);
    advertId = adverts[(Math.random() * adverts.length) | 0]
    return advertId;
  },

  restoreSubscription: async function (){  
    try {
      this.setState({ inProgress: true });
      const purchases = await RNIap.getAvailablePurchases();
      let restoredTitles = '';
      purchases.forEach(purchase => { 

        for (let i = 0; i < purchases.length; i++) {
          if ( itemSubs.includes( purchases[i].productId) ) {
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
