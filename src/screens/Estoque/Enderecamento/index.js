import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native'
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { useEnderecamento } from '../../../hooks/enderecamento'

export default function Enderecamento() {
  const { setAddressing, addressing } = useEnderecamento()
  const [openProductScanner, setOpenProductScanner] = useState(false)
  const [openAddressingScanner, setOpenAddressingScanner] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigation =
    useNavigation()

  const onCodeProductScanned = (code) => {
    setLoading(true)
    axios
      .get(`/wBuscaEtiq?Etiqueta=${code}`)
      .then((response) => {
        const data = response.data

        if(addressing.PRODUTOS.find(p => p.ETIQUETA.trim() === code.trim())) {
          Alert.alert('Atenção!','Produto já na listagem a endereçar.', [
            {
              text: 'Ok',
            }
          ])
          setLoading(false)
          return
        }

        if (data.ENDERECO !== '' && data.PRODUTOS[0].AENDERECAR.length === 0) {
          setOpenProductScanner(false);
          Alert.alert('Atenção!','Produto já endereçado', [
            {
              text: 'Ok',
            }
          ])
          setLoading(false)
          return
        }

        setAddressing({ ...addressing, PRODUTOS: [...addressing.PRODUTOS, data.PRODUTOS[0]] })
        setOpenProductScanner(false)
        setLoading(false)
      })
  }

  const onCodeAddressingScanned = (code) => {
    setLoading(true)
    const Armazem = code.substring(0, 2)
    const Endereco = code.substring(2)

    console.log(Armazem, Endereco)

    axios
      .get(`/wBuscaEnd?Armazem=${Armazem}&Endereco=${Endereco}`)
      .then((response) => {
        const data = response.data
        console.log('foi')
        // const enderc = {
        //   ...data,
        //   PRODUTOS: [addressing?.PRODUTOS],
        // }
        // console.log({...addressing, armazem: Armazem, endereco: Endereco})

        setAddressing({...addressing, ARMAZEM: Armazem, ENDERECO: Endereco})
        setOpenAddressingScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setOpenAddressingScanner(false)
        if (error) {
          Alert.alert('Atenção!','Endereço de destino não encontrado', [
            {
              text: 'Ok',
            }
          ])
          setLoading(false)
          return
        }
      })
  }

  function handleRemove(product) {
    const newProducts = addressing.PRODUTOS.filter(p => p.ETIQUETA.trim() !== product.ETIQUETA.trim())
    setAddressing({...addressing, PRODUTOS: newProducts})
  }

  function handleEndConference(){
    setLoading(true)

    if(!addressing.ARMAZEM || !addressing.ENDERECO) {
      Alert.alert('Atenção!','Endereço de destino não definido.', [
        {
          text: 'Ok',
        }
      ])
      setLoading(false)
      return
    }

    if(addressing.PRODUTOS.length === 0) {
      Alert.alert('Atenção!','Nenhum produto selecionado.', [
        {
          text: 'Ok',
        }
      ])
      setLoading(false)
      return
    }

    const body = {
      produtos: addressing.PRODUTOS,
      armazem: addressing.ARMAZEM,
      endereco: addressing.ENDERECO,
    }
    // console.log(body)
    axios
      .post(`/wEnderecar`, body)
      .then(() => {
        setLoading(false)
        Alert.alert('Atenção!',response.data.Message, [
          {
            text: 'Ok',
            onPress: () => {
              navigation.popToTop()
            }
          }
        ])
      }).catch(err => {
        console.log(err)
        Alert.alert('Atenção!', err.message)
        setLoading(false)
      })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        { loading ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}><ActivityIndicator color={colors["green-300"]} /><Text>Buscando...</Text></View>
        :
        <>
          {!loading && openProductScanner && (
            <Scanner handleCodeScanned={onCodeProductScanned} handleClose={() => setOpenProductScanner(false)} />
          )}
          {!loading && openAddressingScanner && (
            <Scanner handleCodeScanned={onCodeAddressingScanned}  handleClose={() => setOpenAddressingScanner(false)} />
          )}
          {!(openProductScanner || openAddressingScanner) && (
            <View style={styles.innerContent}>
              <View style={styles.inputContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonLabel}>Produtos</Text>
                  {addressing.PRODUTOS.length > 0 && (
                  <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 4, borderRadius: 4, marginLeft: 4 }}>
                    <Text style={{ color: colors.white, fontWeight: '700' }}>{addressing.PRODUTOS.length}</Text>
                  </View>)}
                </View>
                <Pressable
                  style={styles.button}
                  onPress={() => setOpenProductScanner(true)}
                >
                  <Text style={styles.buttonLabel}>
                    Escanear
                  </Text>
                  <Icon
                    name="barcode-outline"
                    size={30}
                    color={colors['gray-500']}
                  />
                </Pressable>
              </View>

              <View style={styles.inputContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonLabel}>Endereço</Text>
                </View>
                <Pressable
                  style={styles.button}
                  onPress={() => setOpenAddressingScanner(true)}
                >
                  <Text style={styles.buttonLabel}>
                    {addressing.ENDERECO !== '' ? addressing.ENDERECO : 'Escanear'}
                  </Text>
                  <Icon
                    name="barcode-outline"
                    size={30}
                    color={colors['gray-500']}
                  />
                </Pressable>
              </View>

              <Pressable
                disabled={
                  !(addressing.CODIGO !== '' && addressing.DESCRICAO !== '')
                }
                style={
                  !(addressing.CODIGO !== '' && addressing.DESCRICAO !== '')
                    ? styles.buttonDisabled
                    : styles.button
                }
                onPress={handleEndConference}
              >
                <Text
                  style={
                    !(addressing.CODIGO !== '' && addressing.DESCRICAO !== '')
                      ? styles.buttonLabelDisabled
                      : styles.buttonLabel
                  }
                >
                  Confirmar Endereçamento
                </Text>
                <Icon
                  name="arrow-forward"
                  size={20}
                  color={
                    !(addressing.CODIGO !== '' && addressing.DESCRICAO !== '')
                      ? colors['gray-300']
                      : colors['gray-500']
                  }
                />
              </Pressable>
            </View>
          )}

          {
          !openAddressingScanner && !openProductScanner && addressing.PRODUTOS.length > 0 && addressing.PRODUTOS.map((product, index) => ( 
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors['gray-200'] }}>
              <TouchableOpacity onPress={() => handleRemove(product)}>
                <Icon name="trash-bin" size={20} color={colors['red-500']} />
              </TouchableOpacity>
              <Image source={{ uri: product.IMAGEM }} style={{ width: 32, height: 32 }} />
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
                  <Icon name="barcode-outline" size={16} color={colors['gray-300']} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{product.ETIQUETA}</Text>
                </View>
                <Text style={{ fontSize: 12 }}>{product.PARTNUMBER} - {product.DESCRICAO.substring(0, 16)}...</Text>
              </View>
            </View>
          ))
          }
        </>
        }
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
