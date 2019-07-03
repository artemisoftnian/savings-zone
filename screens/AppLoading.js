import * as React from 'react';
import { View, StatusBar, ActivityIndicator, Text} from 'react-native';
import { connect } from "react-redux";
import { Font } from 'expo';


class AppLoading extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }


  async componentDidMount(){
  }

   // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {

    const {isAuth, user, user_meta} = this.props.user;

    if(isAuth){

      var userType = "";  
      var prefix = "cupon_capabilities";
      if(user_meta[prefix] == undefined){
        prefix = "wp_capabilities";
      }
      
      userType = await user_meta[prefix];
      isMerchant = userType.includes("merchant");

      try{
        if( isMerchant ){
          this.props.navigation.navigate('Merchant');           
        }
        else{
          this.props.navigation.navigate('App');
        }
      }
      catch(e){
        console.log(e);
      }
    }
    else{
      this.props.navigation.navigate("Auth");
    }

  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={{flex:1}} testID="appLoadingView">
        <ActivityIndicator style={{flex:1}} />
        <Text textAlign='center'> Loading... </Text>
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
