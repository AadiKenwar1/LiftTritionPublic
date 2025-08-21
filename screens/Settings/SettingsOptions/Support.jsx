import { View, Text, StyleSheet } from "react-native";
import CustomHeader from "../../../components/CustomHeader";

export default function SupportScreen() {
  return (
    <>
      <CustomHeader title={"Title"} showBack />
      <View style={styles.container}>
        <Text>ScreenName</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
});
