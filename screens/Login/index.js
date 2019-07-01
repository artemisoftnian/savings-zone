import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  AsyncStorage,
  KeyboardAvoidingView,
  ImageBackground, ActivityIndicator
} from 'react-native';

import { Container,  Text,  Button,  Icon, Item, Input, Toast} from 'native-base'; 

import { connect } from 'react-redux';
import { loginUser, logOutUser } from './reducer';

import styles from './styles';
import bgSrc from '../../assets/images/wallpaper.png';


class LoginScreen extends React.Component {

	constructor(props){
		super(props);
		this.state = {
      validating: false,
      user: global.testing==true?'test@test.com':'' ,
			password: global.testing==true?'test':'' ,
		};
  }

  static propTypes = {
    navigation: PropTypes.object.isRequired,  
  };

  static navigationOptions = {
    title: 'Login',
    header: null,
  };

  async validateUser() { 
      try{
          const{user,  password } = this.state;      
          const isAuth = await this.props.loginUser(user, password);
          const { user_meta } = this.props.user.user;

          var userType = "";

          var prefix = "cupon_capabilities";
          if(user_meta[prefix] == undefined){
            prefix = "wp_capabilities";
          }

          userType = await user_meta[prefix];
          isMerchant = userType.includes("merchant");
  
        if(isAuth) {
            if( isMerchant ){
              this.props.navigation.navigate('Merchant');           
            }
            else{
              this.props.navigation.navigate('App');
            }
        }        
       }catch(error){
          console.log(error)
      };    

	}

  async saveToStorage(userData) {
    if (userData) {
      await AsyncStorage.setItem('user_data',  JSON.stringify(userData));
      return true;
    }
    return false;
  }


  render() {
    const { screenProps } = this.props;

    return (      

      <Container testID="logInView">
        <ImageBackground source={bgSrc} style={{width: '100%', height: '100%'}}>
            <View style={styles.logoContainer}>
              <ImageBackground source={require('../../assets/logo-full.png')} style={styles.logo} />
            </View>   
            <KeyboardAvoidingView behavior="padding" enabled style={{margin:20}}>
                 
                 <Button 
                    style={{backgroundColor:'rgba(41, 30, 38, 0.92)', marginBottom:30, width:'100%', borderRadius:10 }}
                    disabled={this.state.validating}
                    onPress={() => {
                      this.props.navigation.navigate('Register'); 
                    }}                  
                  >
                  <Text adjustsFontSizeToFit numberOfLines={1} style={{fontWeight:'bold', textAlign:'center', width:'100%'}}>{screenProps.lang.login.registerButton}</Text>
                </Button>
              

                <Item rounded  style={styles.inputContainer} accessible={global.testing==true?false:true} >
                  <Icon name='md-contact' style={{fontSize: 30, color: '#fff'}}/>
                  <Input 
                    onChangeText={text => this.setState({ user: text, errormessage: '' })}
                    placeholder='User' 
                    placeholderTextColor="#fff"
                    autoCapitalize = 'none'
                    style={{color:'#fff'}}
                    testID="userField"
                    />

                </Item>
                <Item rounded style={styles.inputContainer} accessible={global.testing==true?false:true} >
                  <Icon active name='md-lock' style={{fontSize: 30, color: '#fff'}}/>
                  <Input
                    secureTextEntry
                    onChangeText={text => this.setState({ password: text, errormessage: '' })}
                    placeholder='Password'
                    placeholderTextColor="#fff" 
                    style={{color:'#fff'}}
                    testID="passwordField"
                    />                
                </Item>               
                              
                <Button
                  testID="logInButton" 
                  block 
                  rounded
                  disabled={this.props.user.loading}
                  //disabled={this.state.validating}
                  style={{backgroundColor:'transparent', borderWidth:1, borderColor:'gray', marginBottom:20, elevation:1}}
                  onPress={() => {
                    if (this.state.user && this.state.password) { 
                      this.validateUser();
                    }

                  }}                  
                >

                  {
                    global.testing==false?
                      this.props.user.loading ? <ActivityIndicator style={{alignSelf: 'center'}} color="#fff" size="small"  /> : <Text style={{color:'#fff'}}>Login</Text>
                    :
                      <Text style={{color:'#fff'}}>Login</Text>
                  }

                {  } 
                  
                </Button>
                <Text style={{color:'yellow', textAlign:'center'}}>{ this.props.user.error }</Text>
            </KeyboardAvoidingView>
        </ImageBackground>
      </Container>
    );
  }
}

const mapStateToProps = state => {
    const { user } = state;
    return { user };
};

export default connect(mapStateToProps, { loginUser, logOutUser } )(LoginScreen);