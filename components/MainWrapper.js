import * as React from 'react';
import { Image, StyleSheet } from 'react-native';
import {Constants} from 'expo'; 

import { SearchBar } from 'react-native-elements'; 

import {
  Container,  Header,  Content,  Text,  Button,  Icon, Left,  Body,  Right,  Footer, FooterTab
} from 'native-base';


export default class MainWrapper extends React.Component {

  searchBar = () => {

    if(this.props.useSearchBar){ 
      return ( 

        <SearchBar 
          lightTheme
          placeholder= { this.props.lang.main.searchBarPH }//"Offer Search"
          onChangeText={text => this.props.searchFunction(text) }  
          containerStyle={ { backgroundColor:'transparent', borderBottomWidth:0} }
          inputStyle={ { backgroundColor:'#fff',  borderStyle:'solid', borderWidth:0, elevation:2 } } 
        />

      );
    }
  }; 

  showFooter = () => {
    if(this.props.showFooter){
      return ( 
        <Footer> 
          <FooterTab  style={{backgroundColor:"#4e2e59"}}> 
            <Button vertical 
              onPress={ () => this.props.nav.navigate('Offers') }
            >
              <Icon name="md-home" type="Ionicons" style={styles.iconColor} /> 
              <Text style={styles.iconColor}>{this.props.lang.main.homeIconText}</Text>
            </Button>
            <Button vertical
              onPress={ () => this.props.nav.navigate('Map') }
            >
              <Icon name="md-map" style={styles.iconColor}/>
              <Text style={styles.iconColor}>{this.props.lang.main.mapsIconText}</Text>
            </Button>
            {/*
            <Button vertical
              onPress={ () => this.props.nav.navigate('MyOffers') }
            >
              <Icon name="md-pricetags" />
              <Text>offers</Text>
            </Button>
            */}            
            <Button vertical 
              onPress={ () => this.props.nav.navigate('UserProfile') }
            >
              <Icon name="md-person" style={styles.iconColor}/>
              <Text style={styles.iconColor} >{this.props.lang.main.accountIconText}</Text>
            </Button>
          </FooterTab>
        </Footer> 
      );
    }
  };         

  render() {

    const {screenProps} = this.props;

    return (
      <Container style={{flex: 1, backgroundColor:'#F5F5F5'}}>
        <Header
        style={styles.header}
        noLeft
        >
          <Left>
            <Image  source={require('../assets/logo-text.png')}  style={{  height: 25 }} resizeMode="contain" /> 
          </Left>
          <Body>
            {/*<Title>{this.props.title}</Title>*/}
          </Body>
          <Right>
              <Button
                transparent
                onPress={ this.props.onScanPress  }
              >

              <Icon name='md-cart' type='Ionicons' style={{color:'#4e2e59', fontSize:30}}/>
            </Button>
          </Right> 
        </Header>

        {this.searchBar()}         
        
        <Content
          style={{ flex: 1 }}
          refreshControl={this.props.refreshFunction}
        >
          {this.props.children}       
        </Content>
        {this.showFooter()}                
      </Container>     
      
    );
  }
}

MainWrapper.defaultProps = { 
  showFooter: true,
};


const styles = StyleSheet.create({
  header:{
    paddingTop: Constants.statusBarHeight,
    paddingLeft:0,
    paddingBottom:20,
    marginTop:20, 
    backgroundColor:'#fff',
    borderBottomWidth:1,
    borderBottomColor:'#a182cc'  
  },
  iconColor:{
    color:'#fff'
  }

});

