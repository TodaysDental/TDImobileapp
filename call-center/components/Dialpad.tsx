import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface DialpadProps {
  onNumberChange: React.Dispatch<React.SetStateAction<string>>;
  currentNumber: string;
}

/**
 * A simple UI component for the dialpad in React Native.
 */
export const Dialpad: React.FC<DialpadProps> = ({ onNumberChange, currentNumber }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  const handleKeyClick = (key: string) => {
    onNumberChange(currentNumber + key);
  };

  const handleBackspace = () => {
    onNumberChange(currentNumber.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={currentNumber}
          onChangeText={onNumberChange}
          placeholder="+15551234567"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={styles.backspaceButton}
          onPress={handleBackspace}
          accessibilityLabel="Backspace"
        >
          <MaterialIcons name="phone" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.keypad}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => handleKeyClick(key)}
            accessibilityLabel={`Dialpad key ${key}`}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff'
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden'
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 18,
    textAlign: 'right'
  },
  backspaceButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    backgroundColor: '#f5f5f5'
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: '31%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  }
});

export default Dialpad;