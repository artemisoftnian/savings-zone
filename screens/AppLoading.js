<<<<<<< HEAD
import * as React from 'react';
import { View, StatusBar, ActivityIndicator, Text} from 'react-native';
import { connect } from "react-redux";


class AppLoading extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

   // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {

    const {isAuth, user} = this.props.user;
    //console.log(isAuth, user);
    var navPath = "App";
        
    if(isAuth){
      if(this.props.user.user.user_meta.cupon_capabilities.includes("merchant"))
        navPath = "Merchant";

      this.props.navigation.navigate(navPath);
    }
    else{
      this.props.navigation.navigate("Auth");
    }

  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={{flex:1}}>
        <ActivityIndicator style={{flex:1}} />
        <Text style={{textAlign:'center'}}> Loading... </Text>
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const mapStateToProps = state => {
    const { user } = state;
    return { user: {...user, ...user.user}  };
};

export default connect(mapStateToProps, null )(AppLoading);
=======
import * as React from 'react';
import { View, StatusBar, ActivityIndicator, Text} from 'react-native';
import { connect } from "react-redux";


class AppLoading extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

   // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {

    const {isAuth, user} = this.props.user;
    //console.log(isAuth, user);
    var navPath = "App";
        
    if(isAuth){
      if(this.props.user.user.user_meta.cupon_capabilities.includes("merchant"))
        navPath = "Merchant";

      this.props.navigation.navigate(navPath);
    }
    else{
      this.props.navigation.navigate("Auth");
    }

  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={{flex:1}}>
        <ActivityIndicator style={{flex:1}} />
        <Text style={{textAlign:'center'}}> Loading... </Text>
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const mapStateToProps = state => {
    const { user } = state;
    return { user: {...user, ...user.user}  };
};

export default connect(mapStateToProps, null )(AppLoading);
>>>>>>> 8afe828627badbc7538961adcb877521f4fa42a4
