import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  Alert,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios'
import { API_URL } from '../../../../config'
import { useUser } from '../../../hooks/user'
import { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTransferencia } from '../../../hooks/transferencia'

export default function Transferencia({ navigation }) {
  const [openOriginScanner, setOpenOriginScanner] = useState(false)
  const [openProductScanner, setOpenProductScanner] = useState(false)
  const [openDestinationScanner, setOpenDestinationScanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quantidade, setQuantidade] = useState(1)

  const { user } = useUser()
  const {
    originAddress,
    setOriginAddress,
    product,
    setProduct,
    destinationAddress,
    setDestinationAddress,
  } = useTransferencia()
  
  const transferForm = Yup.object().shape({
      quantidade: Yup.string().required('Digite seu usuário.')
  })

  const { control,handleSubmit,formState: { errors } } = useForm({ values: { quantidade: 1 }, resolver: yupResolver(transferForm) });


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

        const product = {
          ARMAZEM: data.ARMAZEM,
          CODIGO: data.CODIGO,
          ENDERECO: data.ENDERECO,
          PRODUTOS: data.PRODUTOS[0],
          QTDE: data.QTDE,
        }

        setQuantidade(data.QTDE)
        setProduct(product)
        setOpenProductScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          console.log({ error })
          setOpenProductScanner(false)
          Alert.alert('Atenção!','Produto não encontrado')
          setLoading(false)
        }
      })
  }

  const onDestinationCodeScanned = (code) => {
    setLoading(true)
    console.log()
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

        console.log(data)
        setProduct({ ...product, ENDERECODESTINO: data.ENDERECO, ARMAZEMDESTINO: data.ARMAZEM })
        setOpenDestinationScanner(false)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          console.log(error)
          Alert.alert('Atenção!','Endereço de destino não encontrado')
          setLoading(false)
        }
      })
  }

  const handleTransferenceConfirmation = () => {
    const body = {
      produtos: product.CODIGO,
      armazem_origem: product.ARMAZEM,
      endereco_origem: product.ENDERECO,
      armazem_destino: product.ARMAZEMDESTINO,
      endereco_destino: product.ENDERECODESTINO,
    }
    axios
      .post(`${API_URL}/rest/wTransferir`, body, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      })
      .then((response) => {
        Alert.alert('Atenção!','Transferência realizada com sucesso.', [
          {
            text: 'Ok',
            onPress: () => {
              navigation.goBack()
            }
          }
        ])
      }).catch(err => {
        console.log({err})
      })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        {openProductScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onCodeProductScanned} />
        )}
        {openOriginScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onOriginCodeScanned} />
        )}
        {openDestinationScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onDestinationCodeScanned} />
        )}
        {!(
          openProductScanner ||
          openOriginScanner ||
          openDestinationScanner
        ) && (
          <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>

            { product.CODIGO ?
            <>


            <TouchableOpacity onPress={() => setOpenProductScanner(true)} style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
              <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Image source={{ uri: product.PRODUTOS.IMAGEM}} style={{ width: 50, height: 50 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ height: 50, flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Text style={[styles.title, {color: "#111", fontSize: 14 }]}>{product.PRODUTOS.DESCRICAO}</Text>
                    <Text style={[styles.title, {color: "#111", fontSize: 14 }]}><Text style={{ fontWeight: 'bold' }}>Código ME:</Text> {product.PRODUTOS.CODIGO}</Text>
                    <Text style={[styles.title, {color: "#111", fontSize: 14 }]}><Text style={{ fontWeight: 'bold' }}>Partnumber:</Text> {product.PRODUTOS.PARTNUMBER}</Text>
                  </View>
                </View>
              </View>
              {/* { console.log(product)} */}
              <View style={{ padding: 8, backgroundColor: "#EFEFEF", flexDirection: 'row', justifyContent: 'justify-content', gap: 8, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', marginLeft: 16, justifyContent: 'flex-start', gap: 8, alignItems: 'center', flex: 1 }}>
                  {product.PRODUTOS.ETIQUETA === '' ?
                  <>
                    <Text>NCM</Text>
                    <Text style={{ color: "#111", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 16, fontWeight: 'bold' }}>{product.PRODUTOS.NCM}</Text></Text>
                  </>
                  :
                  <>
                    <Text>Etiq.</Text>
                    <Text style={{ color: "#111", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 16, fontWeight: 'bold' }}>{product.PRODUTOS.ETIQUETA}</Text></Text>
                  </>
                  }
                </View>
                <Icon name="arrow-undo-circle-outline" color="#111" size={24} />
              </View>
          
            </TouchableOpacity>

            <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
              <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Quantidade na Etiqueta: </Text>
                <TextInput
                  editable={false}
                  keyboardType='numeric'
                  onChangeText={QTDE => setProduct({ ...product, QTDE })}
                  value={product.QTDE.toString()}
                  style={{padding: 10, flex: 1, textAlign: 'right', fontSize: 18, fontWeight: 'bold', color: colors['green-300']}}
                />
              </View>
            </View>

            <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
              <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Endereço Origem: </Text>
                <TextInput
                  editable={false}
                  keyboardType='default'
                  value={product.ARMAZEM + " " + product.ENDERECO}
                  style={{padding: 10, flex: 1, textAlign: 'right', fontSize: 18, fontWeight: 'bold', color: colors['green-300']}}
                />
              </View>
            </View>

            <TouchableOpacity onPress={() => setOpenDestinationScanner(true)} style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: product.ENDERECODESTINO ? colors["green-300"] : colors["red-300"], borderWidth: 1 }]}>
              <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Endereço Destino: </Text>
                {product.ENDERECODESTINO ? <TextInput
                  editable={false}
                  keyboardType='default'
                  value={product.ARMAZEMDESTINO + " " + product.ENDERECODESTINO}
                  style={{padding: 10, flex: 1, textAlign: 'right', fontSize: 18, fontWeight: 'bold', color: colors['green-300']}}
                />
                : <Icon
                name="md-barcode-outline"
                size={30}
                color={colors['gray-500']}
              />}
              </View>
            </TouchableOpacity>

            
            { product.CODIGO && product.ENDERECO && product.ENDERECODESTINO && 
              <Pressable
                style={styles.button}
                onPress={handleTransferenceConfirmation}
              >
                <Text style={styles.buttonLabel}>
                  Confirmar Transferência
                </Text>
                <Icon
                  name="md-arrow-forward"
                  size={20}
                  color={colors['gray-500']
                  }
                />
              </Pressable>
              }
              
            </>
            : 
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
                <Text style={styles.buttonLabel}>Etiqueta EAN / Lote</Text>

              </Pressable>

            </View>
            }
            
            
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
    paddingVertical: 16,
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
    borderRadius: 8,
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