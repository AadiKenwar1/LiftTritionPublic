import { Alert } from 'react-native';

export default function FailureAlert(message, title = 'Sorry it seems like something went wrong') {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Close',
        style: 'default',
      },
    ],
    { cancelable: true }
  );
}
