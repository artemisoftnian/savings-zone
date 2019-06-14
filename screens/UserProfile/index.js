import * as React from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
  Share, Linking
} from 'react-native';

import { ListItem } from 'react-native-elements';
import { connect } from 'react-redux';
import moment from 'moment';

import {Content,  Card,  CardItem,  Thumbnail,  Text, Icon,  Left,  Body, Button } from 'native-base';

import MainWrapper from '../../components/MainWrapper';
const avatarImg = require('../../assets/avatar.png');

import { logOutUser } from '../Login/reducer';


class UserProfileScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      loading: false,
      error: '',
      user: [],
      subscribed: false,
      userName:'',
      userLastName: ''
    };
  }

  static navigationOptions = {
    title: 'Offer List',
    header: null,
  };  

  taskListurl = global.wpSite + '/wp-json/apphelper/v2/tasks';


   //await AsyncStorage.removeItem('user')
  async componentWillMount() {

    this.setState({ 
      user: this.props.user, 
      subscribed: this.props.user.user_meta.app_subscribed, 
      userName: this.props.user.user_meta.first_name,
      userLastName: this.props.user.user_meta.last_name,
      subscriptionExpDate: this.props.user.user_meta.subscription_exp_date
    });

  }

  async componentDidMount() {
    //this.checkOrFetchData();
  }

  fetchOfferData = async () => {}; 

  _handleLogOut = async () => {
    const isAuth = await this.props.logOutUser(); 
    this.props.navigation.navigate('Auth');
  };

  getUserDates = (userDate) => {
    userDate = userDate/1000;  //Fix for ms epoch from apple // Save on database as seconds next time
    var start = moment.unix(userDate).format('DD-MM-YYYY hh:mm A');
    var end   = moment.unix(userDate).add(1, 'M').format('DD-MM-YYYY hh:mm A');
    return {'start':start, 'end':end }; 
  }

  userInfo = () => {    
    const {screenProps} = this.props;
    var dates = this.getUserDates(this.state.subscriptionExpDate);
       return (
            <Content style={{marginTop:0}}>
              <Card style={{flex: 0, marginTop:0}}>
                <CardItem style={{marginTop:0}}>
                  <Left>
                    <Thumbnail source={avatarImg} /> 
                    <Body>
                      <Text>{this.state.userName + " " + this.state.userLastName}</Text>
                      {
                        (this.state.subscribed == "true") ?
                        [
                        <Text key="algo1" note>Subscrition From:  {dates.start}</Text>,
                        <Text  key="algo2" note>Subscrition Util:  {dates.end}</Text>]
                        :
                        [
                        <Text key="algo1" >{'\u2022'}{this.props.screenProps.lang.offerScreen.noSubscriptionMsg.h2}</Text>, 
                        <Button testID="gotoSubscription"  key="algo2" small block dark 
                          style={{marginTop:1}} 
                          onPress = { ()=>{ this.props.navigation.navigate('Subscription') }  } >                           
                          <Text style={{}}>{this.props.screenProps.lang.offerScreen.noSubscriptionMsg.confirm}</Text>               
                        </Button>
                        ]
                      }

                    </Body>
                  </Left>
                </CardItem>
               </Card>
            </Content>
        );
  }

  onShare = async () => {
    try {
      const result = await Share.share({
        message: this.props.screenProps.lang.myAccount.shareMessage,
        url: this.props.screenProps.lang.myAccount.shareUrl,
        title: this.props.screenProps.lang.myAccount.shareTitle
      }, {
        // Android only:
        dialogTitle: this.props.screenProps.lang.myAccount.shareDialogAndroidOnlyTitle,
        // iOS only:
        excludedActivityTypes: [
          'com.apple.UIKit.activity.PostToTwitter'
        ]
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  _openUrl = (url)=> {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  }

  render() {
    const { screenProps } = this.props;


    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }

    const iosSubs = this.props.screenProps.lang.myAccount.iosManageSusbsriptionUrl; 
    const androidSubs = this.props.screenProps.lang.myAccount.androidManageSusbsriptionUrl;

    const { navigate } = this.props.navigation;

    const  OptionsListEn = [
      {id:'1', optIcon:"md-cart", optTitle: "My Offers", action: ()=>{ this.props.navigation.navigate('MyOffers') } },
      {id:'2', optIcon:"md-share", optTitle: "Invite Friends", action: ()=>{ this.onShare() } },
      {id:'3', optIcon:"md-help-circle", optTitle: "Help", action: ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.helpUrl)  } },
      {id:'4', optIcon:"md-fingerprint", optTitle: "Privacy Policy", action: ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.privacyPolicyUrl) } },
      {id:'5', optIcon:"md-clipboard", optTitle: "Terms and Conditions", action: ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.termsConditionsUrl) } },
      {id:'7', optIcon:"md-settings", optTitle:"Manage Subscription", action:()=>{this._openUrl(Platform.OS === 'ios' ? iosSubs : androidSubs) } }, 
      {id:'6', optIcon:"md-log-out", optTitle: "Log Out", action: ()=>{ this._handleLogOut() } },
    ]; 
     
    const  OptionsListEs = [
      {id:'1', optIcon:"md-cart", optTitle: "Mis Ofertas", action: ()=>{ this.props.navigation.navigate('MyOffers') } },
      {id:'2', optIcon:"md-share", optTitle: "Invita a tus amigos", action: ()=>{ this.onShare() } },
      {id:'3', optIcon:"md-help-circle", optTitle: "Ayuda", action: ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.helpUrl)  } },
      {id:'4', optIcon:"md-finger-print", optTitle: "Políticas de Privacidad", action: ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.privacyPolicyUrl) } },
      {id:'5', optIcon:"md-clipboard", optTitle: "Terminos y Condiciones", action: ()=>{ this._openUrl(this.props.screenProps.lang.myAccount.termsConditionsUrl) } },
      {id:'7', optIcon:"md-settings", optTitle:"Manage Subscription", action:()=>{this._openUrl(Platform.OS === 'ios' ? iosSubs : androidSubs) } }, 
      {id:'6', optIcon:"md-log-out", optTitle: "Cerrar Sesión", action: ()=>{ this._handleLogOut() } },
    ];         

    return (

      
      <MainWrapper
        //title="Savings Zone"
        onScanPress = {() => this.props.navigation.navigate('MyOffers')}
        view ='horizontal'
        nav = { this.props.navigation }
        lang ={screenProps.lang} 
      > 
      <FlatList         
        ListHeaderComponent={  this.userInfo() }
        data={ ( screenProps.lang.myAccount.optionList == 'es' ) ? OptionsListEs : OptionsListEn }        
        extraData={this.state}
        style={{ marginTop:2 }}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item }) => {
          return (
              <ListItem
                testID={'#'+item.id.toString()}
                roundAvatar
                title={item.optTitle}
                key={item.id} 
                titleStyle={ {color: '#000'} }
                onPress={ item.action }
                leftIcon={  <Icon name={item.optIcon} type='Ionicons' style={{color:'#000', paddingRight:10}} />   } 
              />
          );
        }}        
      />

      </MainWrapper>
    );
  }
}

const styles = StyleSheet.create({

});

const mapStateToProps = state => {
	const { user, offerList } = state;
	return { user: { ...user, ...user.user }, offerList };
};

export default connect(mapStateToProps, { logOutUser } )(UserProfileScreen);


