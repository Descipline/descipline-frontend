import React, { useState } from 'react'
import { Platform, Modal, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { AppText } from '@/components/app-text'
import { LinearGradient } from 'expo-linear-gradient'
import { SolanaColors } from '@/constants/colors'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'

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
  const [selectedDate, setSelectedDate] = useState(value)
  const [selectedHour, setSelectedHour] = useState(value.getHours())
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes())

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i).filter(m => m % 5 === 0) // Every 5 minutes

  const handleDateChange = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month, day, selectedHour, selectedMinute)
    setSelectedDate(newDate)
  }

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedHour(hour)
    setSelectedMinute(minute)
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minute)
    setSelectedDate(newDate)
  }

  const handleConfirm = () => {
    const finalDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedHour, selectedMinute)
    onChange({ type: 'set' }, finalDate)
    onClose()
  }

  const PickerColumn = ({ 
    data, 
    selectedValue, 
    onValueChange, 
    renderItem 
  }: { 
    data: any[], 
    selectedValue: any, 
    onValueChange: (value: any) => void,
    renderItem: (item: any) => string 
  }) => (
    <View style={styles.pickerColumn}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pickerColumnContent}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pickerItem,
              selectedValue === item && styles.pickerItemSelected
            ]}
            onPress={() => onValueChange(item)}
            activeOpacity={0.7}
          >
            <AppText style={[
              styles.pickerItemText,
              selectedValue === item && styles.pickerItemTextSelected
            ]}>
              {renderItem(item)}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  if (!isVisible) return null

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
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
        >
          <LinearGradient
            colors={[SolanaColors.brand.dark, '#2a1a3a']}
            style={styles.modalGradient}
          />
          
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Select Date & Time</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <UiIconSymbol name="xmark" size={16} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerContainer}>
            {/* Date Picker */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>📅 Date</AppText>
              <View style={styles.datePickerRow}>
                <PickerColumn
                  data={months}
                  selectedValue={months[selectedDate.getMonth()]}
                  onValueChange={(month) => {
                    const monthIndex = months.indexOf(month)
                    handleDateChange(selectedDate.getFullYear(), monthIndex, selectedDate.getDate())
                  }}
                  renderItem={(month) => month.slice(0, 3)}
                />
                <PickerColumn
                  data={days}
                  selectedValue={selectedDate.getDate()}
                  onValueChange={(day) => {
                    handleDateChange(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                  }}
                  renderItem={(day) => day.toString()}
                />
                <PickerColumn
                  data={years}
                  selectedValue={selectedDate.getFullYear()}
                  onValueChange={(year) => {
                    handleDateChange(year, selectedDate.getMonth(), selectedDate.getDate())
                  }}
                  renderItem={(year) => year.toString()}
                />
              </View>
            </View>

            {/* Time Picker */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>⏰ Time</AppText>
              <View style={styles.timePickerRow}>
                <PickerColumn
                  data={hours}
                  selectedValue={selectedHour}
                  onValueChange={(hour) => handleTimeChange(hour, selectedMinute)}
                  renderItem={(hour) => hour.toString().padStart(2, '0')}
                />
                <AppText style={styles.timeSeparator}>:</AppText>
                <PickerColumn
                  data={minutes}
                  selectedValue={selectedMinute}
                  onValueChange={(minute) => handleTimeChange(selectedHour, minute)}
                  renderItem={(minute) => minute.toString().padStart(2, '0')}
                />
              </View>
            </View>

            {/* Selected Preview */}
            <View style={styles.previewCard}>
              <UiIconSymbol name="calendar" size={16} color={SolanaColors.brand.purple} />
              <AppText style={styles.previewText}>
                {selectedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })} at {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
              </AppText>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <AppText style={styles.cancelButtonText}>Cancel</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[SolanaColors.brand.purple, '#dc1fff']}
                style={styles.confirmButtonGradient}
              />
              <UiIconSymbol name="checkmark.circle.fill" size={16} color="#ffffff" />
              <AppText style={styles.confirmButtonText}>Confirm</AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    maxHeight: '80%',
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  datePickerRow: {
    flexDirection: 'row',
    height: 120,
    gap: 8,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    gap: 8,
  },
  pickerColumn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerColumnContent: {
    paddingVertical: 8,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(153, 69, 255, 0.3)',
  },
  pickerItemText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 8,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    gap: 12,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})