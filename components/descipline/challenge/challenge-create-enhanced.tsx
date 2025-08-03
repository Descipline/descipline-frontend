import React, { useState, useCallback } from 'react'
import { ScrollView, TextInput, TouchableOpacity, View, StyleSheet, Alert, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { AppView } from '@/components/app-view'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { CrossPlatformDateTimePicker } from '@/components/ui/cross-platform-datetime-picker'
import { useCreateChallenge } from './use-challenge-hooks'
import { TokenAllowed, CreateChallengeFormData } from '@/utils/descipline/types'
import { SolanaColors } from '@/constants/colors'
import { ChallengeSuccessEnhanced } from './challenge-success-enhanced'

// 创建流程步骤枚举
enum CreateStep {
  FORM = 'form',           // 表单填写
  PREVIEW = 'preview',     // 预览确认
  CREATING_CHALLENGE = 'creating_challenge', // 正在创建挑战
  SUCCESS = 'success'      // 成功
}

interface StepIndicatorProps {
  currentStep: CreateStep
  steps: { key: CreateStep; title: string; icon: string }[]
}

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep)
  }

  const currentIndex = getCurrentStepIndex()

  return (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex
        const isLast = index === steps.length - 1

        return (
          <View key={step.key} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              isActive && styles.stepCircleActive,
              isCompleted && styles.stepCircleCompleted
            ]}>
              <UiIconSymbol 
                name={step.icon} 
                size={16} 
                color={isActive || isCompleted ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'} 
              />
            </View>
            <AppText style={[
              styles.stepText,
              isActive && styles.stepTextActive,
              isCompleted && styles.stepTextCompleted
            ]}>
              {step.title}
            </AppText>
            {!isLast && (
              <View style={[
                styles.stepConnector,
                isCompleted && styles.stepConnectorCompleted
              ]} />
            )}
          </View>
        )
      })}
    </View>
  )
}

interface ChallengePreviewProps {
  formData: CreateChallengeFormData
  onEdit: () => void
  onConfirm: () => void
  isLoading: boolean
  currentStep: CreateStep
  claimDelayOption: string
  formatDateTime: (date: Date) => string
  getClaimDelayText: (option: string) => string
}

// Helper function to get loading message based on current step
function getLoadingMessage(currentStep: CreateStep, tokenType: TokenAllowed): string {
  switch (currentStep) {
    case CreateStep.CREATING_CHALLENGE:
      return tokenType === TokenAllowed.WSOL ? 'Wrapping SOL & Creating...' : 'Creating Challenge...'
    default:
      return 'Processing...'
  }
}

