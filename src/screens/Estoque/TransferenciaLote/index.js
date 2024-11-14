import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios'
import { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTransferencia } from '../../../hooks/transferencia'
import { useUser } from '../../../hooks/user';

export default function Transferencia({ navigation }) {
  const [openOriginScanner, setOpenOriginScanner] = useState(false)
  const [openProductScanner, setOpenProductScanner] = useState(false)
  const [openDestinationScanner, setOpenDestinationScanner] = useState(false)
  const [openSNScanner, setOpenSNScanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const { refreshAuthentication } = useUser()

  const {
    transfer,
    setTransfer
  } = useTransferencia()

  const onOriginCodeScanned = (code) => {
    setOpenOriginScanner(false)
    setLoading(true)
    const Armazem = code.substring(0, 2)
    const Endereco = code.substring(2)

    axios
      .get(`/wBuscaEnd?Armazem=${Armazem}&Endereco=${Endereco}`)
      .then((response) => {
        const data = response.data

        setTransfer({...transfer, ENDERECODEORIGEM: data.ENDERECO, ARMAZEMDEORIGEM: data.ARMAZEM})
        setOpenOriginScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          if(error.message?.includes('401')) {
            refreshAuthentication();
          }
          setLoading(false)
          Alert.alert('Atenção!','Endereço de origem não encontrado')
        }
      })
  }

  const onCodeProductScanned = (code) => {
    setOpenProductScanner(false)
    setLoading(true)
    axios
      .get(`/wBuscaEtiq?Etiqueta=${code}&Saldo=NAO`)
      .then((response) => {
        const data = response.data

        if(transfer.PRODUTOS.find(p => p.ETIQUETA.trim() === code.trim())) {
          Alert.alert('Atenção!','Produto já na listagem a endereçar.', [
            {
              text: 'Ok',
            }
          ])
          setLoading(false)
          return
        }

        if(transfer.TEMSN) {
          Alert.alert("Atenção!","Produto com número de série deve ser transferido individualmente.", [
            {
              text: 'Ok',
            }
          ])
          setLoading(false)
          return
        }

        if(data.PRODUTOS[0].TEMSN === 'S' && transfer.PRODUTOS.length > 0) {
          Alert.alert("Atenção!","Produto com número de série deve ser transferido individualmente.", [
            {
              text: 'Ok',
            }
          ])
          setLoading(false)
          return
        }

        setTransfer({...transfer,ENDERECODEORIGEM: data.ENDERECO, ARMAZEMDEORIGEM: data.ARMAZEM, PRODUTOS: [...transfer.PRODUTOS, data.PRODUTOS[0]], TEMSN: data.PRODUTOS[0].TEMSN === 'S'})

        setOpenProductScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          if(error.message?.includes('401')) {
            refreshAuthentication();
            setLoading(false)
            return;
          }
          setOpenProductScanner(false)
          Alert.alert('Atenção!','Produto não encontrado')
          setLoading(false)
        }
      })
  }

  const onDestinationCodeScanned = (code) => {
    setOpenDestinationScanner(false)
    setLoading(true)
    const Armazem = code.substring(0, 2)
    const Endereco = code.substring(2)

    axios
      .get(`/wBuscaEnd?Armazem=${Armazem}&Endereco=${Endereco}`)
      .then((response) => {
        const data = response.data
        // setProduct({ ...product, ENDERECODESTINO: data.ENDERECO, ARMAZEMDESTINO: data.ARMAZEM })
        setTransfer({...transfer, ENDERECODEDESTINO: data.ENDERECO, ARMAZEMDEDESTINO: data.ARMAZEM})
        setOpenDestinationScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          if(error.message?.includes('401')) {
            refreshAuthentication();
          }
          Alert.alert('Atenção!','Endereço de destino não encontrado')
          setLoading(false)
        }
      })
  }

  const onSNCodeScanned = (code) => {
    setOpenSNScanner(false)
    setLoading(false)
    axios.get(`/wIbanezEan?Produto=${transfer.PRODUTOS[0].CODIGO}&SN=${code}`)
          .then(({ data: retorno }) => {
            if(retorno && retorno.Message) {
              setTransfer({...transfer, SERIALNUMBER: code})
            } else {
              Alert.alert("Atenção!","Número de série não localizado para este produto.")
              setTransfer({...transfer, SERIALNUMBER: ""})
            }
            setLoading(false)
          })
      .catch((error) => {
        if (error) {
          if(error.message?.includes('401')) {
            refreshAuthentication();
          }
          Alert.alert('Atenção!','Produto não encontrado')
          setLoading(false)
        }
      })
  }

  const handleTransferenceConfirmation = () => {
    setLoading(true)
    if(transfer.TEMSN && !transfer.SERIALNUMBER) {
      Alert.alert("Atenção!","Bipe a etiqueta de número de série do produto para rastreamento.", [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return
    }

    if(transfer.PRODUTOS.length === 0) {
      Alert.alert("Atenção!","Nenhum produto selecionado para transferência.", [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return
    }

    if(!transfer.ENDERECODEORIGEM || !transfer.ENDERECODEDESTINO) {
      Alert.alert("Atenção!","Endereço de origem ou destino não informado.", [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return
    }
    
    const body = {
      produtos: transfer.PRODUTOS,
      armazem_origem: transfer.ARMAZEMDEORIGEM,
      endereco_origem: transfer.ENDERECODEORIGEM,
      armazem_destino: transfer.ARMAZEMDEDESTINO,
      endereco_destino: transfer.ENDERECODEDESTINO,
      numero_de_serie: transfer.SERIALNUMBER,
    }
    axios
      .post(`/wTransferirLote`, body)
      .then((response) => {
        setLoading(false)
        Alert.alert('Atenção!',response.data.Message, [
          {
            text: 'Ok',
            onPress: () => {
              navigation.goBack()
            }
          }
        ])
      }).catch(err => {
        setLoading(false)
      })
  }

  function handleRemove(product) {
    const newProducts = transfer.PRODUTOS.filter(p => p.ETIQUETA !== product.ETIQUETA)
    let temSN = transfer.TEMSN;
    if(newProducts.length === 0) {
      temSN = false
    }
    setTransfer({...transfer, PRODUTOS: newProducts, TEMSN: temSN})
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        {openProductScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onCodeProductScanned} handleClose={() => setOpenProductScanner(false)} />
        )}
        {openOriginScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onOriginCodeScanned} handleClose={() => setOpenOriginScanner(false)} />
        )}
        {openDestinationScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onDestinationCodeScanned} handleClose={() => setOpenDestinationScanner(false)} />
        )}
        {openSNScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onSNCodeScanned} handleClose={() => setOpenSNScanner(false)} />
        )}

        {!openProductScanner && !openOriginScanner && !openDestinationScanner && !openSNScanner &&

        <View style={styles.innerContent}>
          <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <Text style={styles.buttonLabel}>Produtos</Text>
              {transfer.PRODUTOS.length > 0 && (
              <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 4, borderRadius: 4, marginLeft: 4 }}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>{transfer.PRODUTOS.length}</Text>
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

          <View style={[styles.inputContent, {display: 'none'}]}>
            <View style={styles.textContainer}>
              <View>
                <Text style={styles.buttonLabel}>Origem</Text>
              </View>
              {transfer.ENDERECODEORIGEM !== '' && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={colors['green-300']}
                />
              )}
            </View>
            <View
              style={styles.button}
              // onPress={() => setOpenOriginScanner(true)}
            >
              <Text style={styles.buttonLabel}>
                {transfer.ENDERECODEORIGEM !== '' ? transfer.ARMAZEMDEORIGEM + transfer.ENDERECODEORIGEM : 'Escanear'}
              </Text>
              {/* <Icon
                name="barcode-outline"
                size={30}
                color={colors['gray-500']}
              /> */}
            </View>
          </View>


          <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <View>
                <Text style={styles.buttonLabel}>Destino</Text>
              </View>
              {transfer.ENDERECODEDESTINO !== '' && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={colors['green-300']}
                />
              )}
            </View>
            <Pressable
              style={styles.button}
              onPress={() => setOpenDestinationScanner(true)}
            >
              <Text style={styles.buttonLabel}>
                {transfer.ENDERECODEDESTINO !== '' ?  transfer.ARMAZEMDEDESTINO + transfer.ENDERECODEDESTINO : 'Escanear'}
              </Text>
              <Icon
                name="barcode-outline"
                size={30}
                color={colors['gray-500']}
              />
            </Pressable>
          </View>


          {transfer.TEMSN &&
          <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <View>
                <Text style={styles.buttonLabel}>S/N</Text>
              </View>
              {transfer.SERIALNUMBER !== '' && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={colors['green-300']}
                />
              )}
            </View>
            <Pressable
              style={styles.button}
              onPress={() => setOpenSNScanner(true)}
            >
              <Text style={styles.buttonLabel}>
                {transfer.SERIALNUMBER !== '' ?  transfer.SERIALNUMBER : 'Escanear'}
              </Text>
              <Icon
                name="barcode-outline"
                size={30}
                color={colors['gray-500']}
              />
            </Pressable>
          </View>}


          {loading ? <ActivityIndicator color={colors['green-300']} /> : <Pressable
              style={styles.button}
              onPress={handleTransferenceConfirmation}
            >
              <Text>
                Confirmar Transferência
              </Text>
              <Icon
                name="arrow-forward"
                size={20}
                color={
                  !(transfer.CODIGO !== '' && transfer.DESCRICAO !== '')
                    ? colors['gray-300']
                    : colors['gray-500']
                }
              />
            </Pressable>}

            {transfer.PRODUTOS.length > 0 ?
            <ScrollView style={{ width: '100%', height: '100%' }}>
              {transfer.PRODUTOS.map((product, index) => ( 
            <View key={index} style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors['gray-200'] }}>
              <TouchableOpacity onPress={() => handleRemove(product)}>
                <Icon name="trash-bin" size={20} color={colors['red-500']} />
              </TouchableOpacity>
              <View style={{ padding: 2, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: colors['gray-100']}}>
                <Image source={{ uri: product.IMAGEM }} style={{ width: 32, height: 32 }} />
              </View>
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
                  <Icon name="barcode-outline" size={16} color={colors['gray-300']} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{product.ETIQUETA}</Text>
                </View>
                <Text style={{ fontSize: 12 }}>{product.PARTNUMBER} - {product.DESCRICAO.substring(0, 16)}...</Text>
              </View>
              <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 4, flexDirection: 'row', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 12 }}>{product.QUANTIDADE}</Text>
              </View>
            </View>
          ))
          }
          </ScrollView>
          : null }

        </View>}



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
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 56,
    gap: 32,
  },
  buttonLabel: {
    fontSize: 14,
    color: colors['gray-500'],
    fontWeight: '600',
  },
  container: {
    width: '100%',
    flex: 1,
    shadowColor: '#222',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 20,
  },
  content: {
    flex: 1,
    width: '100%',
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
