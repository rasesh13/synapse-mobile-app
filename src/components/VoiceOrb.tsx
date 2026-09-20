import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { VoiceCallState } from '../types';

interface VoiceOrbProps {
  state: VoiceCallState;
  size?: number;
}

const STATE_CONFIG: Record<
  VoiceCallState,
  {
    coreColor: string;
    ringColor: string;
    glowColor: string;
    speed: number;
    maxScale: number;
    label: string;
  }
> = {
  idle: {
    coreColor: '#10b981',
    ringColor: 'rgba(16, 185, 129, 0.25)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    speed: 2400,
    maxScale: 1.15,
    label: 'Ready',
  },
  connecting: {
    coreColor: '#f59e0b',
    ringColor: 'rgba(245, 158, 11, 0.25)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    speed: 1200,
    maxScale: 1.25,
    label: 'Connecting...',
  },
  listening: {
    coreColor: '#10b981',
    ringColor: 'rgba(16, 185, 129, 0.35)',
    glowColor: 'rgba(16, 185, 129, 0.55)',
    speed: 1400,
    maxScale: 1.35,
    label: 'Listening...',
  },
  speaking: {
    coreColor: '#059669',
    ringColor: 'rgba(5, 150, 105, 0.4)',
    glowColor: 'rgba(5, 150, 105, 0.6)',
    speed: 900,
    maxScale: 1.45,
    label: 'AI Speaking',
  },
  muted: {
    coreColor: '#ef4444',
    ringColor: 'rgba(239, 68, 68, 0.2)',
    glowColor: 'rgba(239, 68, 68, 0.3)',
    speed: 3000,
    maxScale: 1.05,
    label: 'Muted',
  },
  ended: {
    coreColor: '#64748b',
    ringColor: 'rgba(100, 116, 139, 0.15)',
    glowColor: 'rgba(100, 116, 139, 0.2)',
    speed: 2000,
    maxScale: 1.0,
    label: 'Call Ended',
  },
};

export const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, size = 160 }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle;

  useEffect(() => {
    // Pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: config.speed / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: config.speed / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Slow rotation
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [state, config.speed]);

  const scaleCore = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const scaleRing1 = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.1, config.maxScale],
  });

  const opacityRing1 = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0.1],
  });

  const scaleRing2 = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.25, config.maxScale * 1.2],
  });

  const opacityRing2 = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 0.15, 0.05],
  });

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size * 1.8, height: size * 1.8 }]}>
      {/* Outer Ring 2 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: config.ringColor,
            transform: [{ scale: scaleRing2 }],
            opacity: opacityRing2,
          },
        ]}
      />

      {/* Mid Ring 1 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: config.ringColor,
            transform: [{ scale: scaleRing1 }],
            opacity: opacityRing1,
          },
        ]}
      />

      {/* Glowing Aura */}
      <Animated.View
        style={[
          styles.aura,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: config.glowColor,
            transform: [{ scale: scaleCore }],
          },
        ]}
      />

      {/* Main Core Orb */}
      <Animated.View
        style={[
          styles.core,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: (size * 0.85) / 2,
            backgroundColor: config.coreColor,
            transform: [{ scale: scaleCore }, { rotate: rotateDeg }],
          },
        ]}
      >
        <View style={styles.coreHighlight} />
        <View style={styles.coreCenter}>
          <Text style={styles.stateEmoji}>
            {state === 'listening'
              ? '🎙️'
              : state === 'speaking'
              ? '🔊'
              : state === 'connecting'
              ? '⏳'
              : state === 'muted'
              ? '🔇'
              : '🩺'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
  },
  aura: {
    position: 'absolute',
    opacity: 0.8,
  },
  core: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  coreHighlight: {
    position: 'absolute',
    top: 6,
    left: 14,
    width: '40%',
    height: '30%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '-25deg' }],
  },
  coreCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateEmoji: {
    fontSize: 38,
  },
});
