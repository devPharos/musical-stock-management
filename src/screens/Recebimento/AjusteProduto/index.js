import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  TextInput,
  DrawerLayoutAndroid,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../../../styles/colors'
import { useEffect, useRef, useState } from 'react'
import Scanner from '../../../components/scanner'
import axios from 'axios'
export default function AjusteProduto({ navigation, search = '', setSearch = () => null }) {
  const [ ajuste, setAjuste ] = useState(null)
  const [ product, setProduct ] = useState(null)
  const [openProductScanner, setOpenProductScanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchBarcode, setSearchBarcode] = useState(false)
  const drawer = useRef(null);

  function getProductData(find) {
    if(!loading) {
    setLoading(true)
    axios
      .get(`/wBuscaProd2?Produto=${find}&Saldo=NAO`)
      .then(({ data }) => {
        setLoading(false)

        if(data.PRODUTOS.length > 0) {
          const { CODIGO, CODIGOBARRAS, PESO, ESPESSURA, LARGURA, COMPRIMENTO, QTDPOREMB } = data.PRODUTOS[0]
          setAjuste({ PRODUTO: CODIGO, CODIGOBARRAS: CODIGOBARRAS.trim(), PESO: PESO.toString(), ESPESSURA: ESPESSURA.toString(), LARGURA: LARGURA.toString(), COMPRIMENTO: COMPRIMENTO.toString(), qtdembalagem: QTDPOREMB.toString() })
          setProduct(data)
          setOpenProductScanner(false)
          drawer.current.openDrawer()
        } else {
          setProduct(null)
        }
      }).catch(err => {
        
        Alert.alert('Erro', 'Não foi possível obter os dados do produto, verifique o cadastro dele.',
          [
            {
              text: 'Ok',
              onPress: () => {
                setLoading(false);
                setOpenProductScanner(false)
              },
            },
          ],
        )
      })
    }
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

  async function handleSubmit() {
    setLoading(true)
    if(ajuste.CODIGOBARRAS === '') {
      Alert.alert('Atenção!','Digite o código de barras do produto.', [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return;
    }
    Alert.alert('Atenção!','Deseja realizar o ajuste?', [
      {
        text: 'Ok',
        onPress: () => {
          const { PRODUTO, CODIGOBARRAS, PESO, ESPESSURA, LARGURA, COMPRIMENTO, qtdembalagem } = ajuste
          axios.post(`/wAjusteProd`, { PRODUTO, CODIGOBARRAS, PESO: parseFloat(PESO.replace(',','.')), ESPESSURA: parseFloat(ESPESSURA.replace(',','.')), LARGURA: parseFloat(LARGURA.replace(',','.')), COMPRIMENTO: parseFloat(COMPRIMENTO.replace(',','.')), qtdembalagem: parseFloat(qtdembalagem.replace(',','.')) })
          .then(({ data }) => {
            setLoading(false)
            Alert.alert('Atenção!',data.Message, [
              {
                text: 'Ok',
                onPress: () => {
                  if(data.Status === 200) {
                    navigation.goBack()
                  }
                }
              },
            ])
          }).catch(err => {
            console.log(err)
            setLoading(false)
          })
        }
      },
      {
        text: 'Cancelar',
        onPress: () => {
          setLoading(false)
        }
      }
    ])
  }

  function onFoundBarcode(code) {
    setSearchBarcode(false)
    setLoading(false)
    setAjuste({...ajuste, CODIGOBARRAS: code})
  }

  const navigationView = () => (
    <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: 16 }}>
      {product &&
      <>

      {searchBarcode ? (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Scanner loading={loading} setLoading={setLoading} over={true} handleCodeScanned={onFoundBarcode} handleClose={() => setSearchBarcode(false)} />
          </View>
      ) : (
        <ScrollView style={{ width: '100%' }}>
          
          <View style={{ flex: 1, position: 'relative' }}>
            <Image source={{ uri: product.PRODUTOS[0].IMAGEMGRANDE}} style={{ width: 284, height: 284 }} />
            <Pressable style={{ position: 'absolute', top: 25, left: 10, padding: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: "#efefef", borderRadius: 8 }} onPress={() => search ? setSearch(null) : drawer.current.closeDrawer()}>
              <Icon name="chevron-back-outline" size={18} color="#868686" /><Text style={{ fontSize: 12, color: "#868686" }}>Voltar</Text>
            </Pressable>
            <View style={{ position: 'absolute', bottom: 25, left: 10, backgroundColor: "#FFF", padding: 4, gap: 4, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#efefef', borderRadius: 8 }}>
              <Icon name="information-circle-outline" color="#111" size={18} />
              <Text style={{ textAlign: 'center', color: "#111", fontSize: 12 }}>{product.PRODUTOS[0].PARTNUMBER}</Text>
            </View>
          </View>

          <View style={{ paddingVertical: 8, borderTopWidth: 1 }}>
            <Text style={{ textAlign: 'center', color: "#111", fontWeight: 'bold' }}>{product.PRODUTOS[0].DESCRICAO}</Text>
          </View>

          <View style={{ paddingVertical: 8, borderTopWidth: 1}}>
            <Text style={{ textAlign: 'center', color: "#111" }}>Código: <Text style={{ fontWeight: 'bold' }}>{product.PRODUTOS[0].CODIGO}</Text></Text>
            <Text style={{ textAlign: 'center', color: "#111" }}>NCM: <Text style={{ fontWeight: 'bold' }}>{product.PRODUTOS[0].NCM}</Text></Text>
          </View>

          <View style={{ flexDirection: 'column', gap: 16 }}>

            <View style={styles.formContainer}>
              <View
                style={ styles.inputContainer }
              >
                <Text>Código Barras:</Text>
                <TextInput
                  keyboardType='numeric'
                  placeholder={'Código Barras'}
                  value={ajuste.CODIGOBARRAS ? ajuste.CODIGOBARRAS : ''}
                  style={[styles.input,{ textAlign: 'right', paddingRight: 4, color: colors['green-300'], fontSize: 16 }]}
                  onChangeText={val => setAjuste({...ajuste, CODIGOBARRAS: val})}
                />
                <TouchableOpacity onPress={() => setSearchBarcode(true)}><Icon name="barcode" size={20} color={colors['green-300']} /></TouchableOpacity>
              </View>
            </View>

            <View style={styles.formContainer}>
              <View
                style={ styles.inputContainer }
              >
                <Text>Peso Líquido:</Text>
                <TextInput
                  keyboardType='numeric'
                  placeholder={'Peso Líquido'}
                  value={ajuste.PESO ? ajuste.PESO.toString() : ''}
                  style={[styles.input,{ textAlign: 'right', paddingRight: 16, color: colors['green-300'], fontSize: 16 }]}
                  onChangeText={val => setAjuste({...ajuste, PESO: val})}
                />
              </View>
            </View>

            <View style={styles.formContainer}>
              <View
                style={ styles.inputContainer }
              >
                <Text>Comprimento:</Text>
                <TextInput
                  keyboardType='numeric'
                  placeholder={'Comprimento'}
                  value={ajuste.COMPRIMENTO ? ajuste.COMPRIMENTO.toString() : ''}
                  style={[styles.input,{ textAlign: 'right', paddingRight: 16, color: colors['green-300'], fontSize: 16 }]}
                  onChangeText={val => setAjuste({...ajuste, COMPRIMENTO: val})}
                />
              </View>
            </View>

            <View style={styles.formContainer}>
              <View
                style={ styles.inputContainer }
              >
                <Text>Espessura:</Text>
                <TextInput
                  keyboardType='numeric'
                  placeholder={'Espessura'}
                  value={ajuste.ESPESSURA ? ajuste.ESPESSURA.toString() : ''}
                  style={[styles.input,{ textAlign: 'right', paddingRight: 16, color: colors['green-300'], fontSize: 16 }]}
                  onChangeText={val => setAjuste({...ajuste, ESPESSURA: val})}
                />
              </View>
            </View>

            <View style={styles.formContainer}>
              <View
                style={ styles.inputContainer }
              >
                <Text>Largura:</Text>
                <TextInput
                  keyboardType='numeric'
                  placeholder={'Largura'}
                  value={ajuste.LARGURA ? ajuste.LARGURA.toString() : ''}
                  style={[styles.input,{ textAlign: 'right', paddingRight: 16, color: colors['green-300'], fontSize: 16 }]}
                  onChangeText={val => setAjuste({...ajuste, LARGURA: val})}
                />
              </View>
            </View>

            <View style={styles.formContainer}>
              <View
                style={ styles.inputContainer }
              >
                <Text>Qtd. por Embalagem:</Text>
                <TextInput
                  keyboardType='numeric'
                  placeholder={'Qtd. por Embalagem'}
                  value={ajuste.qtdembalagem ? ajuste.qtdembalagem.toString() : ''}
                  style={[styles.input,{ textAlign: 'right', paddingRight: 16, color: colors['green-300'], fontSize: 16 }]}
                  onChangeText={val => setAjuste({...ajuste, qtdembalagem: val})}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonLabel}>
                Confirmar Ajuste
              </Text>
              <Icon
                name="arrow-forward"
                size={20}
                color={colors['gray-500']
                }
              />
            </TouchableOpacity>

          </View>

        </ScrollView>
      )}
      </>}
    </View>
  );

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
          onDrawerClose={() => setProduct(null)}
          renderNavigationView={navigationView}>
          <View style={styles.container}>
          {openProductScanner && (
            <Scanner handleCodeScanned={onCodeProductScanned} />
          )}

          {!openProductScanner && (
            <View style={styles.innerContent}>
              { loading ? 
              <View style={styles.inputContent}>
                <ActivityIndicator color={colors['green-300']} />
              </View>
              : 
              <View style={styles.inputContent}>
                <Pressable
                  style={styles.button}
                  onPress={() => setOpenProductScanner(true)}
                >
                  <Text style={styles.buttonProduct}>{'Escanear etiqueta'}</Text>
                  {product && product.PRODUTOS.length > 0 && product.PRODUTOS[0].CODIGO !== '' ? (
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
                        placeholder={'Código ME, PartNumber ou NCM'}
                        style={styles.input}
                        onEndEditing={(e) => getProductData(e.nativeEvent.text.toUpperCase())}
                      />
                    </View>
                  </View>
                </View>
              </View>
              }
  
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
