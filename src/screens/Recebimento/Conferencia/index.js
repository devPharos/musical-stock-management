import {
  StyleSheet,
  SafeAreaView,
  Text,
  ImageBackground,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { colors } from '../../../styles/colors'
import { ReceiptCard } from '../../../components/receiptCard'
import Icon from 'react-native-vector-icons/Ionicons'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../../../config'
import { useUser } from '../../../hooks/user'
import { useConference } from '../../../hooks/conference'

export default function Conferencia({ navigation }) {
  const { user } = useUser()
  const { selectedInvoices } = useConference()
  const [loading, setLoading] = useState(true)

  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/rest/wBuscaNF`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      })
      .then((response) => {
        setInvoices(response.data.notas)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          console.warn(error)
          setLoading(false)
        }
      })
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        {invoices && (
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Selecione as notas a conferir:</Text>
            </View>
            <ScrollView style={{ flex: 1 }}>
              <ReceiptCard invoices={invoices} setInvoices={setInvoices} loading={loading} />
            </ScrollView>
          </View>
        )}

        {selectedInvoices.length ? (
          <TouchableOpacity
            style={
              invoices.length > 0
                ? styles.buttonContainer
                : styles.buttonDisabled
            }
            disabled={invoices.length === 0}
            onPress={() => navigation.navigate('Items')}
          >
            <Text
              style={
                invoices.length > 0
                  ? styles.buttonLabel
                  : styles.buttonLabelDisabled
              }
            >
              Iniciar Conferência
            </Text>
            <Icon name="arrow-forward" color={colors['gray-500']} size={16} />
          </TouchableOpacity>
        ) : null}
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    shadowColor: '#222',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: colors['gray-500'],
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  title: {
    color: colors.white,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors['gray-200'],
    margin: 24,
  },
  buttonDisabled: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors['gray-50'],
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors['gray-50'],
  },
  buttonLabelDisabled: {
    fontWeight: '700',
    color: colors['gray-300'],
  },
  buttonLabel: {
    fontWeight: '700',
    color: colors['gray-500'],
  },
  input: {
    flex: 1,
    color: colors['gray-500'],
  },
  inputError: {
    flex: 1,
    color: colors['red-500'],
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 90,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors['gray-200'],
  },
  inputContainerError: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors['red-50'],
    borderRadius: 90,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    gap: 4,
  },
  errorMessage: {
    color: colors['red-500'],
    marginLeft: 16,
  },
})
