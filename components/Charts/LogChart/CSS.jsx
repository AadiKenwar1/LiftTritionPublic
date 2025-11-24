const { width: screenWidth } = Dimensions.get('window');
import {Dimensions} from "react-native";

//#2D9CFF
//#4CD964
export default function getStyles(mode){
    return{
    container: {
    width: screenWidth-32,
    height: screenWidth + 5 ,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingTop: 7,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey'
  },
  innerContainer: {
    overflow: "hidden",
    //height: 230,
  },
  graphHeaderContainer: {
    width: '90%',    // or a fixed width like 300
    alignSelf: 'center',
  },
  graphHeaderText:{
    textAlign:"center",
    fontSize:20,
    fontWeight:'bold',
    marginBottom:10
  },
  helpButton: {
    position: "absolute",
    top: 0,
    right: 4,
    zIndex: 1,
  },
  insightButton: {
    position: "absolute",
    top: 40,
    right: 1,
    zIndex: 1,
  },
  changeSelected:{
    backgroundColor: mode === true ? "#2D9CFF" : '#4CD964',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop:5,
    marginBottom:20,
    shadowColor: "black",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 3,
      borderWidth: 0.3,
      borderColor: 'grey',
  },
  changeSelectedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    flexShrink: 1,
    fontFamily: 'Inter_500Medium'
  },
  dataSelector: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 0,

  },
  dataSelectorButton: {
    backgroundColor: mode === true ? "#2D9CFF" : '#4CD964',
    height: 40,
    width: "30%",
    borderRadius: 10,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: 'grey',
  },
  dataSelectorButtonClicked: {
      backgroundColor: mode === true? "#00538f":"green",
      height: 40*1.05,
      width: "30%",
      borderRadius: 10,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 0,
      shadowColor: "black",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 3,
      borderWidth: 0.3,
      borderColor: 'grey',
  },
  dataSelectorText:{
    color:'white',
    fontSize:14,
    fontFamily: 'Inter_400Regular',
  },
  closeButton: {
    backgroundColor: "grey",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderColor: "black",
    elevation: 4,
    borderWidth: 1.3,
    borderColor: 'black',
    borderBottomWidth: 6,
    borderBottomColor: 'black',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  }
    }
}