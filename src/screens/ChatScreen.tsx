import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from 'react-native';
import { AppHeader } from '../components/common/AppHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ApiEndpoints } from '../api/endpoints';
import { ChatMessage, AgentTraceStep } from '../types';

interface ChatScreenProps {
  route?: any;
  navigation: any;
}

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  'unconscious',
  'snake bite',
  'snakebite',
  'heavy bleeding',
  'poison',
  'cannot breathe',
  'difficulty breathing',
  'stroke',
  'paralysis',
  'seizure',
  'convulsion',
];

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { activeProfile } = useAuth();
  const { language, t } = useLanguage();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const sessionIdRef = useRef<string>(`mob-sess-${Date.now()}`);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-01',
          sender: 'agent',
          text: `Namaste ${activeProfile.name}! I am the Synapse-OS AI Medical Council. I can help evaluate symptoms, verify Indian medication dosages (Dolo 650, ORS, Pan-40), explain vaccination schedules, and guide first-aid protocols. How can we assist you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          safetyCleared: true,
        },
      ]);
    }
  }, [activeProfile.name]);

  // Handle route param initial prompt
  useEffect(() => {
    if (route?.params?.initialPrompt) {
      const prompt = route.params.initialPrompt;
      handleSendMessage(prompt);
      // clear param
      navigation.setParams({ initialPrompt: undefined });
    }
  }, [route?.params?.initialPrompt]);

  const dialEmergency = (num: string) => {
    Linking.openURL(`tel:${num}`);
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const checkEmergencyInput = (text: string): boolean => {
    const lower = text.toLowerCase();
    return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const isUrgent = checkEmergencyInput(text);
    if (isUrgent) {
      setEmergencyActive(true);
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await ApiEndpoints.orchestrateHealth(
        text,
        sessionIdRef.current,
        activeProfile.profileId,
        language
      );

      const isEmergencyResponse =
        !res.safety_cleared ||
        res.detected_intent === 'EMERGENCY_TRIAGE' ||
        res.detected_intent === 'CRISIS_INTERVENTION' ||
        isUrgent;

      if (isEmergencyResponse) {
        setEmergencyActive(true);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: res.final_response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        safetyCleared: res.safety_cleared,
        detectedIntent: res.detected_intent,
        trace: res.trace as AgentTraceStep[],
        isEmergency: isEmergencyResponse,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: isUrgent
          ? 'EMERGENCY DETECTED: Unable to connect to server. Please dial 108 or 112 immediately!'
          : 'Could not reach Synapse-OS server. Please check your network connection or verify the backend URL.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        isEmergency: isUrgent,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const quickPrompts = [
    { label: '🌡️ High Fever & Pain', text: 'I have severe fever with body ache. What are the first steps and safe Indian medicines?' },
    { label: '💧 ORS Preparation', text: 'How do I prepare and administer ORS solution for child diarrhea?' },
    { label: '💊 Dolo 650 Dosage', text: 'What is the safe dosage and administration timing for Dolo 650?' },
    { label: '💉 UIP Vaccines', text: 'What is the Indian Universal Immunization Programme schedule for infants?' },
    { label: '🐍 Snakebite Protocol', text: 'What is the emergency first-aid protocol for snakebite?' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <AppHeader onNavigateToRecords={() => navigation.navigate('RecordsTab')} />

      {/* Persistent Critical Emergency Banner if triggered */}
      {emergencyActive && (
        <View style={styles.emergencyAlertBanner}>
          <View style={styles.emergencyAlertHeader}>
            <Text style={styles.emergencyAlertTitle}>🚨 CRITICAL EMERGENCY DETECTED</Text>
            <TouchableOpacity onPress={() => setEmergencyActive(false)}>
              <Text style={styles.emergencyDismiss}>✕ Dismiss</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.emergencyAlertSub}>
            Immediate medical attention required. Do not rely solely on automated triage.
          </Text>
          <View style={styles.emergencyAlertBtns}>
            <TouchableOpacity
              style={styles.alertCallBtn}
              onPress={() => dialEmergency('108')}
            >
              <Text style={styles.alertCallBtnText}>📞 DIAL 108 AMBULANCE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.alertCallBtn, { backgroundColor: '#1d4ed8' }]}
              onPress={() => dialEmergency('112')}
            >
              <Text style={styles.alertCallBtnText}>📞 DIAL 112 EMERGENCY</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat Messages Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          const isSystem = item.sender === 'system';
          const isExpanded = expandedTraceId === item.id;

          return (
            <View
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAgent,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isUser
                    ? styles.bubbleUser
                    : isSystem
                    ? styles.bubbleSystem
                    : styles.bubbleAgent,
                  item.isEmergency && styles.bubbleEmergency,
                ]}
              >
                {/* Header label inside bubble */}
                <View style={styles.bubbleMeta}>
                  <Text style={styles.bubbleSender}>
                    {isUser ? 'You' : isSystem ? 'System Notice' : 'Synapse Medical Swarm'}
                  </Text>
                  <Text style={styles.bubbleTime}>{item.timestamp}</Text>
                </View>

                {/* Emergency badge inside message */}
                {item.isEmergency && (
                  <View style={styles.bubbleEmergencyPill}>
                    <Text style={styles.bubbleEmergencyText}>⚠️ Emergency Intercept Active</Text>
                  </View>
                )}

                {/* Message Body */}
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.messageTextUser : styles.messageTextAgent,
                  ]}
                  selectable
                >
                  {item.text}
                </Text>

                {/* Direct Dial 108 action if emergency */}
                {item.isEmergency && (
                  <TouchableOpacity
                    style={styles.bubbleDialBtn}
                    onPress={() => dialEmergency('108')}
                  >
                    <Text style={styles.bubbleDialBtnText}>📞 Call 108 Ambulance Now</Text>
                  </TouchableOpacity>
                )}

                {/* Multi-Agent Trace Accordion */}
                {item.trace && item.trace.length > 0 && (
                  <View style={styles.traceSection}>
                    <TouchableOpacity
                      style={styles.traceToggle}
                      onPress={() =>
                        setExpandedTraceId(isExpanded ? null : item.id)
                      }
                    >
                      <Text style={styles.traceToggleText}>
                        {isExpanded ? '▼ Hide Agent Swarm Trace' : `▶ View Swarm Trace (${item.trace.length} Agents)`}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.traceContent}>
                        {item.trace.map((step: AgentTraceStep, idx: number) => (
                          <View key={idx} style={styles.traceStepItem}>
                            <View style={styles.traceStepHeader}>
                              <Text style={styles.traceAgentName}>
                                🤖 {step.agent_name.toUpperCase()}
                              </Text>
                              <Text style={styles.traceDuration}>
                                {step.duration_ms}ms
                              </Text>
                            </View>
                            <Text style={styles.traceAction}>{step.action}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Quick copy trigger */}
                {!isUser && (
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyToClipboard(item.text)}
                  >
                    <Text style={styles.copyBtnText}>Copy</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Suggested Indian Prompt Chips */}
      <View style={styles.promptChipsArea}>
        <FlatList
          horizontal
          data={quickPrompts}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.promptChipsContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.promptChip}
              onPress={() => handleSendMessage(item.text)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptChipText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        {/* Voice shortcut button */}
        <TouchableOpacity
          style={styles.voiceNavBtn}
          onPress={() => navigation.navigate('VoiceTab')}
          accessibilityLabel="Switch to voice mode"
        >
          <Text style={styles.voiceNavIcon}>🎙️</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Describe symptoms, medicine or first aid..."
          placeholderTextColor="#64748b"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputMessage.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSendMessage()}
          disabled={!inputMessage.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.sendIcon}>➔</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  emergencyAlertBanner: {
    backgroundColor: '#7f1d1d',
    padding: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyAlertTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emergencyDismiss: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 6,
  },
  emergencyAlertSub: {
    color: '#fee2e2',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 16,
  },
  emergencyAlertBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  alertCallBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  alertCallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 12,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAgent: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: '#065f46',
    borderColor: '#059669',
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderBottomLeftRadius: 4,
  },
  bubbleSystem: {
    backgroundColor: '#1e293b',
    borderColor: '#ef4444',
  },
  bubbleEmergency: {
    borderColor: '#ef4444',
    backgroundColor: '#2b1114',
  },
  bubbleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bubbleSender: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bubbleTime: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
  },
  bubbleEmergencyPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  bubbleEmergencyText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '800',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextAgent: {
    color: '#f1f5f9',
  },
  bubbleDialBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleDialBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  traceSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  traceToggle: {
    paddingVertical: 4,
  },
  traceToggleText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  traceContent: {
    backgroundColor: '#070c18',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  traceStepItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 6,
  },
  traceStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  traceAgentName: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  traceDuration: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  traceAction: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  copyBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#1e293b',
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  promptChipsArea: {
    backgroundColor: '#0b1120',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 10,
  },
  promptChipsContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#131f37',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  promptChipText: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 10,
  },
  voiceNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#131f37',
    borderWidth: 1.5,
    borderColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceNavIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#131f37',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
});
