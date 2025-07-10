// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import Navigation from './src/navigation'; // No NavigationContainer inside this!
import { StyleSheet } from 'react-native';
import {store} from './src/store';

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Provider store={store}>
          <BottomSheetModalProvider>
            <NavigationContainer independent={true}>
              <Navigation />
              <Toast />
            </NavigationContainer>
          </BottomSheetModalProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
export default App;
