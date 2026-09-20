import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { VoiceScreen } from '../screens/VoiceScreen';
import { RecordsScreen } from '../screens/RecordsScreen';
import { WhatsAppScreen } from '../screens/WhatsAppScreen';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tab_home') || 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Text style={styles.tabIcon}>🏠</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          tabBarLabel: t('tab_chat') || 'AI Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Text style={styles.tabIcon}>🩺</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="VoiceTab"
        component={VoiceScreen}
        options={{
          tabBarLabel: t('tab_voice') || 'Voice',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.centerVoiceButton,
                focused && styles.centerVoiceButtonActive,
              ]}
            >
              <Text style={styles.centerVoiceIcon}>🎙️</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="RecordsTab"
        component={RecordsScreen}
        options={{
          tabBarLabel: t('tab_records') || 'Records',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Text style={styles.tabIcon}>🆔</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="WhatsAppTab"
        component={WhatsAppScreen}
        options={{
          tabBarLabel: t('tab_whatsapp') || 'WhatsApp',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <Text style={styles.tabIcon}>💬</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    height: Platform.OS === 'android' ? 66 : 78,
    paddingBottom: Platform.OS === 'android' ? 8 : 20,
    paddingTop: 8,
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPill: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 30,
    borderRadius: 15,
  },
  iconPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  tabIcon: {
    fontSize: 18,
  },
  centerVoiceButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#132038',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -14,
    borderWidth: 2,
    borderColor: '#06b6d4',
    elevation: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  centerVoiceButtonActive: {
    backgroundColor: '#047857',
    borderColor: '#10b981',
    shadowColor: '#10b981',
  },
  centerVoiceIcon: {
    fontSize: 22,
  },
});
