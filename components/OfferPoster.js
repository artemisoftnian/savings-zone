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
    _toggleModal: PropTypes.func.isRequired,
    _handleAddToMyOffers: PropTypes.func.isRequired,
    _getDaysRemain: PropTypes.func.isRequired
  }

  _isExperied = (expired, days) => {
     const { offer,  _toggleModal , lang} = this.props;

      if(!expired){
        return(
          <Button style={{width: '100%'}} full onPress={() => _toggleModal(true, offer) }>
            <Text>{ (days==1) ? lang.expiresToday : lang.expiresInDays.replace('$days',days) } </Text>
          </Button>
        )
      }
      else{
        return(
          <Button danger style={{width: '100%'}} full>
            <Text>{lang.expiredMessage}</Text>
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
    const { offer, offer: { post_meta, post_data }, _toggleModal, _handleAddToMyOffers, _getDaysRemain, lang } = this.props;
    const daysRemain = _getDaysRemain(post_meta.offer_exp_date);
    const expired = this.expiredCheck(daysRemain);

    return (
              <Card style={styles.container} >
                <CardItem cardBody button onPress={() => _toggleModal(true, offer, expired) } >                
                  <Image  source={ {uri:post_meta.offer_image_1 } }  style={styles.offerImage} resizeMode="cover" /> 
                </CardItem>
                <CardItem style={ styles.noPadding } button onPress={() => _toggleModal(true, offer) } > 
                    <Text>{post_data.post_title.substring(0,35)}...</Text> 
                </CardItem>
                <CardItem style={styles.offerPriceContainer} button onPress={() => _toggleModal(true, offer, expired) } >  
                  <Left style={{ paddingLeft:0}} >
                    <Text style={styles.offerPrice}>${post_meta.offer_price}</Text>  
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
    marginLeft: 10,
    marginBottom: 5,    
    width: (width - 10) / cols - 10,
    padding:5,
    flex:(1/cols)
  },
  offerImage:{
     width:400, maxWidth: 400, height:80, flex: 1
  },
  offerPriceContainer:{
    paddingTop: 0, paddingBottom: 0, paddingLeft:0
  },
  offerPrice:{
    fontSize: 19, fontWeight:'bold',  color:'#d9534f', paddingLeft:0
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
    
  }
  
});

