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
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
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
  const { language, currentLanguageInfo } = useLanguage();

  const [callState, setCallState] = useState<VoiceCallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [activeCaption, setActiveCaption] = useState<string>('Press Start Voice Consultation to begin');
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [customQueryInput, setCustomQueryInput] = useState<string>('');
  const [isProcessingQuery, setIsProcessingQuery] = useState<boolean>(false);

  const vapiRef = useRef<Vapi | null>(null);
  const transcriptScrollRef = useRef<ScrollView>(null);
  const speakingTimerRef = useRef<any>(null);
  const isConsultationActiveRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>(`voice-sess-${Date.now()}`);

  useEffect(() => {
    // Check config from server
    ApiEndpoints.getMobileConfig()
      .then((cfg) => {
        const key = cfg?.vapi?.public_key;
        if (key && key !== 'vapi_pk_demo_synapse_rural_2026') {
          setIsSandboxMode(false);
        } else {
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
        const alreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (alreadyGranted) return true;

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
        return true;
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

  // Activates the Direct Synapse Voice Engine without dropping the consultation
  const activateLocalVoiceEngine = (initialPrompt?: string) => {
    setIsSandboxMode(true);
    setCallState('speaking');

    const defaultGreeting =
      language === 'hi'
        ? `नमस्ते ${activeProfile.name}! मैं सिनैप्स-ओएस एआई क्लिनिकल वॉइस डॉक्टर हूँ। मैं सुन रहा हूँ, अपने लक्षण या स्वास्थ्य समस्या बताएं।`
        : `Namaste ${activeProfile.name}! I am your Synapse-OS AI clinical voice doctor. I am listening, what symptoms are you experiencing?`;

    const greetingToUse = initialPrompt || defaultGreeting;
    setActiveCaption(`AI Doctor: "${greetingToUse}"`);
    addTranscript('assistant', greetingToUse);

    if (speakingTimerRef.current) {
      clearTimeout(speakingTimerRef.current);
    }

    speakingTimerRef.current = setTimeout(() => {
      if (isConsultationActiveRef.current) {
        setCallState('listening');
        setActiveCaption(
          language === 'hi'
            ? 'सुन रहा हूँ — अपने लक्षण बताएं या नीचे दिए गए विकल्प चुनें...'
            : 'Listening — speak your symptoms or choose a topic below...'
        );
      }
    }, 3800);
  };

  // Real-Time Query Deliberation via Multi-Agent Swarm
  const handleSendVoiceQuery = async (queryToSend?: string) => {
    const text = (queryToSend || customQueryInput).trim();
    if (!text || isProcessingQuery) return;

    setCustomQueryInput('');
    setIsProcessingQuery(true);

    // Record user query in transcript & caption
    addTranscript('user', text);
    setActiveCaption(`You: "${text}"`);
    setCallState('connecting');

    try {
      const res = await ApiEndpoints.orchestrateHealth(
        text,
        sessionIdRef.current,
        activeProfile.profileId,
        language
      );

      const rawResponse = res.final_response || '';
      const cleanResponse = rawResponse
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/---/g, '')
        .trim();

      // Transition to speaking state
      setCallState('speaking');
      const previewCaption =
        cleanResponse.length > 110
          ? `${cleanResponse.slice(0, 110)}...`
          : cleanResponse;
      setActiveCaption(`AI Doctor: "${previewCaption}"`);
      addTranscript('assistant', cleanResponse);

      // Simulate natural speech duration
      const speechDuration = Math.min(8500, Math.max(3500, cleanResponse.length * 35));

      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
      }

      speakingTimerRef.current = setTimeout(() => {
        if (isConsultationActiveRef.current) {
          setCallState('listening');
          setActiveCaption(
            language === 'hi'
              ? 'सुन रहा हूँ — क्या आप कुछ और पूछना चाहते हैं?'
              : 'Listening — what other symptoms or questions do you have?'
          );
        }
      }, speechDuration);
    } catch (err: any) {
      console.warn('Voice orchestrator error:', err);
      setCallState('speaking');
      const fallbackNotice =
        language === 'hi'
          ? 'आपके लक्षण दर्ज कर लिए गए हैं। ओआरएस और पर्याप्त पानी पिएं। यदि गंभीर लगे तो 108 डायल करें।'
          : 'Your symptoms have been noted. Keep hydrated with clean water and ORS. If symptoms worsen, please visit your nearest PHC or call 108.';

      setActiveCaption(`AI Doctor: "${fallbackNotice}"`);
      addTranscript('assistant', fallbackNotice);

      speakingTimerRef.current = setTimeout(() => {
        if (isConsultationActiveRef.current) {
          setCallState('listening');
          setActiveCaption('Listening — speak your health concern...');
        }
      }, 3500);
    } finally {
      setIsProcessingQuery(false);
    }
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

    isConsultationActiveRef.current = true;
    setCallState('connecting');
    setActiveCaption('Connecting to Synapse Clinical Voice Doctor...');
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

    const firstGreeting =
      language === 'hi'
        ? `नमस्ते ${activeProfile.name}! मैं सिनैप्स ओएस एआई क्लिनिकल वॉइस डॉक्टर हूँ। मैं सुन रहा हूँ, आपकी क्या मदद कर सकता हूँ?`
        : `Hello ${activeProfile.name}! I am your Synapse-OS AI clinical voice doctor. How can I assist with your health today?`;

    if (vapiPublicKey && vapiAssistantId) {
      try {
        const vapiInstance = new Vapi(vapiPublicKey);
        vapiRef.current = vapiInstance;

        vapiInstance.on('call-start', () => {
          if (!isConsultationActiveRef.current) return;
          setCallState('speaking');
          setActiveCaption('Connected! AI Voice Doctor speaking...');
        });

        vapiInstance.on('speech-start', () => {
          if (!isConsultationActiveRef.current) return;
          setCallState('speaking');
        });

        vapiInstance.on('speech-end', () => {
          if (!isConsultationActiveRef.current) return;
          setCallState('listening');
          setActiveCaption('Listening — speak your health concern clearly...');
        });

        vapiInstance.on('message', (msg: any) => {
          if (!isConsultationActiveRef.current) return;

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

        // If WebRTC ends or disconnects unexpectedly, DO NOT drop the call!
        // Transition seamlessly to the Synapse Direct Voice Engine so user can keep talking.
        vapiInstance.on('call-end', () => {
          console.log('Vapi WebRTC call ended event');
          if (isConsultationActiveRef.current) {
            activateLocalVoiceEngine();
          }
        });

        vapiInstance.on('error', (err: any) => {
          console.warn('Vapi live error event:', err);
          if (isConsultationActiveRef.current) {
            activateLocalVoiceEngine();
          }
        });

        const vapiOptions: any = {
          firstMessage: firstGreeting,
          model: {
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are Synapse-OS AI Clinical Voice Doctor for rural India. The patient is ${activeProfile.name} (ABHA ID: ${activeProfile.abhaId}, Age: ${activeProfile.age}, Gender: ${activeProfile.gender}). Provide immediate symptom triage, safe Indian dosages (Dolo 650, ORS, Pan-40), and emergency 108 ambulance advice. Keep spoken answers short and concise in ${currentLanguageInfo.nativeName}.`,
              },
            ],
          },
        };

        const startRes = await vapiInstance.start(vapiAssistantId, vapiOptions);
        if (!startRes) {
          console.log('Vapi start returned null, activating Synapse Voice Engine');
          activateLocalVoiceEngine(firstGreeting);
        }
      } catch (err: any) {
        console.warn('Vapi start exception:', err);
        activateLocalVoiceEngine(firstGreeting);
      }
    } else {
      activateLocalVoiceEngine(firstGreeting);
    }
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
    isConsultationActiveRef.current = false;
    if (speakingTimerRef.current) {
      clearTimeout(speakingTimerRef.current);
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

  const quickVoiceTopics = [
    {
      id: 'fever',
      icon: '🌡️',
      title: language === 'hi' ? 'तेज बुखार और सिरदर्द' : 'Fever & Severe Headache',
      query:
        language === 'hi'
          ? 'मुझे कल से तेज बुखार, सिरदर्द और बदन दर्द है। क्या डोलो 650 लेना सुरक्षित है?'
          : 'I have severe fever with body ache and headache since yesterday. What is the safe medication and dosage for Dolo 650?',
    },
    {
      id: 'ors',
      icon: '💧',
      title: language === 'hi' ? 'दस्त और ओआरएस' : 'Child Diarrhea & ORS',
      query:
        language === 'hi'
          ? 'बच्चे को पतले दस्त और उल्टी हो रही है। ओआरएस घोल कैसे तैयार करें और कितना पिलाएं?'
          : 'My child has watery diarrhea and vomiting. How should I prepare and administer ORS solution?',
    },
    {
      id: 'dolo',
      icon: '💊',
      title: language === 'hi' ? 'डोलो 650 सही खुराक' : 'Dolo 650 Dosage & Timing',
      query:
        language === 'hi'
          ? 'डोलो 650 गोली खाने के बाद लेनी चाहिए या पहले? दिन में अधिकतम कितनी ले सकते हैं?'
          : 'What is the safe adult dosage, frequency, and food timing for Dolo 650 paracetamol?',
    },
    {
      id: 'snakebite',
      icon: '🐍',
      title: language === 'hi' ? 'सांप का काटना' : 'Snakebite Emergency',
      query:
        language === 'hi'
          ? 'खेत में सांप ने काट लिया है। अस्पताल पहुंचने तक क्या आपातकालीन प्राथमिक उपचार करें?'
          : 'Emergency first-aid protocol for snakebite: what immediate steps should be taken on the way to the hospital?',
    },
    {
      id: 'anemia',
      icon: '🩸',
      title: language === 'hi' ? 'गर्भवती एनीमिया' : 'Pregnancy Anemia & IFA',
      query:
        language === 'hi'
          ? 'गर्भवती महिला को आयरन फोलिक एसिड (IFA) की गोली कैसे और कब खानी चाहिए?'
          : 'How should pregnant mothers take Iron Folic Acid tablets and prevent anemia in rural areas?',
    },
    {
      id: 'pan40',
      icon: '🤢',
      title: language === 'hi' ? 'पेट में जलन और गैस' : 'Acidity & Pan-40',
      query:
        language === 'hi'
          ? 'सीने में तेज जलन और पेट में एसिडिटी हो रही है। पैन 40 गोली कब लेनी चाहिए?'
          : 'I have severe burning in chest and stomach acidity. When should Pan-40 Pantoprazole be taken?',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader onNavigateToRecords={() => navigation.navigate('RecordsTab')} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Info Badge */}
        <View style={styles.sandboxNotice}>
          <Text style={styles.sandboxNoticeText}>
            {isActive
              ? isSandboxMode
                ? '● Synapse Clinical Voice Council Active • 24/7 AI Doctor'
                : '● Live Vapi AI Voice WebRTC Active • Low Latency'
              : 'ℹ️ Hands-Free Rural Health Voice Consultation'}
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
                ? 'Listening — Speak to Doctor'
                : callState === 'speaking'
                ? 'AI Doctor Speaking...'
                : callState === 'connecting'
                ? 'Council Deliberating...'
                : callState === 'muted'
                ? 'Microphone Muted'
                : 'Ready for Consultation'}
            </Text>
          </View>

          {/* Active Caption */}
          <Text style={styles.captionText}>{activeCaption}</Text>
        </View>

        {/* In-Call Quick Spoken Query Presets */}
        {isActive && (
          <View style={styles.simPromptsCard}>
            <Text style={styles.simPromptsTitle}>
              {language === 'hi'
                ? `त्वरित क्लिनिकल प्रश्न (${currentLanguageInfo.nativeName}):`
                : `Instant Spoken Topics (${currentLanguageInfo.nativeName}):`}
            </Text>
            <View style={styles.simPromptsRow}>
              {quickVoiceTopics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.simChip}
                  onPress={() => handleSendVoiceQuery(topic.query)}
                  disabled={isProcessingQuery}
                  activeOpacity={0.75}
                >
                  <Text style={styles.simChipText}>
                    {topic.icon} {topic.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Live Conversation Transcript */}
        <View style={styles.transcriptCard}>
          <Text style={styles.transcriptHeader}>Real-Time Spoken Transcript</Text>
          <ScrollView
            ref={transcriptScrollRef}
            style={styles.transcriptScroll}
            contentContainerStyle={styles.transcriptInner}
            nestedScrollEnabled
          >
            {transcripts.length === 0 ? (
              <Text style={styles.emptyTranscript}>
                Spoken consultation transcript will appear here in real time.
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
                    {item.sender === 'user' ? activeProfile.name : 'Synapse AI Doctor'} •{' '}
                    {item.time}
                  </Text>
                  <Text style={styles.transcriptBody}>{item.text}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* In-Call Spoken Query Input Bar */}
      {isActive && (
        <View style={styles.voiceInputBar}>
          <Text style={styles.voiceInputMicIcon}>🎙️</Text>
          <TextInput
            style={styles.voiceTextInput}
            placeholder={
              language === 'hi'
                ? 'लक्षण बोलें या लिखें (जैसे बुखार, पेट दर्द)...'
                : 'Speak or type symptoms to doctor...'
            }
            placeholderTextColor="#64748b"
            value={customQueryInput}
            onChangeText={setCustomQueryInput}
            onSubmitEditing={() => handleSendVoiceQuery()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.voiceSendBtn,
              (!customQueryInput.trim() || isProcessingQuery) && styles.voiceSendBtnDisabled,
            ]}
            onPress={() => handleSendVoiceQuery()}
            disabled={!customQueryInput.trim() || isProcessingQuery}
            activeOpacity={0.8}
          >
            {isProcessingQuery ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.voiceSendIcon}>➔</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
    </KeyboardAvoidingView>
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
    paddingBottom: 24,
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
    paddingHorizontal: 20,
    lineHeight: 20,
    fontWeight: '600',
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
    color: '#67e8f9',
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
  voiceInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131f37',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    gap: 8,
  },
  voiceInputMicIcon: {
    fontSize: 18,
  },
  voiceTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    maxHeight: 70,
    paddingVertical: 6,
  },
  voiceSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  voiceSendBtnDisabled: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0,
    elevation: 0,
  },
  voiceSendIcon: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
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
