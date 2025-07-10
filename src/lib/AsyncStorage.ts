import AsyncStorage from '@react-native-async-storage/async-storage';

export const setData = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log('storeData error', e);
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    console.log('getData error', e);
  }
};

export const removeData = async (key: string) => {
  try {
    const value = await AsyncStorage.removeItem(key);
    return value;
  } catch (e) {
    console.log('removeData error', e);
  }
};
