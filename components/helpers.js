export function alertContents () {
    const {alertType} = this.state; 
    const { screenProps } = this.props;

    if(alertType == 'fail'){
      return(
        <View style= {styles.customMessage}>
          <Image
              style={{width: 50, height: 50}}
              source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
          />    
          <Text style={{ marginTop:20 }}>¡oooohh ohhh!</Text>
          <Text>Ya tienes esta oferta</Text>
        </View>
      )
    }
    else if(alertType == 'unsubscribed'){
      return(
        <View style= {styles.alertMessageContainer}>            
          <Icon name="ios-close-circle" type="Ionicons" style={[styles.alertMessageIcon, {backgroundColor:'#d9534f'}]} />
          <View style={[styles.alertMessageBorder,{borderColor:'#d9534f'}]}>
            <Text style={styles.alertMessageH1}>{screenProps.lang.offerScreen.noSubscriptionMsg.h1}</Text>
            <Text style={styles.alertMessageH2}>{screenProps.lang.offerScreen.noSubscriptionMsg.h2}</Text>
            <Button full  
              style={{borderRadius:50, marginBottom:5, backgroundColor:'#47d782'}} 
              onPress = { () => { this.hideAlert(); this.props.navigation.navigate('Subscription')} } >
              <Text>{screenProps.lang.offerScreen.noSubscriptionMsg.confirm}</Text>               
            </Button>             
            <Button full warning style={{borderRadius:50}} onPress = { () => this.hideAlert() } >
              <Text>{screenProps.lang.offerScreen.noSubscriptionMsg.cancel}</Text> 
            </Button>
          </View>          
        </View>  
      )      
    }
    else{
      return(
        <View style= {styles.alertMessageContainer}>            
          <Icon name="thumbs-up" type="Ionicons" style={styles.alertMessageIcon} />
          <View style={[styles.alertMessageBorder,{borderColor:'#47d782'}]}>
            <Text style={styles.alertMessageH1}>{screenProps.lang.offerScreen.gotItMsg.h1}</Text>
            <Text style={styles.alertMessageH2}>{screenProps.lang.offerScreen.gotItMsg.h2}</Text>
            <Button small full transparent warning 
              style={styles.myOffersBtn} 
              onPress = { () => { this.hideAlert(); this.props.navigation.navigate('MyOffers')} } >
              <Text>{screenProps.lang.offerScreen.gotItMsg.confirm}</Text>               
            </Button>             
            <Button full style={styles.alertMessageConfirmBtn} onPress = { () => this.hideAlert() } >
              <Text>{screenProps.lang.offerScreen.gotItMsg.cancel}</Text> 
            </Button> 
          </View>           
        </View>
      )
    }
}