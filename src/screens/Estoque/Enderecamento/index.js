import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native'
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import { useUser } from '../../../hooks/user'
import { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { useEnderecamento } from '../../../hooks/enderecamento'

export default function Enderecamento() {
  const { user, baseURL } = useUser()
  const { setAddressing, addressing, endereco, setEndereco } =
    useEnderecamento()
  const [openProductScanner, setOpenProductScanner] = useState(false)
  const [openAddressingScanner, setOpenAddressingScanner] = useState(false)

  const navigation =
    useNavigation()

  const onCodeProductScanned = (code) => {
    axios
      .get(`/wBuscaEtiq?Etiqueta=${code}`)
      .then((response) => {
        const data = response.data

        if (data.ENDERECO !== '' && data.PRODUTOS[0].AENDERECAR.length === 0) {
          throw new Error('Produto já endereçado')
        }

        const product = data.PRODUTOS[0]
        const addressing = {
          ARMAZEM: data.ARMAZEM,
          CODIGO: data.CODIGO,
          ENDERECO: data.ENDERECO,
          PRODUTOS: product,
          QTDE: data.QTDE,
        }

        setAddressing(addressing)
        setOpenProductScanner(false)
      })
  }

  const onCodeAddressingScanned = (code) => {
    const Armazem = code.substring(0, 2)
    const Endereco = code.substring(2)

    axios
      .get(`/wBuscaEnd?Armazem=${Armazem}&Endereco=${Endereco}`)
      .then((response) => {
        const data = response.data
        const enderc = {
          ...data,
          PRODUTOS: [addressing?.PRODUTOS],
        }

        setEndereco(enderc)
        setOpenAddressingScanner(false)
      })
      .catch((error) => {
        if (error) {
          throw new Error('Endereço de destino não encontrado')
        }
      })
  }

  const handleAdressingConfirmation = () => {
    navigation.navigate(
      'Confirmacao',
      addressing || {
        ARMAZEM: '',
        CODIGO: '',
        ENDERECO: '',
        PRODUTOS: {
          DESCRICAO: '',
          IMAGEM: '',
          PARTNUMBER: '',
        },
        QTDE: 0,
      },
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        {openProductScanner && (
          <Scanner handleCodeScanned={onCodeProductScanned} />
        )}
        {openAddressingScanner && (
          <Scanner handleCodeScanned={onCodeAddressingScanned} />
        )}
        {!(openProductScanner || openAddressingScanner) && (
          <View style={styles.innerContent}>
            <View style={styles.inputContent}>
              <View style={styles.textContainer}>
                <Text style={styles.buttonLabel}>Produto</Text>
                {addressing.CODIGO !== '' && (
                  <Icon
                    name="md-checkmark-circle"
                    size={20}
                    color={colors['green-300']}
                  />
                )}
              </View>
              <Pressable
                style={styles.button}
                onPress={() => setOpenProductScanner(true)}
              >
                <Text style={styles.buttonLabel}>
                  {addressing.CODIGO !== '' ? addressing.CODIGO : 'Escanear'}
                </Text>
                <Icon
                  name="md-barcode-outline"
                  size={30}
                  color={colors['gray-500']}
                />
              </Pressable>
            </View>

            <View style={styles.inputContent}>
              <View style={styles.textContainer}>
                <Text style={styles.buttonLabel}>Endereço</Text>
                {endereco.DESCRICAO !== '' && (
                  <Icon
                    name="md-checkmark-circle"
                    size={20}
                    color={colors['green-300']}
                  />
                )}
              </View>
              <Pressable
                style={styles.button}
                onPress={() => setOpenAddressingScanner(true)}
              >
                <Text style={styles.buttonLabel}>
                  {endereco.ENDERECO !== '' ? endereco.ENDERECO : 'Escanear'}
                </Text>
                <Icon
                  name="md-barcode-outline"
                  size={30}
                  color={colors['gray-500']}
                />
              </Pressable>
            </View>

            <Pressable
              disabled={
                !(addressing.CODIGO !== '' && endereco.DESCRICAO !== '')
              }
              style={
                !(addressing.CODIGO !== '' && endereco.DESCRICAO !== '')
                  ? styles.buttonDisabled
                  : styles.button
              }
              onPress={handleAdressingConfirmation}
            >
              <Text
                style={
                  !(addressing.CODIGO !== '' && endereco.DESCRICAO !== '')
                    ? styles.buttonLabelDisabled
                    : styles.buttonLabel
                }
              >
                Continuar
              </Text>
              <Icon
                name="md-arrow-forward"
                size={20}
                color={
                  !(addressing.CODIGO !== '' && endereco.DESCRICAO !== '')
                    ? colors['gray-300']
                    : colors['gray-500']
                }
              />
            </Pressable>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors['gray-50'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  inputContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  innerContent: {
    padding: 24,
    paddingTop: 56,
    gap: 32,
  },
  buttonLabel: {
    fontSize: 16,
    color: colors['gray-500'],
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 24,
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
    width: '100%',
    gap: 4,
  },
  errorMessage: {
    color: colors['red-500'],
    marginLeft: 16,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
})
