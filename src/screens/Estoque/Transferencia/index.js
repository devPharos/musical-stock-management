import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  Alert,
  Image,
} from 'react-native'
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import { API_URL } from '../../../../config'
import { useUser } from '../../../hooks/user'
import { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { useTransferencia } from '../../../hooks/transferencia'

export default function Transferencia() {
  const [openOriginScanner, setOpenOriginScanner] = useState(false)
  const [openProductScanner, setOpenProductScanner] = useState(false)
  const [openDestinationScanner, setOpenDestinationScanner] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation()
  const { user } = useUser()
  const {
    originAddress,
    setOriginAddress,
    product,
    setProduct,
    destinationAddress,
    setDestinationAddress,
  } = useTransferencia()

  const onOriginCodeScanned = (code) => {
    setLoading(true)
    const Armazem = code.substring(0, 2)
    const Endereco = code.substring(2)

    axios
      .get(`${API_URL}/rest/wBuscaEnd`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
          Armazem,
          Endereco,
        },
      })
      .then((response) => {
        const data = response.data

        setOriginAddress(data)
        setOpenOriginScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          setLoading(false)
          Alert.alert('Atenção!','Endereço de origem não encontrado')
        }
      })
  }

  const onCodeProductScanned = (code) => {
    setLoading(true)
    axios
      .get(`${API_URL}/rest/wBuscaEtiq`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
          Etiqueta: code,
        },
      })
      .then((response) => {
        const data = response.data
        if (data.ENDERECO.trim() !== originAddress.ENDERECO.trim()) {
          setOpenProductScanner(false)
          Alert.alert('Atenção!','Produto não existe no endereço de origem')
          setLoading(false)
        }

        const product = {
          ARMAZEM: data.ARMAZEM,
          CODIGO: data.CODIGO,
          ENDERECO: data.ENDERECO,
          PRODUTOS: data.PRODUTOS[0],
          QTDE: data.QTDE,
        }

        setProduct(product)
        setOpenProductScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          setOpenProductScanner(false)
          Alert.alert('Atenção!','Produto não encontrado')
          setLoading(false)
        }
      })
  }

  const onDestinationCodeScanned = (code) => {
    setLoading(true)
    const Armazem = code.substring(0, 2)
    const Endereco = code.substring(2)

    axios
      .get(`${API_URL}/rest/wBuscaEnd`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
          Armazem,
          Endereco,
        },
      })
      .then((response) => {
        const data = response.data

        setDestinationAddress(data)
        setOpenDestinationScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          Alert.alert('Atenção!','Endereço de destino não encontrado')
          setLoading(false)
        }
      })
  }

  const handleTransferenceConfirmation = () => {
    navigation.navigate('ConfirmacaoTransf')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        {openOriginScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onOriginCodeScanned} />
        )}
        {openProductScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onCodeProductScanned} />
        )}
        {openDestinationScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onDestinationCodeScanned} />
        )}
        {!(
          openOriginScanner ||
          openProductScanner ||
          openDestinationScanner
        ) && (
          <View style={styles.innerContent}>
            <View style={styles.inputContent}>
              <Pressable
                style={styles.button}
                onPress={() => setOpenOriginScanner(true)}
              >
                <Icon
                  name="md-barcode-outline"
                  size={30}
                  color={colors['gray-500']}
                />
                <Text style={styles.buttonLabel}>
                  {originAddress.ENDERECO !== ''
                    ? originAddress.ARMAZEM + " - " +originAddress.ENDERECO
                    : 'Endereço de Origem'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.inputContent}>
              <Pressable
                style={styles.button}
                onPress={() => setOpenProductScanner(true)}
              >
                <Icon
                  name="md-barcode-outline"
                  size={30}
                  color={colors['gray-500']}
                />
                { product.CODIGO && <Image source={{ uri: product.PRODUTOS.IMAGEM}} style={{ width: 50, height: 50 }} /> }
                <Text style={styles.buttonLabel}>
                  {product.CODIGO !== '' ? product.PRODUTOS.PARTNUMBER : 'Etiqueta do Produto'}
                </Text>

                { product.CODIGO && <View style={[styles.button,{ paddingHorizontal: 4, paddingVertical: 4}]}>
                  <Text>{product.QTDE} uni.</Text>
                </View>}

              </Pressable>

              

            </View>

            <View style={styles.inputContent}>
              <Pressable
                style={styles.button}
                onPress={() => setOpenDestinationScanner(true)}
              >
                <Icon
                  name="md-barcode-outline"
                  size={30}
                  color={colors['gray-500']}
                />
                <Text style={styles.buttonLabel}>
                  {destinationAddress.ENDERECO !== ''
                    ? destinationAddress.ARMAZEM + " - " +destinationAddress.ENDERECO
                    : 'Endereço de Destino'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              disabled={
                !(
                  originAddress.ARMAZEM !== '' &&
                  product.ENDERECO !== '' &&
                  destinationAddress.ENDERECO !== ''
                )
              }
              style={
                !(
                  originAddress.ARMAZEM !== '' &&
                  product.ENDERECO !== '' &&
                  destinationAddress.ENDERECO !== ''
                )
                  ? styles.buttonDisabled
                  : styles.button
              }
              onPress={handleTransferenceConfirmation}
            >
              <Text
                style={
                  !(
                    originAddress.ARMAZEM !== '' &&
                    product.ENDERECO !== '' &&
                    destinationAddress.ENDERECO !== ''
                  )
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
                  !(
                    originAddress.ARMAZEM !== '' &&
                    product.ENDERECO !== '' &&
                    destinationAddress.ENDERECO !== ''
                  )
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 32,
    flex: 1
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
