import { atom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a custom atomWithStorage for React Native
const createAtomWithStorage = <T>(key: string, initialValue: T) => {
  const baseAtom = atom<T>(initialValue);
  
  // Load from AsyncStorage on atom creation
  AsyncStorage.getItem(key)
    .then(storedValue => {
      if (storedValue !== null) {
        try {
          // Try to parse JSON if it's not a string value
          const parsedValue = JSON.parse(storedValue);
          baseAtom.write(undefined, parsedValue);
        } catch (e) {
          // If it can't be parsed as JSON, use it as is
          baseAtom.write(undefined, storedValue as unknown as T);
        }
      }
    })
    .catch(err => console.error(`Error loading ${key} from AsyncStorage:`, err));
  
  // Wrapper atom that writes to AsyncStorage on change
  const atomWithStorage = atom(
    (get) => get(baseAtom),
    (get, set, update: T) => {
      set(baseAtom, update);
      AsyncStorage.setItem(key, JSON.stringify(update))
        .catch(err => console.error(`Error saving ${key} to AsyncStorage:`, err));
    }
  );
  
  return atomWithStorage;
};

// Create atoms for authentication
export const authTokenAtom = createAtomWithStorage<string | null>('authToken', null);

// You can add other atoms as needed
export const userProfileAtom = atom<{
  email: string;
  givenName: string;
  familyName: string;
  isAdmin: boolean;
} | null>(null);