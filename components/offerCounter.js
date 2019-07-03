import * as React from 'react';
import PropTypes from 'prop-types';
import {  Dimensions,  Image,  StyleSheet } from 'react-native';
import { Card, CardItem, Text,  Button,  Icon, Left, Right } from 'native-base';

import AwesomeAlert from 'react-native-awesome-alerts';


// Get screen dimensions
const { width, height } = Dimensions.get('window');
// How many offers we want to have in each row and column 
const cols = 2, rows = 3;


export default class offerCounter extends React.Component {

    // Component prop types
  static propTypes = {
    // Movie object with title, genre, and poster
    offer: PropTypes.object.isRequired,
    // Called when user taps on a poster
    _openOffer: PropTypes.func.isRequired,
    _handleAddToMyOffers: PropTypes.func.isRequired,
    _getDaysRemain: PropTypes.func.isRequired
  }

  render() { 
    const { offer, offer: { post_meta, post_data }, _openOffer, _getDaysRemain, lang, _isLast, _isEven, testID } = this.props;
    const daysRemain = _getDaysRemain(post_meta.offer_exp_date);
    const expired = this.expiredCheck(daysRemain);

    return (
        <Text>#</Text>
    );
  }
}

const styles = StyleSheet.create({
      
});

