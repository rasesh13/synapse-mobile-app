import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        tabBarInactiveTintColor: '#64748b',
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
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
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
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
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
                styles.iconWrap,
                styles.voiceIconWrap,
                focused && styles.voiceIconWrapActive,
              ]}
            >
              <Text style={styles.voiceTabIcon}>🎙️</Text>
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
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
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
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
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
    backgroundColor: '#0c1322',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabBarItem: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  iconWrapActive: {
    transform: [{ scale: 1.1 }],
  },
  tabIcon: {
    fontSize: 18,
  },
  voiceIconWrap: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#065f46',
    width: 36,
    height: 36,
    marginTop: -4,
  },
  voiceIconWrapActive: {
    backgroundColor: '#065f46',
    borderColor: '#10b981',
  },
  voiceTabIcon: {
    fontSize: 20,
  },
});
