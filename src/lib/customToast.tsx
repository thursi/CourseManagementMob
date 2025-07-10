import {AddCircle, TickCircle} from 'iconsax-react-native';
import {Text, View} from 'react-native';
import {BaseToast, ErrorToast} from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: 'pink'}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),

  sucessToast: ({text1}: any) => (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        maxWidth: '90%',
      }}>
      <TickCircle
        size="28"
        color="#2FD357"
        variant="Bold"
        style={{alignSelf: 'center'}}
      />
      <Text
        style={{
          fontFamily: 'Quicksand-Medium',
          color: '#000',
          fontSize: 15,
          marginTop: 2,
        }}>
        {text1}
      </Text>
    </View>
  ),
  errorToast: ({text1}: any) => (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        maxWidth: '90%',
      }}>
      <AddCircle
        size="28"
        color="#FF443E"
        variant="Bold"
        style={{alignSelf: 'center', transform: [{rotate: '45deg'}]}}
      />
      <Text
        style={{
          fontFamily: 'Quicksand-Medium',
          color: '#000',
          fontSize: 15,
          marginTop: 2,
        }}>
        {text1}
      </Text>
    </View>
  ),
};
