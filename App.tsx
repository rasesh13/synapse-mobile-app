import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <NetworkProvider>
            <NavigationContainer>
              <View style={styles.root}>
                <StatusBar
                  barStyle="light-content"
                  backgroundColor="#090d16"
                  translucent={false}
                />
                <BottomTabNavigator />
              </View>
            </NavigationContainer>
          </NetworkProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090d16',
  },
});
