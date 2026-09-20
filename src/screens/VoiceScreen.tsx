import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Vapi from '@vapi-ai/react-native';
import { AppHeader } from '../components/common/AppHeader';
import { VoiceOrb } from '../components/VoiceOrb';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ApiEndpoints } from '../api/endpoints';
import { VoiceCallState } from '../types';

interface VoiceScreenProps {
  navigation: any;
}

interface TranscriptItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

const DEFAULT_VAPI_KEY = '7709f749-ce4c-4a9f-bef2-637223f17258';
const DEFAULT_VAPI_ID = 'f92542f6-1975-4169-8459-e46684910676';

export const VoiceScreen: React.FC<VoiceScreenProps> = ({ navigation }) => {
  const { activeProfile } = useAuth();
  const { currentLanguageInfo } = useLanguage();

  const [callState, setCallState] = useState<VoiceCallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [activeCaption, setActiveCaption] = useState<string>('Press Start Consultation to begin');
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);

  const vapiRef = useRef<Vapi | null>(null);
  const transcriptScrollRef = useRef<ScrollView>(null);
  const simulationTimerRef = useRef<any>(null);

  useEffect(() => {
    // Check config from server
    ApiEndpoints.getMobileConfig()
      .then((cfg) => {
        const key = cfg?.vapi?.public_key;
        if (key && key !== 'vapi_pk_demo_synapse_rural_2026') {
          setIsSandboxMode(false);
        } else {
          // Check if default key is available
          setIsSandboxMode(!DEFAULT_VAPI_KEY);
        }
      })
      .catch(() => {
        setIsSandboxMode(!DEFAULT_VAPI_KEY);
      });

    return () => {
      endVoiceSession();
    };
  }, []);

  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission Needed',
            message: 'Synapse-OS needs microphone access for hands-free clinical voice triage.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Audio permission error:', err);
        return false;
      }
    }
    return true;
  };

  const addTranscript = (sender: 'user' | 'assistant', text: string) => {
    const newItem: TranscriptItem = {
      id: `tr-${Date.now()}-${Math.random()}`,
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTranscripts((prev) => [...prev, newItem]);
    setTimeout(() => {
      transcriptScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const startVoiceSession = async () => {
    const hasMic = await requestAudioPermission();
    if (!hasMic) {
      Alert.alert(
        'Microphone Required',
        'Microphone permission is required for voice consultations. Please allow microphone access in Android settings.'
      );
      return;
    }

    setCallState('connecting');
    setActiveCaption('Connecting to Synapse Clinical Voice Node (WebRTC)...');
    setTranscripts([]);

    let vapiPublicKey = DEFAULT_VAPI_KEY;
    let vapiAssistantId = DEFAULT_VAPI_ID;

    try {
      const config = await ApiEndpoints.getMobileConfig();
      if (
        config?.vapi?.public_key &&
        config.vapi.public_key !== 'vapi_pk_demo_synapse_rural_2026'
      ) {
        vapiPublicKey = config.vapi.public_key;
      }
      if (
        config?.vapi?.assistant_id &&
        config.vapi.assistant_id !== 'vapi_asst_demo_synapse_rural_2026'
      ) {
        vapiAssistantId = config.vapi.assistant_id;
      }
    } catch {}

    if (vapiPublicKey && vapiAssistantId) {
      try {
        const vapiInstance = new Vapi(vapiPublicKey);
        vapiRef.current = vapiInstance;

        vapiInstance.on('call-start', () => {
          setCallState('speaking');
          setActiveCaption('Connected! AI Voice Doctor speaking...');
        });

        // In Vapi, speech-start fires when the assistant speaks audio
        vapiInstance.on('speech-start', () => {
          setCallState('speaking');
        });

        // speech-end fires when the assistant finishes speaking, ready to listen to the user
        vapiInstance.on('speech-end', () => {
          setCallState('listening');
          setActiveCaption('Listening — speak your health concern clearly...');
        });

        vapiInstance.on('message', (msg: any) => {
          if (msg?.type === 'transcript') {
            const transcriptText = msg?.transcript || '';
            if (!transcriptText) return;

            if (msg.transcriptType === 'partial') {
              if (msg.role === 'user') {
                setActiveCaption(`You: "${transcriptText}"`);
              } else {
                setActiveCaption(`Doctor: "${transcriptText}"`);
              }
            } else if (msg.transcriptType === 'final') {
              if (msg.role === 'user') {
                addTranscript('user', transcriptText);
                setActiveCaption(`You: "${transcriptText}"`);
              } else if (msg.role === 'assistant') {
                addTranscript('assistant', transcriptText);
                setActiveCaption(`Doctor: "${transcriptText}"`);
              }
            }
          }
        });

        vapiInstance.on('call-end', () => {
          setCallState('ended');
          setActiveCaption('Consultation call ended.');
        });

        vapiInstance.on('error', (err: any) => {
          console.warn('Vapi live error event:', err);
          // If live call fails to connect, fallback to sandbox
          if (callState === 'connecting') {
            startSandboxSimulation();
          }
        });

        const firstGreeting =
          currentLanguageInfo.code === 'hi'
            ? `नमस्ते ${activeProfile.name}! मैं सिनैप्स ओएस एआई क्लिनिकल वॉइस डॉक्टर हूँ। मैं सुन रहा हूँ, आपकी क्या मदद कर सकता हूँ?`
            : `Hello ${activeProfile.name}! I am your Synapse-OS AI clinical voice doctor. How can I assist with your health today?`;

        await vapiInstance.start(vapiAssistantId, {
          firstMessage: firstGreeting,
        });
      } catch (err: any) {
        console.warn('Vapi start exception:', err);
        startSandboxSimulation();
      }
    } else {
      startSandboxSimulation();
    }
  };

  const startSandboxSimulation = () => {
    setIsSandboxMode(true);
    setCallState('connecting');
    setActiveCaption('Initializing Voice Consultation...');

    setTimeout(() => {
      setCallState('speaking');
      const greeting = `Namaste ${activeProfile.name}! I am your Synapse-OS rural AI voice doctor speaking in ${currentLanguageInfo.nativeName}. What symptoms are you experiencing?`;
      setActiveCaption(`AI Doctor: "${greeting}"`);
      addTranscript('assistant', greeting);

      // Transition to listening
      simulationTimerRef.current = setTimeout(() => {
        setCallState('listening');
        setActiveCaption('Listening — speak your symptoms or question...');
      }, 4000);
    }, 1500);
  };

  const handleSimulateUserQuery = (prompt: string, response: string) => {
    if (callState !== 'listening' && callState !== 'speaking') return;

    setCallState('listening');
    setActiveCaption(`You: "${prompt}"`);
    addTranscript('user', prompt);

    setTimeout(() => {
      setCallState('speaking');
      setActiveCaption(`AI Doctor: "${response}"`);
      addTranscript('assistant', response);

      setTimeout(() => {
        setCallState('listening');
        setActiveCaption('Listening for next question...');
      }, 5000);
    }, 1200);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (vapiRef.current) {
      try {
        vapiRef.current.setMuted(nextMute);
      } catch {}
    }
    setCallState(nextMute ? 'muted' : 'listening');
  };

  const endVoiceSession = () => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
    }
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch {}
      vapiRef.current = null;
    }
    setCallState('idle');
    setIsMuted(false);
    setActiveCaption('Voice consultation completed.');
  };

  const isActive =
    callState === 'listening' ||
    callState === 'speaking' ||
    callState === 'connecting' ||
    callState === 'muted';

  return (
    <View style={styles.container}>
      <AppHeader onNavigateToRecords={() => navigation.navigate('RecordsTab')} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Info Badge */}
        <View style={styles.sandboxNotice}>
          <Text style={styles.sandboxNoticeText}>
            {isSandboxMode
              ? 'ℹ️ Voice Sandbox Active • Speech Engine Ready'
              : '● Live Vapi AI Voice WebRTC Active • Low Latency'}
          </Text>
        </View>

        {/* Center Animated Voice Orb */}
        <View style={styles.orbArea}>
          <VoiceOrb state={callState} size={150} />
          <View style={styles.statePill}>
            <View
              style={[
                styles.stateDot,
                {
                  backgroundColor:
                    callState === 'listening'
                      ? '#10b981'
                      : callState === 'speaking'
                      ? '#059669'
                      : callState === 'connecting'
                      ? '#f59e0b'
                      : callState === 'muted'
                      ? '#ef4444'
                      : '#64748b',
                },
              ]}
            />
            <Text style={styles.stateLabel}>
              {callState === 'listening'
                ? 'Listening to You'
                : callState === 'speaking'
                ? 'AI Doctor Speaking'
                : callState === 'connecting'
                ? 'Connecting to Doctor...'
                : callState === 'muted'
                ? 'Microphone Muted'
                : 'Ready for Consultation'}
            </Text>
          </View>

          {/* Active Caption */}
          <Text style={styles.captionText}>{activeCaption}</Text>
        </View>

        {/* Voice Simulation Prompts */}
        {isActive && (
          <View style={styles.simPromptsCard}>
            <Text style={styles.simPromptsTitle}>
              Suggested Queries ({currentLanguageInfo.nativeName}):
            </Text>
            <View style={styles.simPromptsRow}>
              <TouchableOpacity
                style={styles.simChip}
                onPress={() =>
                  handleSimulateUserQuery(
                    'I have a child with fever and mild dehydration',
                    'Give clean boiled water with WHO ORS solution in small sips. For fever, pediatric paracetamol after food. Avoid aspirin.'
                  )
                }
              >
                <Text style={styles.simChipText}>💧 Child ORS & Fever</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.simChip}
                onPress={() =>
                  handleSimulateUserQuery(
                    'What should I do if bitten by a snake?',
                    'Keep the victim calm, immobilize the bitten limb below heart level. Do not cut or suck. Go immediately to the nearest PHC for Anti-Snake Venom.'
                  )
                }
              >
                <Text style={styles.simChipText}>🐍 Snakebite Protocol</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.simChip}
                onPress={() =>
                  handleSimulateUserQuery(
                    'How often should pregnant mothers take Iron tablets?',
                    'Take one red Iron Folic Acid tablet daily starting after the first trimester, with water or lemon water. Never take with tea or milk.'
                  )
                }
              >
                <Text style={styles.simChipText}>🩸 Iron & Anemia</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Live Conversation Transcript */}
        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptHeader}>Real-Time Transcript</Text>
          <ScrollView
            ref={transcriptScrollRef}
            style={styles.transcriptScroll}
            contentContainerStyle={styles.transcriptInner}
            nestedScrollEnabled
          >
            {transcripts.length === 0 ? (
              <Text style={styles.emptyTranscript}>
                Live spoken transcript will appear here during the consultation.
              </Text>
            ) : (
              transcripts.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.transcriptItem,
                    item.sender === 'user'
                      ? styles.transcriptUser
                      : styles.transcriptAssistant,
                  ]}
                >
                  <Text style={styles.transcriptSender}>
                    {item.sender === 'user' ? activeProfile.name : 'AI Doctor'} •{' '}
                    {item.time}
                  </Text>
                  <Text style={styles.transcriptBody}>{item.text}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Control Action Bar */}
      <View style={styles.controlsBar}>
        {isActive ? (
          <>
            {/* Mute Button */}
            <TouchableOpacity
              style={[styles.actionRoundBtn, isMuted && styles.actionRoundBtnActive]}
              onPress={toggleMute}
              accessibilityLabel="Toggle mute"
            >
              <Text style={styles.actionRoundIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
              <Text style={styles.actionRoundText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={endVoiceSession}
              accessibilityLabel="End consultation call"
            >
              <Text style={styles.endCallText}>End Consultation</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Start Call Button */
          <TouchableOpacity
            style={styles.startCallBtn}
            onPress={startVoiceSession}
            activeOpacity={0.85}
            accessibilityLabel="Start voice consultation"
          >
            <Text style={styles.startCallIcon}>🎙️</Text>
            <Text style={styles.startCallText}>Start Voice Consultation</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 32,
  },
  sandboxNotice: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  sandboxNoticeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  orbArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    width: '100%',
  },
  statePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131d33',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stateDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  stateLabel: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  captionText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
    lineHeight: 20,
    fontWeight: '500',
    minHeight: 40,
  },
  simPromptsCard: {
    backgroundColor: '#131d33',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 14,
    elevation: 3,
  },
  simPromptsTitle: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  simPromptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  simChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  simChipText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  transcriptCard: {
    backgroundColor: '#131d33',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 3,
  },
  transcriptHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  transcriptScroll: {
    maxHeight: 180,
  },
  transcriptInner: {
    gap: 10,
  },
  emptyTranscript: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  transcriptItem: {
    padding: 12,
    borderRadius: 12,
  },
  transcriptUser: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    alignSelf: 'flex-end',
    maxWidth: '88%',
  },
  transcriptAssistant: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '88%',
  },
  transcriptSender: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  transcriptBody: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0c1322',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
    minHeight: 84,
  },
  startCallBtn: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
    minHeight: 56,
    elevation: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  startCallIcon: {
    fontSize: 22,
  },
  startCallText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  endCallBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    minHeight: 56,
    elevation: 6,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f87171',
  },
  endCallText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  actionRoundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#131d33',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  actionRoundBtnActive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
  },
  actionRoundIcon: {
    fontSize: 20,
  },
  actionRoundText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
});
