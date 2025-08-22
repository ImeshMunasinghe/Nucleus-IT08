import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import MainMenuScreen from './src/screens/MainMenuScreen';
import GameModeScreen from './src/screens/GameModeScreen';
import PlayModeScreen from './src/screens/PlayModeScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#FFD700" />
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFD700',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#1E3A8A',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen 
          name="MainMenu" 
          component={MainMenuScreen} 
          options={{ 
            title: 'MinionBot Controller',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="GameMode" 
          component={GameModeScreen} 
          options={{ 
            title: 'Game Mode',
            headerStyle: {
              backgroundColor: '#FFD700',
            },
          }} 
        />
        <Stack.Screen 
          name="PlayMode" 
          component={PlayModeScreen} 
          options={{ 
            title: 'Play Mode',
            headerStyle: {
              backgroundColor: '#FFD700',
            },
          }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            title: 'Settings',
            headerStyle: {
              backgroundColor: '#FFD700',
            },
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
