/**
 * SynapseOS Mobile — LanguagePickerModal
 * Touch-first 11-language switcher showing native scripts and regions
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageInfo } from '../../types';

interface LanguagePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({ visible, onClose }) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  const handleSelect = async (code: any) => {
    await setLanguage(code);
    onClose();
  };

  const renderItem = ({ item }: { item: LanguageInfo }) => {
    const isSelected = item.code === language;
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => handleSelect(item.code)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.nativeName, isSelected && styles.textSelected]}>
            {item.nativeName}
          </Text>
          <Text style={styles.englishName}>
            {item.name} • {item.region}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🌐 Select Language / अपनी भाषा चुनें</Text>
            <Text style={styles.subtitle}>Available in 11 Indian Languages</Text>
          </View>

          <FlatList
            data={supportedLanguages}
            keyExtractor={item => item.code}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 20
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%'
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3
  },
  listContent: {
    gap: 8,
    paddingVertical: 6
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    minHeight: 52
  },
  itemSelected: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff'
  },
  flag: {
    fontSize: 20,
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b'
  },
  englishName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  textSelected: {
    color: '#0284c7'
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155'
  }
});
