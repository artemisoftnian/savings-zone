import * as React from 'react';
import PropTypes from 'prop-types';
import {  Dimensions,  Image,  StyleSheet } from 'react-native';


import { Card, CardItem, Text,  Button,  Icon, Left, Right } from 'native-base';


// Get screen dimensions
const { width, height } = Dimensions.get('window');
// How many offers we want to have in each row and column 
const cols = 2, rows = 3;


export default class OfferPoster extends React.Component {

    // Component prop types
  static propTypes = {
    // Movie object with title, genre, and poster
    offer: PropTypes.object.isRequired,
    // Called when user taps on a poster
    _openOffer: PropTypes.func.isRequired,
    _handleAddToMyOffers: PropTypes.func.isRequired,
    _getDaysRemain: PropTypes.func.isRequired
  }

  _isExperied = (expired, days) => {
     const { offer,  _openOffer , lang} = this.props;

      if(!expired){
        return(
          <Button style={{width: '100%'}} full onPress={() => _openOffer(offer) }> 
            <Text adjustsFontSizeToFit numberOfLines={1} >{ (days==1) ? lang.expiresToday : lang.expiresInDays.replace('$days',days) } </Text>
          </Button>
        )
      }
      else{
        return(
          <Button danger style={{width: '100%'}} full>
            <Text adjustsFontSizeToFit numberOfLines={1} >{lang.expiredMessage}</Text>
          </Button>
        )
      }
  }  


  expiredCheck = (days) => {  
    return !(days > 0);
  }


  _isExperiedIcon = (expired) => {
    const { offer, _handleAddToMyOffers } = this.props;

    if(!expired){
      return(
        <Button transparent onPress = { () => _handleAddToMyOffers(offer) } >
          <Icon active name="md-add-circle" style={[styles.addIcon, {color:'#007aff'}]} />   
        </Button>        
      )
    }
    else{
      return(
        <Button transparent disabled>
          <Icon name="md-add-circle" style={[styles.addIcon, {color:'#d9534f'}]} />
        </Button>          
      )
    }
}  


  render() { 
    const { offer, offer: { post_meta, post_data }, _openOffer, _getDaysRemain, lang, _isLast, _isEven, testID } = this.props;
    const daysRemain = _getDaysRemain(post_meta.offer_exp_date);
    const expired = this.expiredCheck(daysRemain);

    return (
              <Card style={[ styles.container, (!_isEven && _isLast)?{marginRight:30}:{} ]} >
                <CardItem cardBody button onPress={() => _openOffer(offer, expired) } >                
                  <Image  source={ {uri:post_meta.offer_image_1 , cache: 'force-cache'} }  style={styles.offerImage} resizeMode="cover" /> 
                </CardItem>
                <CardItem style={ [styles.noPadding,{padding:10, marginTop:5}] } button onPress={() => _openOffer(offer) } > 
                    <Text numberOfLines={2} style={{ paddingRight: post_data.post_title.length <= 20 ? 5:0 }}>{post_data.post_title}</Text> 
                </CardItem>
                <CardItem testID={testID} style={styles.offerPriceContainer} button onPress={() => _openOffer(offer, expired) } >   
                  <Left style={{ paddingLeft:0}} >
                    <Text style={{flex:1}}>
                      <Text style={{fontSize:8, color:'darkgray', fontWeight:'bold'}}> Usted Paga </Text> 
                      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.offerPrice}> {isNaN(post_meta.offer_price)?null:'$' }{post_meta.offer_price}</Text> 
                    </Text>
                  </Left>
                  <Right>
                    { this._isExperiedIcon(expired) }
                  </Right>
                </CardItem>
                <CardItem footer style={ styles.noPadding }> 
                  { this._isExperied(expired, daysRemain) } 
                </CardItem> 
              </Card>       
      );
  }
}

const styles = StyleSheet.create({
  container: {    
    marginLeft: 10, marginRight:10,
    marginBottom: 5,    
    width: (width - 10) / cols - 10,
    padding:0,
    flex:(1/cols)
  },
  offerImage:{
     width:400, maxWidth: 400, height:80, flex: 1
  },
  offerPriceContainer:{
    paddingTop: 0, paddingBottom: 0, paddingLeft:0
  },
  offerPrice:{
    fontSize: 19, fontWeight:'bold',  color:'purple', paddingLeft:0,flex: 1
  },
  addIcon:{
    fontSize:40
  },
  noPadding:{
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft:0,
    marginRight:0,    
  },
  offerTitle:{
    padding:5 
  }
  
});

