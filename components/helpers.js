import * as React from 'react';
import RNIap from 'react-native-iap';
import { Platform, Alert } from 'react-native';


const helpers = {

  itemSubs: {
    ios: ['savings.zone.sub.sixmonths', 'savings.zone.sub.monthly','savings.zone.sub.year' ],
    android: ['com.savings.zone.sub.year', 'com.savings.zone.sub.monthly', 'com.savings.zone.sub.sixmonths'],
    androidTest: ['android.test.canceled', 'android.test.refunded', 'android.test.item_unavailable', 'android.test.purchased' ],
  },

  getAvertisingID: function(){
    var adverts = global.advert.split(" ");
    adverts = shuffle(adverts);
    advertId = adverts[(Math.random() * adverts.length) | 0]
    return advertId;
  },

  restoreSubscription: async function (){  

    console.log("restoring product...")
    message = {};

    subscriptions = Platform.select({
      ios: this.itemSubs.ios,
      android: this.itemSubs.android
    });

    try {

        if (RNIap.getAvailablePurchases === "function") { 

          const purchases = await RNIap.getAvailablePurchases();
    
          purchases.forEach(purchase => { 
  
            for (let i = 0; i < purchases.length; i++) {
              if ( subscriptions.includes( purchases[i].productId) ) {
                message = {restored:true, restoredItem:purchases[i].productId, error:null};
              }
            }                  
            message = {restored:false,restoredItem:"none", error:null};
          })

        }
        else{
          message = {restored:false, restoredItem:"none", error:"Sorry Running From Expo not ExpoKit!"};
        }

    } catch(err) {
      console.log(err.message);
      message = {restored:false, restoredItem:"none", error:err.message}; 
      
    } finally{
      return message;
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
