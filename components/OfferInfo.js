import * as React from 'react';
import {  Image,  StyleSheet, Dimensions, ScrollView } from 'react-native';

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

    console.log(this.props);
    
    return (
      <Content style={{flex:1,}}>  
        <Card>

          <CardItem header>
            <Text>{this.props.title}</Text>
          </CardItem>
          
          <CardItem>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              <Image source={ {uri:this.props.image } } style={{ height: 200, width:300,  flex: 1 }} />
              <Image source={ {uri:this.props.image_1 } } style={{ height: 200, width:300, flex: 1 }} />
              <Image source={ {uri:this.props.image_2 } } style={{ height: 200, width:300, flex: 1 }} />

            </ScrollView>            

          {
            /* <Image source={ {uri:this.props.image } } style={{ height: 200, flex: 1 }} /> */
          }

          </CardItem>
          <CardItem> 
            <Body style={{}} >
              <MyWebView 
                //sets the activity indicator before loading content
                startInLoadingState={true}
                //source={{uri: 'https://github.com/facebook/react-native'}}
                originWhitelist={['*']}
                source={{ baseUrl: '', html: this.props.desc }}
                style={{ maxHeight:1000, width:SCREEN_WIDTH - 40, flex:1}}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scalesPageToFit={true}
              />            
            </Body>
          </CardItem>                
          <CardItem>
            <Left>
              <Button transparent>
                <Icon active name="md-cash" />
                <Text>${ this.props.price }</Text>
              </Button>
            </Left>
            <Right>
              <Text> { this.props.lang.expiresInDays.replace('$days',this.props.daysRemain) } </Text>
            </Right>
          </CardItem>
      
        </Card>       
      </Content>
      
    );
  }
}

const styles = StyleSheet.create({

});

