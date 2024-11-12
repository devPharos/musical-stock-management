import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  TextInput,
  DrawerLayoutAndroid,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../../../styles/colors'
import { useEffect, useRef, useState } from 'react'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import PrinterButton from '../../../components/PrinterButton'
import { useUser } from '../../../hooks/user'
export default function DivisaoEtiquetas({ navigation, search = '' }) {

  const [ etiqueta, setEtiqueta ] = useState(null)
  const [openProductScanner, setOpenProductScanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const { selectedPrinter } = useUser()
  const drawer = useRef(null);

  function getProductData(find = '') {
    setLoading(true)
    axios
      .get(`/wBuscaEtiq?Etiqueta=${find}&Saldo=NAO`)
      .then(({ data }) => {
        setLoading(false)
        setEtiqueta(data)
      }).catch(err => {
        setLoading(false)
      })
  }
    
  function handleSubmit() {
    setLoading(true)
    if(!selectedPrinter) {
      Alert.alert('Atenção!','Selecione uma impressora.', [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return;
    }
    if(etiqueta.QTDEDIV === 0 && etiqueta.QTDE === 0) {
      Alert.alert('Atenção!','Quantidade da etiqueta a serem dividida não pode ser igual a zero.', [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return;
    }
      Alert.alert('Atenção!','Confirma a divisão da etiqueta?', [
        {
          text: 'Sim',
          onPress: () => {

          axios
          .post(`/wDividirEtiq`, {
            impressora: selectedPrinter.CODIGO,
            etiqueta: etiqueta.CODIGO,
            qtde: etiqueta.QTDE,
            qtdediv: etiqueta.QTDEDIV,
            manter: etiqueta.QTDE - etiqueta.QTDEDIV,
          })
          .then(({ data }) => {
            Alert.alert('Atenção!','Etiqueta dividida.', [
              {
                text: 'Ok',
                onPress: () => {
                  setLoading(false)
                }
              }
            ])
          }).catch(err => {
            Alert.alert('Atenção!','Não foi possível dividir a etiqueta.\n'+err.message, [
              {
                text: 'Ok',
                onPress: () => {
                  setLoading(false)
                }
              }
            ])
          })
        }}, {
          text: 'Cancelar',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
  }

  useEffect(() => {
    if(search) {
      getProductData(search);
    }
  },[search])

  const onCodeProductScanned = (code) => {
    setOpenProductScanner(false)
    getProductData(code)
  }

  const navigationView = () => {

  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        <DrawerLayoutAndroid
          ref={drawer}
          drawerWidth={300}
          drawerPosition='right'
          drawerLockMode="locked-closed"
          onDrawerClose={() => setEtiqueta(null)}
          renderNavigationView={navigationView}>
          <View style={styles.container}>
          {openProductScanner && (
            <Scanner handleCodeScanned={onCodeProductScanned} loading={loading} />
          )}

          {!openProductScanner && (
            <View style={styles.innerContent}>
              { loading ? 
              <View style={styles.inputContent}>
                <ActivityIndicator color={colors['green-300']} />
              </View>
              : 
              etiqueta ?
              <View style={[styles.inputContent]}>

                <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                  <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Quantidade na Etiqueta: </Text>
                    <TextInput
                      editable={false}
                      keyboardType='numeric'
                      value={etiqueta.QTDE.toString()}
                      style={{padding: 10, flex: 1, textAlign: 'right', fontSize: 16, fontWeight: 'bold', color: colors['gray-300']}}
                    />
                  </View>
                </View>

                <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                  <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Separar: </Text>
                    <TextInput
                      editable={true}
                      keyboardType='numeric'
                      onChangeText={QTDEDIV => setEtiqueta({ ...etiqueta, QTDEDIV })}
                      placeholder='0'
                      value={etiqueta.QTDEDIV ? etiqueta.QTDEDIV.toString() : ''}
                      style={{padding: 10, flex: 1, textAlign: 'right', fontSize: 26, fontWeight: 'bold', color: colors['green-300']}}
                    />
                  </View>
                </View>

                <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                  <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Manter: </Text>
                    <TextInput
                      editable={false}
                      keyboardType='numeric'
                      onChangeText={QTDEDIV => setEtiqueta({ ...etiqueta, QTDEDIV })}
                      value={etiqueta.QTDEDIV ? (etiqueta.QTDE - etiqueta.QTDEDIV).toString() : etiqueta.QTDE.toString()}
                      style={{padding: 10, flex: 1, textAlign: 'right', fontSize: 16, fontWeight: 'bold', color: colors['gray-300']}}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonLabel}>
                    Confirmar Divisão
                  </Text>
                  <Icon
                    name="arrow-forward"
                    size={20}
                    color={colors['gray-500']
                    }
                  />
                </TouchableOpacity>

              </View>
              :
              <View style={styles.inputContent}>
                <Pressable
                  style={styles.button}
                  onPress={() => setOpenProductScanner(true)}
                >
                  <Text style={styles.buttonProduct}>{'Escanear etiqueta'}</Text>
                  {etiqueta && etiqueta.PRODUTOS.length > 0 && etiqueta.PRODUTOS[0].CODIGO !== '' ? (
                    <Icon
                      name="checkmark-circle"
                      color={colors['green-300']}
                      size={20}
                    />
                  ) : (
                    <Icon
                      name="barcode-outline"
                      size={20}
                      color={colors['gray-500']}
                    />
                  )}
                </Pressable>
  
                <Text>Ou</Text>
  
                <View style={styles.productContainer}>
                  <View style={styles.formContainer}>
                    <View
                      style={ styles.inputContainer }
                    >
                      <Icon
                        color={
                          colors['gray-500']
                        }
                        name="search-outline"
                        size={20}
                      />
                      <TextInput
                        placeholder={'Digite o número da etiqueta'}
                        style={styles.input}
                        onEndEditing={(e) => getProductData(e.nativeEvent.text.toUpperCase())}
                      />
                    </View>
                  </View>
                </View>
              </View>
              }
  
              <PrinterButton navigation={navigation} />
            </View>
          )}
        </View>
        </DrawerLayoutAndroid>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  productContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  navigationContainer: {
    backgroundColor: '#ecf0f1',
  },
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors['gray-50'],
  },
  buttonProductDisabled: {
    fontWeight: '700',
    color: colors['gray-300'],
  },
  inputContent: {
    alignItems: 'center',
    gap: 16,
  },
  innerContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  buttonProduct: {
    fontSize: 16,
    color: colors['gray-500'],
    fontWeight: '600',
    padding: 8
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
  containerSecondary: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 0,
    marginVertical: 4,
    alignItems: 'flex-start',
    shadowColor: '#222',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 20,
  },
  productSecondary: {
    fontWeight: '400',
    color: colors['gray-500'],
    fontSize: 16,
  },
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
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  input: {
    flex: 1,
    width: '100%',
    color: colors['gray-500'],
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors['gray-200'],
  },
  formContainer: {
    width: '100%',
    gap: 4,
  },
})