function ChallengePreview({ 
  formData, 
  onEdit, 
  onConfirm, 
  isLoading, 
  currentStep, 
  claimDelayOption, 
  formatDateTime, 
  getClaimDelayText 
}: ChallengePreviewProps) {
  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.previewContainer}
    >
      {/* Preview Header */}
      <View style={styles.previewHeader}>
        <UiIconSymbol name="info.circle.fill" size={24} color={SolanaColors.brand.purple} />
        <AppText style={styles.previewTitle}>Confirm Challenge Details</AppText>
        <AppText style={styles.previewSubtitle}>
          Please review your challenge configuration before submitting
        </AppText>
      </View>

      {/* Challenge Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Challenge Name</AppText>
          <AppText style={styles.summaryValue}>{formData.name}</AppText>
        </View>
        
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Token Type</AppText>
          <AppText style={styles.summaryValue}>
            {formData.tokenType === TokenAllowed.USDC ? 'USDC' : 'SOL'}
          </AppText>
        </View>
        
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Stake Amount</AppText>
          <AppText style={styles.summaryValue}>
            {formData.stakeAmount} {formData.tokenType === TokenAllowed.USDC ? 'USDC' : 'SOL'}
          </AppText>
        </View>
        
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Creator Fee</AppText>
          <AppText style={styles.summaryValue}>{(formData.fee / 100).toFixed(1)}%</AppText>
        </View>
        
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Staking Ends</AppText>
          <AppText style={styles.summaryValue}>{formatDateTime(formData.stakeEndAt)}</AppText>
        </View>
        
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Claim Period</AppText>
          <AppText style={styles.summaryValue}>{getClaimDelayText(claimDelayOption)}</AppText>
        </View>
        
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Claims Start</AppText>
          <AppText style={styles.summaryValue}>{formatDateTime(formData.claimStartFrom)}</AppText>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.previewActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <UiIconSymbol name="pencil" size={16} color={SolanaColors.brand.purple} />
          <AppText style={styles.editButtonText}>Edit Details</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          onPress={onConfirm}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isLoading 
              ? ['rgba(153, 69, 255, 0.5)', 'rgba(220, 31, 255, 0.5)']
              : [SolanaColors.brand.purple, '#dc1fff']
            }
            style={styles.confirmButtonGradient}
          />
          <UiIconSymbol 
            name={isLoading ? "hourglass" : "plus.circle.fill"} 
            size={20} 
            color="#ffffff" 
          />
          <AppText style={styles.confirmButtonText}>
            {isLoading 
              ? getLoadingMessage(currentStep, formData.tokenType)
              : '🚀 Create Challenge'
            }
          </AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export function ChallengeCreateEnhanced() {
  const router = useRouter()
  const createMutation = useCreateChallenge()

  const [currentStep, setCurrentStep] = useState<CreateStep>(CreateStep.FORM)
  const [formData, setFormData] = useState<CreateChallengeFormData>({
    name: '',
    tokenType: TokenAllowed.USDC,
    stakeAmount: '',
    fee: 100, // 1%
    stakeEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    claimStartFrom: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days later
  })

  // Date/time picker states
  const [showStakeEndPicker, setShowStakeEndPicker] = useState(false)
  const [claimDelayOption, setClaimDelayOption] = useState('1day')

  // Claim period options
  const claimPeriodOptions = [
    { key: 'immediately', label: 'Immediately', description: 'Winners can claim right after staking ends' },
    { key: '1day', label: '1 Day', description: 'Winners can claim 1 day after staking ends' },
    { key: '3days', label: '3 Days', description: 'Winners can claim 3 days after staking ends' },
    { key: '7days', label: '7 Days', description: 'Winners can claim 7 days after staking ends' },
  ]

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [transactionResult, setTransactionResult] = useState<any>(null)

  const steps = [
    { key: CreateStep.FORM, title: 'Details', icon: 'pencil' },
    { key: CreateStep.PREVIEW, title: 'Preview', icon: 'info.circle.fill' },
    { key: CreateStep.CREATING_CHALLENGE, title: 'Creating', icon: 'hourglass' },
    { key: CreateStep.SUCCESS, title: 'Success', icon: 'plus.circle.fill' }
  ]

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Challenge name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Challenge name must be at least 3 characters'
    }

    if (!formData.stakeAmount || Number(formData.stakeAmount) <= 0) {
      newErrors.stakeAmount = 'Please enter a valid stake amount'
    } else if (Number(formData.stakeAmount) > 1000000) {
      newErrors.stakeAmount = 'Stake amount is too large'
    }

    if (formData.fee < 0 || formData.fee > 10000) {
      newErrors.fee = 'Fee must be between 0% and 100%'
    }

    // Time validation
    const now = new Date()
    
    if (formData.stakeEndAt <= now) {
      newErrors.stakeEndAt = 'Staking period must end after current time'
    }

    if (formData.claimStartFrom < formData.stakeEndAt) {
      newErrors.claimStartFrom = 'Claim start time cannot be before staking ends'
    }

    // Check if dates are reasonable (not more than 1 year)
    const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    if (formData.stakeEndAt > maxDate) {
      newErrors.stakeEndAt = 'Staking period cannot be more than 1 year from now'
    }

    if (formData.claimStartFrom > maxDate) {
      newErrors.claimStartFrom = 'Claim start time cannot be more than 1 year from now'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleNext = useCallback(() => {
    if (currentStep === CreateStep.FORM) {
      if (validateForm()) {
        setCurrentStep(CreateStep.PREVIEW)
      }
    }
  }, [currentStep, validateForm])

  const handleBack = useCallback(() => {
    if (currentStep === CreateStep.PREVIEW) {
      setCurrentStep(CreateStep.FORM)
    } else {
      // Navigate to challenges page instead of router.back() to avoid "no screen to go back to" error
      router.push('/(tabs)/challenges')
    }
  }, [currentStep, router])

  const handleSubmit = useCallback(async () => {
    console.log('handleSubmit called', { formData })
    
    if (formData.stakeEndAt <= new Date()) {
      console.log('Validation failed: stake end time in past')
      Alert.alert('Error', 'Stake end time must be in the future')
      return
    }

    if (formData.claimStartFrom < formData.stakeEndAt) {
      console.log('Validation failed: claim start before stake end')
      Alert.alert('Error', 'Claim start time cannot be before stake end time')
      return
    }

    console.log('Validation passed, starting challenge creation...')

    try {
      // Progress handler to update UI state
      const onProgress = (step: string, message: string) => {
        console.log(`Progress: ${step} - ${message}`)
        switch (step) {
          case 'creating_challenge':
            setCurrentStep(CreateStep.CREATING_CHALLENGE)
            break
        }
      }
      
      const result = await createMutation.mutateAsync({ ...formData, onProgress })
      
      // Store transaction result for enhanced success page
      setTransactionResult(result)
      setCurrentStep(CreateStep.SUCCESS)
      
    } catch (error: any) {
      console.error('Create challenge failed:', error)
      setCurrentStep(CreateStep.PREVIEW) // Go back to preview on error
      Alert.alert('Error', error.message || 'Failed to create challenge')
    }
  }, [formData, createMutation, router])

  const updateFormData = useCallback((updates: Partial<CreateChallengeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear related errors when user updates fields
    if (updates.name !== undefined) {
      setErrors(prev => ({ ...prev, name: '' }))
    }
    if (updates.stakeAmount !== undefined) {
      setErrors(prev => ({ ...prev, stakeAmount: '' }))
    }
    if (updates.stakeEndAt !== undefined) {
      setErrors(prev => ({ ...prev, stakeEndAt: '', claimStartFrom: '' }))
    }
    if (updates.claimStartFrom !== undefined) {
      setErrors(prev => ({ ...prev, claimStartFrom: '' }))
    }
  }, [])

  // Handle stake end date changes
  const handleStakeEndDateChange = useCallback((event: any, selectedDate?: Date) => {
    try {
      // For Android, the picker dismisses automatically
      // For iOS, we need to manually close it
      if (Platform.OS === 'android') {
        // Android dismisses automatically, so we should close the picker state
        setShowStakeEndPicker(false)
      }
      
      if (selectedDate) {
        // Update claim start date based on current delay option
        const claimStartFrom = getClaimStartDate(selectedDate, claimDelayOption)
        updateFormData({ 
          stakeEndAt: selectedDate,
          claimStartFrom 
        })
        
        // For iOS and web, close after selection
        if (Platform.OS !== 'android') {
          setShowStakeEndPicker(false)
        }
      } else if (event && typeof event === 'object' && event.type === 'dismissed') {
        // User cancelled the picker
        setShowStakeEndPicker(false)
      } else {
        // Close picker if no date was selected and it's not a clear dismiss
        setShowStakeEndPicker(false)
      }
    } catch (error) {
      console.warn('DateTimePicker handleStakeEndDateChange error:', error)
      // Always close picker on error
      setShowStakeEndPicker(false)
    }
  }, [claimDelayOption, updateFormData])

  // Handle claim delay option changes
  const handleClaimDelayChange = useCallback((option: string) => {
    setClaimDelayOption(option)
    const claimStartFrom = getClaimStartDate(formData.stakeEndAt, option)
    updateFormData({ claimStartFrom })
  }, [formData.stakeEndAt, updateFormData])

  // Helper function to calculate claim start date
  const getClaimStartDate = useCallback((stakeEndDate: Date, delayOption: string): Date => {
    const baseTime = stakeEndDate.getTime()
    switch (delayOption) {
      case 'immediately':
        return new Date(baseTime)
      case '1day':
        return new Date(baseTime + 24 * 60 * 60 * 1000) // 1 day
      case '3days':
        return new Date(baseTime + 3 * 24 * 60 * 60 * 1000) // 3 days
      case '7days':
        return new Date(baseTime + 7 * 24 * 60 * 60 * 1000) // 7 days
      default:
        return new Date(baseTime + 24 * 60 * 60 * 1000) // default 1 day
    }
  }, [])

  // Helper function to format date for display
  const formatDateTime = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Helper function to get claim delay display text
  const getClaimDelayText = useCallback((option: string): string => {
    switch (option) {
      case 'immediately':
        return 'Immediately'
      case '1day':
        return '1 Day After'
      case '3days':
        return '3 Days After'
      case '7days':
        return '7 Days After'
      default:
        return '1 Day After'
    }
  }, [])

  const renderFormStep = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Basic Information Section */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>📋 Basic Information</AppText>
        
        {/* Challenge Name */}
        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Challenge Name</AppText>
          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
            <UiIconSymbol name="pencil" size={16} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => updateFormData({ name: text })}
              placeholder="Enter challenge name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>
          {errors.name && <AppText style={styles.errorText}>{errors.name}</AppText>}
        </View>

        {/* Token Type Selection */}
        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Token Type</AppText>
          <View style={styles.tokenSelector}>
            <TouchableOpacity
              onPress={() => updateFormData({ tokenType: TokenAllowed.USDC })}
              style={[
                styles.tokenOption,
                formData.tokenType === TokenAllowed.USDC && styles.tokenOptionSelected
              ]}
              activeOpacity={0.8}
            >
              <UiIconSymbol 
                name="dollarsign.circle.fill" 
                size={20} 
                color={formData.tokenType === TokenAllowed.USDC ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} 
              />
              <AppText style={[
                styles.tokenOptionText,
                formData.tokenType === TokenAllowed.USDC && styles.tokenOptionTextSelected
              ]}>
                USDC
              </AppText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => updateFormData({ tokenType: TokenAllowed.WSOL })}
              style={[
                styles.tokenOption,
                formData.tokenType === TokenAllowed.WSOL && styles.tokenOptionSelected
              ]}
              activeOpacity={0.8}
            >
              <UiIconSymbol 
                name="sun.max.fill" 
                size={20} 
                color={formData.tokenType === TokenAllowed.WSOL ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} 
              />
              <AppText style={[
                styles.tokenOptionText,
                formData.tokenType === TokenAllowed.WSOL && styles.tokenOptionTextSelected
              ]}>
                SOL
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stake Amount */}
        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Stake Amount</AppText>
          <View style={[styles.inputContainer, errors.stakeAmount && styles.inputError]}>
            <UiIconSymbol name="banknote" size={16} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.textInput}
              value={formData.stakeAmount}
              onChangeText={(text) => updateFormData({ stakeAmount: text })}
              placeholder="0.0"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="numeric"
            />
            <AppText style={styles.tokenSymbol}>
              {formData.tokenType === TokenAllowed.USDC ? 'USDC' : 'SOL'}
            </AppText>
          </View>
          {errors.stakeAmount && <AppText style={styles.errorText}>{errors.stakeAmount}</AppText>}
          
          {formData.tokenType === TokenAllowed.WSOL && formData.stakeAmount && (
            <View style={styles.infoCard}>
              <UiIconSymbol name="info.circle.fill" size={16} color="#f59e0b" />
              <View style={styles.infoContent}>
                <AppText style={styles.infoTitle}>💡 Automatic SOL Wrapping</AppText>
                <AppText style={styles.infoText}>
                  SOL will be automatically wrapped to wSOL in the same transaction
                </AppText>
                <AppText style={styles.infoSubtext}>
                  Total needed: ~{(Number(formData.stakeAmount || 0) + 0.01).toFixed(4)} SOL (includes fees)
                </AppText>
              </View>
            </View>
          )}
        </View>

        {/* Creator Fee */}
        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Creator Fee ({(formData.fee / 100).toFixed(1)}%)</AppText>
          <View style={styles.inputContainer}>
            <UiIconSymbol name="percent" size={16} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.textInput}
              value={formData.fee.toString()}
              onChangeText={(text) => {
                const fee = parseInt(text) || 0
                if (fee >= 0 && fee <= 10000) {
                  updateFormData({ fee })
                }
              }}
              placeholder="100"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="numeric"
            />
            <AppText style={styles.tokenSymbol}>bp</AppText>
          </View>
          <AppText style={styles.helperText}>
            Enter 0-10000 basis points (0%-100%)
          </AppText>
        </View>
      </View>

      {/* Time Settings Section */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>⏰ Time Settings</AppText>
        
        {/* Staking Period Selector */}
        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Staking Period</AppText>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStakeEndPicker(true)}
            activeOpacity={0.8}
          >
            <View style={styles.datePickerContent}>
              <UiIconSymbol name="calendar" size={16} color="rgba(255, 255, 255, 0.6)" />
              <AppText style={styles.datePickerText}>
                {formatDateTime(formData.stakeEndAt)}
              </AppText>
              <UiIconSymbol name="chevron.down" size={16} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
          <AppText style={styles.helperText}>
            Participants can join until this date and time
          </AppText>
          {errors.stakeEndAt && <AppText style={styles.errorText}>{errors.stakeEndAt}</AppText>}
        </View>

        {/* Claim Period Options Grid */}
        <View style={styles.inputGroup}>
          <AppText style={styles.inputLabel}>Claim Period</AppText>
          <View style={styles.claimPeriodGrid}>
            {claimPeriodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.claimPeriodOption,
                  claimDelayOption === option.key && styles.claimPeriodOptionSelected
                ]}
                onPress={() => handleClaimDelayChange(option.key)}
                activeOpacity={0.8}
              >
                <AppText style={[
                  styles.claimPeriodOptionText,
                  claimDelayOption === option.key && styles.claimPeriodOptionTextSelected
                ]}>
                  {option.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Tips Area */}
          <View style={styles.claimPeriodTips}>
            <UiIconSymbol name="info.circle.fill" size={16} color={SolanaColors.brand.purple} />
            <AppText style={styles.claimPeriodTipsText}>
              {claimPeriodOptions.find(opt => opt.key === claimDelayOption)?.description || 'Select a claim period option'}
            </AppText>
          </View>
          
          {errors.claimStartFrom && <AppText style={styles.errorText}>{errors.claimStartFrom}</AppText>}
        </View>

        {/* Time Summary Card */}
        <View style={styles.timeSummaryCard}>
          <View style={styles.timeSummaryRow}>
            <View style={styles.timeSummaryItem}>
              <UiIconSymbol name="play.fill" size={16} color="#10b981" />
              <AppText style={styles.timeSummaryLabel}>Staking Starts</AppText>
              <AppText style={styles.timeSummaryValue}>Now</AppText>
            </View>
            <View style={styles.timeSummaryDivider} />
            <View style={styles.timeSummaryItem}>
              <UiIconSymbol name="stop.fill" size={16} color={SolanaColors.brand.purple} />
              <AppText style={styles.timeSummaryLabel}>Staking Ends</AppText>
              <AppText style={styles.timeSummaryValue}>
                {formData.stakeEndAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </AppText>
            </View>
            <View style={styles.timeSummaryDivider} />
            <View style={styles.timeSummaryItem}>
              <UiIconSymbol name="gift.fill" size={16} color="#f59e0b" />
              <AppText style={styles.timeSummaryLabel}>Claims Start</AppText>
              <AppText style={styles.timeSummaryValue}>
                {formData.claimStartFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Date/Time Picker Modal */}
      <CrossPlatformDateTimePicker
        value={formData.stakeEndAt}
        mode="datetime"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleStakeEndDateChange}
        minimumDate={new Date(Date.now() + 60 * 60 * 1000)} // At least 1 hour from now
        maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // Max 1 year
        isVisible={showStakeEndPicker}
        onClose={() => setShowStakeEndPicker(false)}
      />

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[SolanaColors.brand.purple, '#dc1fff']}
          style={styles.nextButtonGradient}
        />
        <AppText style={styles.nextButtonText}>Continue to Preview</AppText>
        <UiIconSymbol name="arrow.right" size={20} color="#ffffff" />
      </TouchableOpacity>
    </ScrollView>
  )

  return (
    <AppView style={styles.container}>
      <LinearGradient
        colors={[SolanaColors.brand.dark, '#2a1a3a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} />
      
      {/* Content based on current step */}
      {currentStep === CreateStep.FORM && renderFormStep()}
      {(currentStep === CreateStep.PREVIEW || 
        currentStep === CreateStep.CREATING_CHALLENGE) && (
        <ChallengePreview
          formData={formData}
          onEdit={() => setCurrentStep(CreateStep.FORM)}
          onConfirm={handleSubmit}
          isLoading={
            currentStep === CreateStep.CREATING_CHALLENGE || 
            createMutation.isPending
          }
          currentStep={currentStep}
          claimDelayOption={claimDelayOption}
          formatDateTime={formatDateTime}
          getClaimDelayText={getClaimDelayText}
        />
      )}
      
      {/* Enhanced Success State */}
      {currentStep === CreateStep.SUCCESS && transactionResult && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ChallengeSuccessEnhanced 
            transactionResult={transactionResult}
            formData={formData}
          />
        </ScrollView>
      )}
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  
  // Step Indicator Styles
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepCircleActive: {
    backgroundColor: SolanaColors.brand.purple,
    borderColor: SolanaColors.brand.purple,
  },
  stepCircleCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  stepTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  stepTextCompleted: {
    color: '#10b981',
    fontWeight: '600',
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: '60%',
    right: '-40%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepConnectorCompleted: {
    backgroundColor: '#10b981',
  },

  // Form Styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  // Claim Period Grid Styles
  claimPeriodGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  claimPeriodOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  claimPeriodOptionSelected: {
    backgroundColor: 'rgba(153, 69, 255, 0.15)',
    borderColor: SolanaColors.brand.purple,
  },
  claimPeriodOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  claimPeriodOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  claimPeriodTips: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  claimPeriodTipsText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  tokenSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  tokenOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  tokenOptionSelected: {
    backgroundColor: SolanaColors.brand.purple,
    borderColor: SolanaColors.brand.purple,
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tokenOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tokenOptionTextSelected: {
    color: '#ffffff',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(245, 158, 11, 0.9)',
    lineHeight: 18,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: 'rgba(245, 158, 11, 0.7)',
    fontFamily: 'monospace',
  },

  // Date Picker Styles
  datePickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },

  // Time Summary Styles
  timeSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    position: 'relative',
    zIndex: 1,
  },
  timeSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSummaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  timeSummaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  timeSummaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textAlign: 'center',
  },
  timeSummaryValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Next Button Styles
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 8,
    gap: 12,
    overflow: 'hidden',
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  nextButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Preview Styles
  previewContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  previewHeader: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  previewSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SolanaColors.brand.purple,
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SolanaColors.brand.purple,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
    overflow: 'hidden',
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  confirmButtonDisabled: {
    shadowOpacity: 0.2,
    elevation: 4,
  },
  confirmButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
})