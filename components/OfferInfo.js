import * as React from 'react';
import {  Image,  StyleSheet, Dimensions, ScrollView, View } from 'react-native';

import MyWebView from 'react-native-webview-autoheight';
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

//import { WebView } from "react-native-webview";

import {Content,  Card,  CardItem, Text,  Button,  Icon, Left,  Body,  Right } from 'native-base';

export default class OfferInfo extends React.Component {


  _isExperied = (days) => {
      const { offer, offer: { post_meta, post_data }, _toggleModal, lang } = this.props;

      if(days > 0){
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



  render() {  
    
    return (
      <Content style={{flex:1,marginTop:0, marginBottom:0, marginLeft:0, marginRight:0, paddingLeft:0, paddingRight:0}}>  

        <ScrollView
          horizontal //scrolling left to right instead of top to bottom
          showsHorizontalScrollIndicator={false} //hides native scrollbar
          scrollEventThrottle={20} //how often we update the position of the indicator bar
          pagingEnabled //scrolls from one image to the next, instead of allowing any value inbetween
          style={{ }}
        >
          {
            this.props.image.map(
              image => (
                <Image key={image} source={ {uri:image , cache: 'force-cache'} } style={{ height: 200, width:SCREEN_WIDTH }} />
              )
            )
          }              
        </ScrollView>

        <Card transparent>

          <CardItem cardBody>           
            <Text style={{fontSize:10, color:'#555', fontWeight:'bold', marginLeft:20 }}>{this.props.category}</Text>
          </CardItem>        

          <CardItem>           
            <Text style={{fontSize:18, color:'#555', fontWeight:'bold'}}>{this.props.title}</Text>
          </CardItem>

          <CardItem> 
              <MyWebView 
                //sets the activity indicator before loading content
                startInLoadingState={true}
                originWhitelist={['*']}
                source={{ baseUrl: '', html: this.props.desc }}
                style={{ maxHeight:1000, width:SCREEN_WIDTH - 40, flex:1}}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
              />            
          </CardItem>  

        </Card>       
      </Content>
      
    );
  }
}

const styles = StyleSheet.create({
  textWithShadow:{
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10
  },
  slideIcon:{
    zIndex:100, 
    color:'#fff',
    position:'absolute',
    top:'50%',   
    //backgroundColor:'rgba(255, 255, 255, 0.50)',
    
  }

});

