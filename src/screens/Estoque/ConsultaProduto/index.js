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
    TouchableOpacity,
    ActivityIndicator,
  } from 'react-native'
  import Icon from 'react-native-vector-icons/Ionicons'
  import { colors } from '../../../styles/colors'
  import { useRef, useState } from 'react'
  import Scanner from '../../../components/scanner'
  import axios from 'axios'
  import { API_URL } from '../../../../config'
  import { useUser } from '../../../hooks/user'
  export default function ConsultaProduto() {
  
    const { user } = useUser()
    const [ product, setProduct ] = useState(null)
    const [openProductScanner, setOpenProductScanner] = useState(false)
    const [loading, setLoading] = useState(false)
    const [find, setFind] = useState(null)
    const drawer = useRef(null);
  
    function getProductData() {
      setLoading(true)
  
      axios
        .get(`${API_URL}/rest/wBuscaProd`, {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
            Produto: find,
          },
        })
        .then((response) => {
          setLoading(false)
  
          const data = response.data
  
          if(data.PRODUTOS.length > 0) {
            setProduct(data)
            setOpenProductScanner(false)
            drawer.current.openDrawer()
          } else {
            setProduct(null)
          }
        }).catch(err => {
          console.log(err)
          setLoading(false)
        })
    }
  
    const onCodeProductScanned = (code) => {
      getProductData(code)
    }
  
    const navigationView = () => (
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: 16 }}>
        {product &&
        <>
          <ScrollView style={{ width: '100%' }}>
            
            <View style={{ flex: 1, position: 'relative' }}>
              <Image source={{ uri: product.PRODUTOS[0].IMAGEMGRANDE}} style={{ width: 284, height: 284 }} />
              <Pressable style={{ position: 'absolute', top: 25, left: 10, padding: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: "#efefef", borderRadius: 8 }} onPress={() => drawer.current.closeDrawer()}>
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
  
            { product.PRODUTOS[0].SALDOS.map((saldo, index) => {
              return (
              <View key={index} style={{ marginVertical: 12, borderStyle: 'dashed', borderTopWidth: 1, borderColor: "#ccc", paddingVertical: 12 }}>
                <Text style={{ textAlign: 'center', color: "#111", fontSize: 18 }}>Armazém: <Text style={{ fontWeight: 'bold' }}>{saldo.ARMAZEM}</Text></Text>
                <View>
                  <View style={{ padding: 4,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',backgroundColor: "#EFEFEF" }}>
                    <Text>Atual </Text><Text>{saldo.ATUAL}</Text>
                  </View>
                  <View style={{ padding: 4,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>A classificar </Text><Text>{saldo.CLASSIF}</Text>
                  </View>
                  <View style={{ padding: 4,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',backgroundColor: "#EFEFEF" }}>
                    <Text>Empenho </Text><Text>{saldo.EMPENHO}</Text>
                  </View>
                  <View style={{ padding: 4,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Pedidos </Text><Text>{saldo.PEDIDOS}</Text>
                  </View>
                  <View style={{ padding: 4,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',backgroundColor: "#EFEFEF" }}>
                    <Text>Em poder de terceiros </Text><Text>{saldo.QNPT}</Text>
                  </View>
                  <View style={{ padding: 4,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>Em nosso poder </Text><Text>{saldo.QTNP}</Text>
                  </View>
                  <View style={{ padding: 4,flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',backgroundColor: "#EFEFEF" }}>
                    <Text>Reservado </Text><Text>{saldo.RESERVA}</Text>
                  </View>
                </View>
              </View>
              )
            }) }
  
          </ScrollView>
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
                        name="md-barcode-outline"
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
                          onChangeText={setFind}
                          onEndEditing={getProductData}
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
  