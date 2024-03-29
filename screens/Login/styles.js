import { StyleSheet, Dimensions, Platform  } from 'react-native';

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

export default StyleSheet.create({
	mainView: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: '10%'
	},
	inputStyle: {
		paddingVertical: 12,
		paddingHorizontal: 10,
		color: '#fff',
		textAlign: 'center'
	},
	pageTitle: {
		fontSize: 36,
		color: '#3a6a90',
		marginTop: 20
	},
  inputContainer: {
    borderWidth: 0, // size/width of the border
    borderColor: '#b3b3b3', // color of the border
    backgroundColor: 'rgba(46, 51, 51, 0.7)',
    marginBottom:20
  },
  logoContainer: {
    flex: 1,
    marginTop: deviceHeight / 8,
    marginBottom:20
  },
  logo: {
    position: "absolute",
    left: Platform.OS === "android" ? (deviceWidth/2)-150 : (deviceWidth/2)-150,
    top: Platform.OS === "android" ? 35 : 60,
    width: 280,
    height: 100
  }, 
  registerlogoContainer: {
    flex: 1,
    marginTop: 20,
    marginBottom:100
  },  
  registerlogo: {
    width: 280,
    height: 100
  }, 

  noPadding:{
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  modalStyle:{
    backgroundColor:'#fff', 
    flex:1, 
    borderRadius: 10,
    margin:5, 
    padding:10, 
    marginBottom:0, 
    borderBottomStartRadius:0, 
    borderBottomEndRadius:0
  }    

});