import * as React from 'react';
import {  Image,  StyleSheet, Dimensions, ScrollView, ActivityIndicator, View, Animated} from 'react-native';

import MyWebView from 'react-native-webview-autoheight';
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

//import { WebView } from "react-native-webview";

import {Content,  Card,  CardItem, Text,  Button,  Icon, Left,  Body,  Right } from 'native-base';

export default class OfferInfo extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        loadingImages:false,
        loadingData: false,
        caruselPosition: 1
    };

  }  


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

  _ChangeStyle() {
    this['img_num_2'].setNativeProps({style: {backgroundColor:'blue'}});
  }

  scrollX = new Animated.Value(0); // this will be the scroll location of our ScrollView

  render() {  

    const { image, category, title, desc  } = this.props;
    let position = Animated.divide(this.scrollX, SCREEN_WIDTH);

    var imageArray = image.filter(function(img) {
      if (img == "") {
        return false; // skip
      }
      return true;
    });   

    //console.log("final Image Array", imageArray);

    
    return (
      <Content style={{flex:1,marginTop:0, marginBottom:0, marginLeft:0, marginRight:0, paddingLeft:0, paddingRight:0}}>  
        <ScrollView
          horizontal //scrolling left to right instead of top to bottom
          showsHorizontalScrollIndicator={false} //hides native scrollbar
          scrollEventThrottle={20} //how often we update the position of the indicator bar
          pagingEnabled //scrolls from one image to the next, instead of allowing any value inbetween
          style={{ backgroundColor:'lightgray', minHeight: 200 }}
          endFillColor={'lightgray'}
          // the onScroll prop will pass a nativeEvent object to a function
          onScroll={Animated.event( // Animated.event returns a function that takes an array where the first element...
            [{ nativeEvent: { contentOffset: { x: this.scrollX } } }] // ... is an object that maps any nativeEvent prop to a variable
          )} // in this case we are mapping the value of nativeEvent.contentOffset.x to this.scrollX
        >        
          {         
            imageArray.map(              
              image => (
                <Image key={image} source={ {uri:image , cache: 'default'} } style={{ height: 200, width:SCREEN_WIDTH, backgroundColor:'lightgray' }} />
              )
            )
          }

        </ScrollView>

        {
          (imageArray.length>1)
          ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                {imageArray.map((_, i) => {
                  let opacity = position.interpolate({
                    inputRange: [i - 1, i, i + 1], // each dot will need to have an opacity of 1 when position is equal to their index (i)
                    outputRange: [0.3, 1, 0.3], // when position is not i, the opacity of the dot will animate to 0.3
                    extrapolate: 'clamp' // this will prevent the opacity of the dots from going outside of the outputRange (i.e. opacity will not be less than 0.3)
                  });
                  return (
                    <Animated.View
                      key={i}
                      style={{ opacity, height: 10, width: 10, backgroundColor: '#595959', margin: 3, marginTop:5, borderRadius: 5 }}
                    />
                  );
                })}
              </View>
          </View>          
          :          
          null
        }

        <Card transparent>

          <CardItem cardBody>           
            <Text style={{fontSize:10, color:'#555', fontWeight:'bold', marginLeft:20 }}>{category}</Text>
          </CardItem>        

          <CardItem>           
            <Text style={{fontSize:18, color:'#555', fontWeight:'bold'}}>{title}</Text>
          </CardItem>

          <CardItem> 
              <MyWebView 
                //sets the activity indicator before loading content
                startInLoadingState={true}
                originWhitelist={['*']}
                source={{ baseUrl: '', html: desc }}
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

