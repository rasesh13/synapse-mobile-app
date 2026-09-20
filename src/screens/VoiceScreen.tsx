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
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
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

const { SpeechRecognition, TextToSpeech } = NativeModules;

export const VoiceScreen: React.FC<VoiceScreenProps> = ({ navigation }) => {
  const { activeProfile } = useAuth();
  const { language, currentLanguageInfo } = useLanguage();

  const [callState, setCallState] = useState<VoiceCallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [activeCaption, setActiveCaption] = useState<string>(
    'Press Start Voice Consultation to begin'
  );
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [customQueryInput, setCustomQueryInput] = useState<string>('');
  const [isProcessingQuery, setIsProcessingQuery] = useState<boolean>(false);

  const transcriptScrollRef = useRef<ScrollView>(null);
  const speakingTimerRef = useRef<any>(null);
  const isConsultationActiveRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>(`voice-sess-${Date.now()}`);

  // Setup Native SpeechRecognition & TextToSpeech Event Listeners
  useEffect(() => {
    let subStart: any;
    let subPartial: any;
    let subResults: any;
    let subEnd: any;
    let subError: any;
    let subTtsDone: any;

    if (Platform.OS === 'android' && SpeechRecognition) {
      try {
        const speechEmitter = new NativeEventEmitter(SpeechRecognition);

        subStart = speechEmitter.addListener('onSpeechStart', () => {
          if (!isConsultationActiveRef.current) return;
          setIsListeningMic(true);
          setCallState('listening');
          setActiveCaption(
            language === 'hi'
              ? 'सुन रहा हूँ... बोलिए'
              : 'Listening to your voice... Speak now!'
          );
        });

        subPartial = speechEmitter.addListener('onSpeechPartialResults', (e: any) => {
          if (!isConsultationActiveRef.current) return;
          if (e?.text) {
            setActiveCaption(`You: "${e.text}"`);
          }
        });

        subResults = speechEmitter.addListener('onSpeechResults', (e: any) => {
          if (!isConsultationActiveRef.current) return;
          setIsListeningMic(false);
          const recognizedText = e?.text?.trim();
          if (recognizedText) {
            handleSendVoiceQuery(recognizedText);
          } else {
            setActiveCaption(
              language === 'hi'
                ? 'आवाज नहीं आई — माइक बटन दबाकर फिर से बोलें।'
                : 'No voice detected — tap mic to speak again.'
            );
            setCallState('listening');
          }
        });

        subEnd = speechEmitter.addListener('onSpeechEnd', () => {
          setIsListeningMic(false);
        });

        subError = speechEmitter.addListener('onSpeechError', (err: any) => {
          setIsListeningMic(false);
          console.warn('Native speech recognition error:', err);
          if (isConsultationActiveRef.current) {
            setActiveCaption(
              language === 'hi'
                ? 'माइक तैयार है — नीचे बटन दबाकर बोलें या लक्षण चुनें'
                : 'Mic ready — tap Speak button or choose a topic below'
            );
            setCallState('listening');
          }
        });
      } catch (err) {
        console.warn('Speech emitter init failed:', err);
      }
    }

    if (Platform.OS === 'android' && TextToSpeech) {
      try {
        const ttsEmitter = new NativeEventEmitter(TextToSpeech);
        subTtsDone = ttsEmitter.addListener('onTtsDone', () => {
          if (isConsultationActiveRef.current) {
            setCallState('listening');
            setActiveCaption(
              language === 'hi'
                ? 'सुन रहा हूँ — माइक बटन दबाकर अगला सवाल पूछें।'
                : 'Listening — tap mic to ask your next question.'
            );
          }
        });
      } catch (err) {
        console.warn('TTS emitter init failed:', err);
      }
    }

    return () => {
      endVoiceSession();
      subStart?.remove();
      subPartial?.remove();
      subResults?.remove();
      subEnd?.remove();
      subError?.remove();
      subTtsDone?.remove();
    };
  }, [language]);

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
            message: 'Synapse-OS needs microphone access to listen to your symptoms.',
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

  // Triggers native Android Speech Recognition
  const startMicCapture = async () => {
    const hasMic = await requestAudioPermission();
    if (!hasMic) {
      Alert.alert('Microphone Permission', 'Please allow microphone access in phone settings.');
      return;
    }

    if (Platform.OS === 'android' && SpeechRecognition) {
      try {
        // Stop any running TTS speech first
        TextToSpeech?.stop();
        setIsListeningMic(true);
        setCallState('listening');
        setActiveCaption(
          language === 'hi'
            ? 'सुन रहा हूँ... अब अपने लक्षण बोलिए 🎙️'
            : 'Listening... Speak your symptoms clearly now 🎙️'
        );
        await SpeechRecognition.startListening(language);
      } catch (err: any) {
        console.warn('Speech start error:', err);
        setIsListeningMic(false);
      }
    }
  };

  const stopMicCapture = async () => {
    if (Platform.OS === 'android' && SpeechRecognition) {
      try {
        await SpeechRecognition.stopListening();
        setIsListeningMic(false);
      } catch (err) {
        console.warn('Speech stop error:', err);
      }
    }
  };

  // Main Consultation Dispatcher: Queries Live Multi-Agent Swarm on Render & Speaks Response
  const handleSendVoiceQuery = async (queryToSend?: string) => {
    const text = (queryToSend || customQueryInput).trim();
    if (!text || isProcessingQuery) return;

    setCustomQueryInput('');
    setIsProcessingQuery(true);
    setIsListeningMic(false);

    // Stop ongoing speech/mic
    if (Platform.OS === 'android') {
      SpeechRecognition?.stopListening();
      TextToSpeech?.stop();
    }

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

      // Set speaking state
      setCallState('speaking');
      const previewCaption =
        cleanResponse.length > 120
          ? `${cleanResponse.slice(0, 120)}...`
          : cleanResponse;
      setActiveCaption(`AI Doctor: "${previewCaption}"`);
      addTranscript('assistant', cleanResponse);

      // Speak aloud through native Android TextToSpeech
      if (Platform.OS === 'android' && TextToSpeech && !isMuted) {
        try {
          await TextToSpeech.speak(cleanResponse, language);
        } catch (ttsErr) {
          console.warn('TTS speak error:', ttsErr);
        }
      }

      // Safety fallback timer if TTS listener doesn't fire
      const speechDuration = Math.min(10000, Math.max(4000, cleanResponse.length * 40));
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = setTimeout(() => {
        if (isConsultationActiveRef.current) {
          setCallState('listening');
          setActiveCaption(
            language === 'hi'
              ? 'सुन रहा हूँ — माइक दबाकर अगला सवाल पूछें।'
              : 'Listening — tap mic to ask another question.'
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

      if (Platform.OS === 'android' && TextToSpeech && !isMuted) {
        try {
          TextToSpeech.speak(fallbackNotice, language);
        } catch {}
      }

      speakingTimerRef.current = setTimeout(() => {
        if (isConsultationActiveRef.current) {
          setCallState('listening');
          setActiveCaption('Listening — tap mic to speak...');
        }
      }, 4000);
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
    setTranscripts([]);

    const welcomeGreeting =
      language === 'hi'
        ? `नमस्ते ${activeProfile.name}! मैं सिनैप्स-ओएस एआई क्लिनिकल वॉइस डॉक्टर हूँ। मैं सुन रहा हूँ, अपने लक्षण बताएं।`
        : `Namaste ${activeProfile.name}! I am your Synapse-OS AI clinical voice doctor. I am listening, please speak your symptoms.`;

    setCallState('speaking');
    setActiveCaption(`AI Doctor: "${welcomeGreeting}"`);
    addTranscript('assistant', welcomeGreeting);

    // Speak initial greeting aloud
    if (Platform.OS === 'android' && TextToSpeech) {
      try {
        TextToSpeech.speak(welcomeGreeting, language);
      } catch {}
    }

    // Automatically open mic after greeting
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    speakingTimerRef.current = setTimeout(() => {
      if (isConsultationActiveRef.current) {
        setCallState('listening');
        setActiveCaption(
          language === 'hi'
            ? 'सुन रहा हूँ... बोलिए 🎙️'
            : 'Listening... Speak your symptoms now 🎙️'
        );
        startMicCapture();
      }
    }, 4000);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      if (Platform.OS === 'android') {
        SpeechRecognition?.stopListening();
        TextToSpeech?.stop();
      }
      setCallState('muted');
      setActiveCaption('Microphone muted.');
    } else {
      setCallState('listening');
      setActiveCaption('Microphone unmuted — tap Speak to talk.');
    }
  };

  const endVoiceSession = () => {
    isConsultationActiveRef.current = false;
    if (speakingTimerRef.current) {
      clearTimeout(speakingTimerRef.current);
    }
    if (Platform.OS === 'android') {
      try {
        SpeechRecognition?.cancel();
        TextToSpeech?.stop();
      } catch {}
    }
    setCallState('idle');
    setIsMuted(false);
    setIsListeningMic(false);
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
              ? '● Synapse AI Voice Doctor Live • Speech & Sound Active'
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
                ? isListeningMic
                  ? 'Listening to your voice...'
                  : 'Listening — Tap mic to speak'
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

        {/* Prominent Tap to Speak Mic Trigger Button when call is active */}
        {isActive && (
          <View style={styles.micTriggerArea}>
            <TouchableOpacity
              style={[
                styles.tapToSpeakBtn,
                isListeningMic && styles.tapToSpeakBtnListening,
              ]}
              onPress={isListeningMic ? stopMicCapture : startMicCapture}
              activeOpacity={0.8}
            >
              <Text style={styles.tapToSpeakIcon}>
                {isListeningMic ? '⏹️' : '🎙️'}
              </Text>
              <Text style={styles.tapToSpeakText}>
                {isListeningMic
                  ? language === 'hi'
                    ? 'सुन रहा हूँ... (रोकने के लिए दबाएं)'
                    : 'Listening... (Tap to Stop)'
                  : language === 'hi'
                  ? 'बोलने के लिए दबाएं (Tap to Speak)'
                  : 'Tap to Speak into Microphone'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
          <TouchableOpacity
            onPress={startMicCapture}
            style={[styles.miniMicBtn, isListeningMic && styles.miniMicBtnActive]}
          >
            <Text style={styles.voiceInputMicIcon}>🎙️</Text>
          </TouchableOpacity>
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
  micTriggerArea: {
    width: '100%',
    marginVertical: 8,
  },
  tapToSpeakBtn: {
    backgroundColor: '#047857',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#34d399',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  tapToSpeakBtnListening: {
    backgroundColor: '#b91c1c',
    borderColor: '#f87171',
    shadowColor: '#ef4444',
  },
  tapToSpeakIcon: {
    fontSize: 20,
  },
  tapToSpeakText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  simPromptsCard: {
    backgroundColor: '#131d33',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 10,
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
    marginTop: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    gap: 8,
  },
  miniMicBtn: {
    padding: 4,
  },
  miniMicBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
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
