import * as React from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  StyleSheet,
  AsyncStorage,
  Share
} from 'react-native';

import { ListItem } from 'react-native-elements';
import { connect } from 'react-redux';

import {Content,  Card,  CardItem,  Thumbnail,  Text, Icon,  Left,  Body } from 'native-base';

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
      subscribed: this.props.user.user_meta.subscribed, 
      userName: this.props.user.user_meta.first_name,
      userLastName: this.props.user.user_meta.last_name
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

  userInfo = () => {    
       return (
            <Content>
              <Card style={{flex: 0}}>
                <CardItem>
                  <Left>
                    <Thumbnail source={avatarImg} />
                    <Body>
                      <Text>{this.state.userName + " " + this.state.userLastName}</Text>
                      <Text note>Savings So Far: $55.49</Text>  
                      <Text note>Subscrition Util: November 25, 2019</Text>
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
        message: this.props.lang.myAccount.shareMessage,
        url: this.props.lang.myAccount.shareUrl,
        title: this.props.lang.myAccount.shareTitle
      }, {
        // Android only:
        dialogTitle: this.props.lang.myAccount.shareDialogAndroidOnlyTitle,
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
    

    const { navigate } = this.props.navigation;

    const  ClientInfo = [
          { 
            name: '', 
            savings: '$155.90', 
            avatar: require('../../assets/offer_img/300x150.png')
          }
     ];

    const  OptionsListEn = [
      {id:'1', optIcon:"md-trophy", optTitle: "My Offers", action: ()=>{ this.props.navigation.navigate('MyOffers') } },
      {id:'2', optIcon:"md-person-add", optTitle: "Invite Friends", action: ()=>{ this.onShare() } },
      {id:'3', optIcon:"md-help-circle", optTitle: "Help", action: ()=>{} },
      {id:'4', optIcon:"md-log-out", optTitle: "Log Out", action: ()=>{ this._handleLogOut() } },
    ]; 
     
    const  OptionsListEs = [
      {id:'1', optIcon:"md-trophy", optTitle: "Mis Ofertas", action: ()=>{ this.props.navigation.navigate('MyOffers') } },
      {id:'2', optIcon:"md-person-add", optTitle: "Invita a tus amigos", action: ()=>{ this.onShare() } },
      {id:'3', optIcon:"md-help-circle", optTitle: "Ayuda", action: ()=>{} },
      {id:'4', optIcon:"md-log-out", optTitle: "Cerrar Sesión", action: ()=>{ this._handleLogOut() } },
    ];         

    return (

      
      <MainWrapper
        //title="Savings Zone"
        onScanPress = {() => this.props.navigation.navigate('Scanner')}
        view ='horizontal'
        nav = { this.props.navigation }
        lang ={screenProps.lang} 
      > 
      <FlatList         
        ListHeaderComponent={  this.userInfo() }
        data={ ( screenProps.lang.myAccount.optionList == 'es' ) ? OptionsListEs : OptionsListEn }        
        extraData={this.state}
        style={{ marginTop:30 }}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item }) => {
          return (
              <ListItem
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


