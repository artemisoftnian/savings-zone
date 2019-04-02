import * as React from 'react';
import PropTypes from 'prop-types';

import {
  View,
  AsyncStorage,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import { Text, Button, Item, Input } from 'native-base';

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
      password: '',
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

  _createUserHandler = () => {
    if (
      this.state.password == this.state.passwordCheck &&
      !this.state.password
    ) {
      return fetch(this.createUserEndPoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          app_check: 'savings_zone_app',
        },
        body: JSON.stringify({
          username: this.state.email,
          name: this.state.name,
          lastname: this.state.lastname,
          email: this.state.email,
          password: this.state.password,
          meta: { appSubscribed: false },
        }),
      })
        .then(response => response.json())
        .then(responseJson => {
          this.setState(
            {
              userRegistered: responseJson,
            },
            async function() {
              try {
                //console.log( JSON.stringify(responseJson));
                console.log('result', responseJson.return);
                if (responseJson.return == true) {
                  //this.props.navigation.navigate("Subscription");
                  this._handleUserCreated(responseJson);
                } else {
                  console.log(responseJson.message);
                  this.setState({ message: responseJson.message });
                }
              } catch (error) {
                // Error saving data
                console.log('errror creado el usuario, verificar en website');
              }
            }
          );
        })
        .catch(function(error) {
          console.log(
            'There has been a problem with your fetch operation: ' +
              error.message
          );
          // ADD THIS THROW error
          throw error;
        });
    } else {
      this.setState({ errormessage: "passwords don't match" });
    }
  };

  async saveToStorage(userData) {
    if (userData) {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      return true;
    }
    return false;
  }

  render() {
    //const { navigation } = this.props;

    return (
      <View
        style={{
          backgroundColor: '#fff',
          flex: 1,
          borderRadius: 10,
        }}>
        <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>
          Welcome
        </Text>
        <Text style={{ textAlign: 'center' }}>
          Sign up with your email address.
        </Text>
        <Text style={{ textAlign: 'center', color:'red' }}>
          {this.state.errormessage}
        </Text>

        <KeyboardAvoidingView  style={{ flex: 1, margin: 10, paddingBottom: 100 }}  behavior="position"  enabled>
          <ScrollView
            style={{ marginTop: 30 }}
            keyboardShouldPersistTaps="always">
            <Item>
              <Input
                placeholder="First Name"
                onChangeText={text =>  this.setState({ name: text, errormessage: '' }) }
              />
            </Item>
            <Item>
              <Input
                placeholder="Last Name"
                onChangeText={text =>  this.setState({ lastname: text, errormessage: '' }) }
              />
            </Item>
            <Item>
              <Input
                placeholder="Email Address"
                onChangeText={text => this.setState({ email: text, errormessage: '' }) }
              />
            </Item>
            <Item>
              <Input
                placeholder="Password"
                secureTextEntry
                onChangeText={text =>  this.setState({ password: text, errormessage: '' }) }
              />
            </Item>
            <Item>
              <Input
                placeholder="Verify Password"
                secureTextEntry
                onChangeText={text =>  this.setState({ passwordCheck: text, errormessage: '' }) }
              />
            </Item>
          </ScrollView>
        </KeyboardAvoidingView>

        <Button
          block
          disabled={this.state.validating}
          style={{ margin: 20 }}
          onPress={() => {
            //if (this.state.user && this.state.password) {
            //this.validateUser();
            //}
            this._createUserHandler();
          }}>
          <Text style={{ color: '#fff' }}>Sing Up</Text>
        </Button>
      </View>
    );
  }
}

export default RegisterScreen;
