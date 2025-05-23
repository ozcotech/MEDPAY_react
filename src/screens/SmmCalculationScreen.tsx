import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import ThemedBackground from '../components/common/ThemedBackground';
import ThemedButton from '../components/common/ThemedButton';
import { ThemedCard } from '../components/common/ThemedCard';
import ScreenContainer from '../components/common/ScreenContainer';
import { calculateSMM } from '../utils/smmCalculator';
import { 
  SMMCalculationType, 
  smmCalculationTypeOptions,
  PERSON_TYPE_GERCEK,
  PERSON_TYPE_TUZEL
} from '../constants/smmOptions';
import { formatKurusToTlString, normalizeToKurusString, convertKurusStringToTlNumber } from '../utils/formatCurrency';

const SMMCalculationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State management
  const [mediationFee, setMediationFee] = useState<string>(''); // Stores raw kurus as string (e.g., "100000")
  const [calculationType, setCalculationType] = useState<SMMCalculationType>(
    SMMCalculationType.KDV_DAHIL_STOPAJ_YOK
  );
  const [calculated, setCalculated] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);

  // Calculate SMM results based on inputs
  const handleCalculate = () => {
    if (!mediationFee || mediationFee.trim() === '') {
      Alert.alert('Uyarı', 'Lütfen arabuluculuk ücretini boş bırakmayınız.');
      return;
    }
    
    const tlMediationFee = convertKurusStringToTlNumber(mediationFee); // Convert "100000" to 1000

    if (isNaN(tlMediationFee)) {
      Alert.alert('Uyarı', 'Lütfen arabuluculuk ücreti için geçerli bir sayısal değer giriniz.');
      return;
    }

    if (tlMediationFee <= 0) {
      Alert.alert('Uyarı', 'Arabuluculuk ücreti pozitif bir değer olmalıdır.');
      return;
    }

    const input = {
      mediationFee: tlMediationFee,
      calculationType,
    };

    const calculationResults = calculateSMM(input);
    setResults(calculationResults);
    setCalculated(true);
    Keyboard.dismiss();
    
    // Scroll to top after calculation
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 200); // Increased timeout for more reliable scrolling
  };

  // Navigation handlers
  const navigateToHome = () => {
    navigation.navigate('MainTabs', { screen: 'Start' } as never);
  };

  const navigateToAbout = () => {
    navigation.navigate('MainTabs', { screen: 'About' } as never);
  };

  // Handle mediation fee input changes with formatting
  const handleMediationFeeChange = (text: string) => {
    // When text is input, we expect it to be the formatted TL string (e.g., "1.000,00")
    // We need to convert it back to a raw digit string (kurus) for storage.
    const rawDigits = normalizeToKurusString(text); // "100000"
    setMediationFee(rawDigits);
  };

  // Format currency for display
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return '-';
    return `₺${amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <ThemedBackground>
      <ScreenContainer paddingTop={50} marginBottom={140}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
        <View style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[
                styles.contentContainer, 
                { justifyContent: calculated ? 'flex-start' : 'center' }
              ]}>
                {/* Input Section */}
                <View style={styles.inputSection}>
                  <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                    Arabuluculuk Ücreti:
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: theme.colors.text.primary,
                        borderColor: theme.colors.button.border,
                        backgroundColor: theme.colors.card.background,
                        textAlign: 'center' 
                      }
                    ]}
                    value={mediationFee === '' ? '' : formatKurusToTlString(mediationFee)} // Show formatted value or empty string
                    onChangeText={handleMediationFeeChange}
                    placeholder="Arabuluculuk Ücretini Girin"
                    placeholderTextColor={theme.colors.text.secondary || '#666666'}
                    keyboardType="numeric"
                    maxLength={18} // Prevent excessively long entries
                    textAlign="center" 
                  />
                  
                  <Text style={[styles.label, { color: theme.colors.text.primary, marginTop: 15 }]}>
                    Hesaplama Türü:
                  </Text>
                  <View style={styles.optionsContainer}>
                    {smmCalculationTypeOptions.map((option) => {
                      
                      const [firstLine, secondLine] = option.label.split(', ');
                      
                      return (
                        <ThemedButton
                          key={option.value}
                          title={`${firstLine}\n${secondLine}`} 
                          onPress={() => setCalculationType(option.value)}
                          style={[
                            styles.optionButton,
                            calculationType === option.value && {
                              ...styles.selectedOption,
                              borderColor: theme.colors.text.primary
                            }
                          ]}
                          textStyle={[
                            styles.optionText,
                            calculationType === option.value && styles.selectedOptionText
                          ]}
                        />
                      );
                    })}
                  </View>

                  <ThemedButton
                    title="Hesapla"
                    onPress={handleCalculate}
                    style={styles.calculateButton}
                    textStyle={styles.calculateButtonText}
                  />
                </View>
                
                {/* Results Section */}
                {calculated && results && (
                  <View style={styles.resultsContainer}>
                    <ThemedCard style={styles.resultsCard}>
                      <Text style={[styles.resultsTitle, { color: theme.colors.text.primary }]}>
                        SMM Hesaplama Sonuçları
                      </Text>
                      
                      {/* Table Header */}
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableHeaderCell, styles.descriptionCell, { color: theme.colors.text.primary }]}>
                          Açıklama
                        </Text>
                        <Text style={[styles.tableHeaderCell, styles.amountCell, { color: theme.colors.text.primary }]}>
                          {PERSON_TYPE_TUZEL}
                        </Text>
                        <Text style={[styles.tableHeaderCell, styles.amountCell, { color: theme.colors.text.primary }]}>
                          {PERSON_TYPE_GERCEK}
                        </Text>
                      </View>
                      
                      {/* Table Rows */}
                      {results.rows.map((row: any, index: number) => (
                        <View key={index} style={[
                          styles.tableRow,
                          index % 2 === 0 ? { backgroundColor: 'rgba(0,0,0,0.02)' } : {}
                        ]}>
                          <Text style={[styles.tableCell, styles.descriptionCell, { color: theme.colors.text.primary }]}>
                            {row.label}
                          </Text>
                          <Text style={[styles.tableCell, styles.amountCell, { color: theme.colors.text.primary }]}>
                            {formatCurrency(row.tuzelKisiAmount)}
                          </Text>
                          <Text style={[styles.tableCell, styles.amountCell, { color: theme.colors.text.primary }]}>
                            {formatCurrency(row.gercekKisiAmount)}
                          </Text>
                        </View>
                      ))}
                    </ThemedCard>
                  </View>
                )}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
      </ScreenContainer>
      
      {/* Custom Tab Bar for SmmCalculationScreen */}
      <View style={styles.tabBarWrapper}>
        <View 
          style={[
            styles.tabBarContainer, 
            { 
              backgroundColor: theme.colors.card.background,
              borderTopColor: theme.colors.button.border,
              borderColor: theme.colors.button.border,
            }
          ]}
        >
          {/* Home Button */}
          <TouchableOpacity 
            style={[styles.tabButton]} 
            onPress={navigateToHome}
          >
            <View style={styles.tabButtonInner}>
              <Image
                source={require('../../assets/images/home-icon.png')}
                style={[styles.tabIcon, { tintColor: theme.colors.text.secondary }]}
              />
              <Text 
                style={[
                  styles.tabText, 
                  { color: theme.colors.text.secondary }
                ]}
              >
                Ana Sayfa
              </Text>
            </View>
          </TouchableOpacity>

          {/* Middle spacer - can be used for additional buttons */}
          <View style={styles.middleSpacer} />

          {/* Info Button (About Screen) */}
          <TouchableOpacity 
            style={[styles.tabButton]} 
            onPress={navigateToAbout}
          >
            <View style={styles.tabButtonInner}>
              <Image
                source={require('../../assets/images/info-icon.png')}
                style={[styles.tabIcon, { tintColor: theme.colors.text.secondary }]}
              />
              <Text 
                style={[
                  styles.tabText, 
                  { color: theme.colors.text.secondary }
                ]}
              >
                Hakkında
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
    </ThemedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 70, // Increased top padding to avoid notch
    paddingBottom: 180, // Increased bottom padding for tab bar
    paddingHorizontal: '7.5%', // Added to match tab bar width
    minHeight: '100%',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  inputSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center', 
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  calculateButton: {
    marginTop: 10, 
    width: '100%',
    paddingVertical: 12, 
  },
  calculateButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultsContainer: {
    width: '100%',
    marginTop: 1,
    marginBottom: 20, // Increased margin for better separation
  },
  resultsCard: {
    width: '100%', // Full width of the padded container
    padding: 8, 
    paddingTop: 10, 
    paddingBottom: 12, // Slightly more padding at the bottom 
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10, 
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 7, 
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableCell: {
    fontSize: 14,
  },
  descriptionCell: {
    flex: 2,
    paddingRight: 5,
  },
  amountCell: {
    flex: 1.5,
    textAlign: 'right',
    paddingRight: 5,
  },
  
  optionsContainer: {
    width: '100%',
    flexDirection: 'row', // Horizontal alignment
    flexWrap: 'wrap', // Allows buttons to wrap to the next line if they don't fit
    justifyContent: 'space-between', // Equal space between buttons
    marginBottom: 10,
  },
  optionButton: {
    marginVertical: 3,
    width: '48%', // Instead of full width, use 48% (to leave space between)
    height: 60, // Increase button height (since content will be 2 lines)
  },
  selectedOption: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#FFFFFF',
    borderWidth: 1.5, // Make the border more pronounced
    shadowOpacity: 0.4, // Add more shadow for better visibility
  },
  optionText: {
    fontSize: 13, // Slightly reduce font size
    textAlign: 'center',
    flexWrap: 'wrap', // Allows text to wrap
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  // Tab Bar Styles
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60, // moved up to leave space for footer
    alignItems: 'center',
    zIndex: 10,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderRadius: 25, // Rounded corners for tab bar
    width: '85%',
    alignSelf: 'center',
    height: Platform.OS === 'ios' ? 70 : 65, // Adjusted height
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 0, // Remove padding to allow button height control
    backgroundColor: '#fff', // fallback, will be overridden by theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    borderRadius: 10,
    height: '90%',
    overflow: 'hidden', // Prevents content from overflowing
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabButtonInner: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingVertical: 6,
  },
  middleSpacer: {
    flex: 3, // This gives more space in the middle
  },
});

export default SMMCalculationScreen;