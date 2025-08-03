import React from 'react'
import { Platform, Modal, View, StyleSheet, TouchableOpacity } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { AppText } from '@/components/app-text'
import { LinearGradient } from 'expo-linear-gradient'
import { SolanaColors } from '@/constants/colors'

interface CrossPlatformDateTimePickerProps {
  value: Date
  mode: 'date' | 'time' | 'datetime'
  display?: 'default' | 'spinner' | 'compact'
  onChange: (event: any, selectedDate?: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  isVisible: boolean
  onClose: () => void
}

export function CrossPlatformDateTimePicker({
  value,
  mode,
  display = 'default',
  onChange,
  minimumDate,
  maximumDate,
  isVisible,
  onClose
}: CrossPlatformDateTimePickerProps) {
  if (Platform.OS === 'android') {
    // Android: Use native modal
    return isVisible ? (
      <DateTimePicker
        value={value}
        mode={mode}
        display={display}
        onChange={(event, selectedDate) => {
          onChange(event, selectedDate)
          onClose()
        }}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    ) : null
  }

  // iOS: Use modal wrapper
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[SolanaColors.brand.dark, '#2a1a3a']}
            style={styles.modalGradient}
          />
          
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Select Date & Time</AppText>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <AppText style={styles.doneButtonText}>Done</AppText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={value}
              mode={mode}
              display={display}
              onChange={onChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              textColor="#ffffff"
              style={styles.picker}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SolanaColors.brand.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 34, // Account for safe area
    overflow: 'hidden',
  },
  modalGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  doneButton: {
    backgroundColor: SolanaColors.brand.purple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  pickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 200,
  },
})