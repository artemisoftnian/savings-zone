import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  AsyncStorage,
  KeyboardAvoidingView,
  ImageBackground, ActivityIndicator
} from 'react-native';

import { Container,  Text,  Button,  Icon, Item, Input } from 'native-base'; 

import { connect } from 'react-redux';
import { loginUser, logOutUser } from './reducer';

import styles from './styles';
import bgSrc from '../../assets/images/wallpaper.png';

class LoginScreen extends React.Component {

	constructor(props){
		super(props);
		this.state = {
      validating: false,
      user:'',
			password: ''
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
       const{user,  password } = this.state;      
       const isAuth = await this.props.loginUser(user, password);
       const { user_meta } = this.props.user.user;
       const userType = user_meta.cupon_capabilities;

      if(isAuth) {
         if( userType.includes("merchant") ){
           this.props.navigation.navigate('Merchant');           
         }
         else{
           this.props.navigation.navigate('App');
         }
      }
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

      <Container>
        <ImageBackground source={bgSrc} style={{width: '100%', height: '100%'}}>
            <View style={styles.logoContainer}>
              <ImageBackground source={require('../../assets/logo-full.png')} style={styles.logo} />
            </View>   
            <KeyboardAvoidingView behavior="padding" enabled style={{margin:20}}>
                <Text style={{color:'red'}}>{ this.props.user.error }</Text>
                 <Button 
                    style={{backgroundColor:'rgba(41, 30, 38, 0.92)', marginBottom:30, width:'100%' }}
                    disabled={this.state.validating}
                    onPress={() => {
                      this.props.navigation.navigate('Register'); 
                    }}                  
                  >
                  <Text style={{fontWeight:'bold', textAlign:'center', width:'100%'}}>{screenProps.lang.login.registerButton}</Text>
                </Button>


                <Item rounded  style={styles.inputContainer} >
                  <Icon name='contact' style={{fontSize: 30, color: '#fff'}}/>
                  <Input 
                    onChangeText={text => this.setState({ user: text, errormessage: '' })}
                    placeholder='User' 
                    placeholderTextColor="#fff" 
                    style={{color:'#fff'}}
                    />

                </Item>
                <Item rounded style={styles.inputContainer}>
                  <Icon active name='lock' style={{fontSize: 30, color: '#fff'}}/>
                  <Input
                    secureTextEntry
                    onChangeText={text => this.setState({ password: text, errormessage: '' })}
                    placeholder='Password'
                    placeholderTextColor="#fff" 
                    style={{color:'#fff'}}
                    />                
                </Item>               
                              
                <Button 
                  block 
                  rounded
                  disabled={this.props.user.loading}
                  //disabled={this.state.validating}
                  onPress={() => {
                    if (this.state.user && this.state.password) {
                      this.validateUser();
                    }

                  }}                  
                >
                { this.props.user.loading ? <ActivityIndicator style={{alignSelf: 'center'}} color="#3a6a90" size="small"  /> : <Text style={{color:'#fff'}}>Login</Text> } 
                  
                </Button>

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