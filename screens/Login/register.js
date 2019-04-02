import * as React from 'react';
import PropTypes from 'prop-types';

import {
  View,
  AsyncStorage,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import { Text, Button, Item} from 'native-base';
import { Container, Content, List, ListItem, InputGroup, Input, Icon } from 'native-base';

import { connect } from 'react-redux';
import {registerUser} from '../Login/reducer';

class RegisterScreen extends React.Component {
  setUserStatusUrl = global.wpSite + '/wp-json/apphelper/v2/user-status';
  //createUserEndPoint = global.wpSite + '/wp/v2/users';
  createUserEndPoint = global.wpSite + '/wp-json/svapphelper/v2/users';

  logUrl = global.wpSite + '/wp-json/apphelper/v2/log';

  constructor(props) {
    super(props);
    this.state = {
      validating: false,
      user: '',
      name:'',
      lastname:'',
      modalVisible: true,
    };
  }

  static propTypes = {
    navigation: PropTypes.object.isRequired,
  };

  static navigationOptions = {
    title: 'Login',
    header: '',
  };

  componentDidMount() {

  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <Text>Step 1: Sign Up</Text>,
      headerTitleStyle: { flex: 1, textAlign: 'center' },
    };
  };

  _handleUserCreated = async userData => {
    if (userData) {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData)).then(
        () => this.props.navigation.navigate('Subscription')
      );
    }
  };

  registerUser = async () => {
    if ( this.state.passwordMatch && this.state.validEmail) {
      const response = await this.props.registerUser(this.state.email, this.state.password, this.state.name, this.state.lastname);

      if(response)
         this.props.navigation.navigate('Subscription');

      if(this.props.user.error)
        this.setState({ errormessage: this.props.user.error });

    } else {
      
      if(!this.state.validEmail)
      this.setState({ errormessage: "email not valid" });
      
      if (!this.state.passwordMatch)
        this.setState({ errormessage: "passwords must match" });

    }
  };

  async saveToStorage(userData) {
    if (userData) {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      return true;
    }
    return false;
  }

  validateEmail = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
      if(reg.test(text) === false){
      this.setState({email:text, validEmail:false})
      return false;
    }
    else {
      this.setState({email:text, validEmail:true})
    }
  }

  validatePassword = (text) => {
    if(!text){
      this.setState({passwordCheck:'',   passwordMatch:false, errormessage: ''})
      return false;
    }

    if( text !== this.state.password  ){
      this.setState({passwordCheck:text, passwordMatch:false, errormessage: ''})
      return false;
    }
    else {
      this.setState({passwordCheck:text, passwordMatch:true, errormessage: ''})
    }
  }  

  render() {
    const {screenProps} = this.props;

    return (
      <View
        style={{ backgroundColor: '#fff', flex: 1, borderRadius: 10  }}>
        <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}> { screenProps.lang.register.welcomeMessage }  </Text>
        <Text style={{ textAlign: 'center' }}> { screenProps.lang.register.signUpMessage } </Text> 
        
        <Container>
        
                <Content padder>
                <KeyboardAvoidingView  style={{ flex: 1, margin: 10}}  behavior="padding"  enabled>
                  <ScrollView>

                    <Content> 
                          <Item success={this.state.validEmail ? true : false} >
                            <Icon name='mail' />
                            <Input placeholder={ screenProps.lang.register.emailPH } autoCapitalize='none' autoComplete='email' keyboardType='email-address'  
                              onChangeText={(text) => this.validateEmail(text)} 
                              value={this.state.email}
                            />
                            { this.state.validEmail ? <Icon name='checkmark-circle' /> : null }
                            
                          </Item>  
                      
                          <Item>
                            <Icon name='unlock' />
                            <Input placeholder={ screenProps.lang.register.passwordPH } secureTextEntry={true} 
                              onChangeText={text =>  this.setState({ password: text, errormessage: '' }) }
                            />                          
                          </Item>

                          <Item 
                              success={this.state.passwordMatch ? true : false}
                              error={ !this.state.passwordMatch ? true : false}
                          >
                            <Icon name='unlock'/>
                            <Input placeholder={ screenProps.lang.register.verifyPasswordPH } secureTextEntry={true}
                              onChangeText={(text) => this.validatePassword(text)}
                              value={this.state.passwordCheck}
                            />
                            <Icon name={ this.state.passwordMatch ? 'checkmark-circle' : 'close-circle' } />
                          </Item>                        
                      
                          <Item>
                            <Icon name='person' />
                            <Input placeholder={ screenProps.lang.register.namePH } autoComplete='name'  onChangeText={text =>  this.setState({ name: text , errormessage: ''}) } />                          
                          </Item>
                      
                          <Item> 
                              <Icon name='person' />                            
                              <Input  placeholder={ screenProps.lang.register.lastNamePH } autoComplete='lastname' onChangeText={text =>  this.setState({ lastname: text , errormessage: ''}) } />
                          </Item>
                        </Content> 

                    </ScrollView>
                  </KeyboardAvoidingView>
                </Content>
                
            </Container>
            

        <Text style={{ textAlign: 'center', color:'red' }}>
          {this.state.errormessage}
        </Text>

        <Button
          block
          disabled={this.state.validating}
          style={{ margin: 20 }}
          onPress={() => {
            //if (this.state.user && this.state.password) {
            //this.validateUser();
            //}
            this.registerUser();
          }}>
          <Text style={{ color: '#fff' }}>Sing Up</Text>
        </Button>
      </View>
    );
  }
}


const mapStateToProps = state => {
	const { user, offerList, merchant } = state;
	return { user: { ...user, ...user.user }, offerList, merchant };
};

export default connect( mapStateToProps, { registerUser } )(RegisterScreen);

