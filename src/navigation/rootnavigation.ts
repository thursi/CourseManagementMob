import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '.';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
