import {
    StyleSheet,
    SafeAreaView,
    Text,
    ImageBackground,
    View,
    FlatList,
    TouchableOpacity,
    DrawerLayoutAndroid,
    Image,
    Modal,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    TextInput,
    Pressable,
    Alert,
    TouchableWithoutFeedback,
    Keyboard
  } from 'react-native'
import { colors } from '../../../styles/colors'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { CameraView, useCameraPermissions } from 'expo-camera'
import PrinterButton from '../../../components/PrinterButton'
  
export default function LoteNumseq({ navigation }) {
  const [openCameraReader, setOpenCameraReader] = useState(null);
  const { ambiente } = useUser()
  const [loading, setLoading] = useState(false)
  const [selectedLote, setSelectedLote] = useState(null)
  const [buscarPor, setBuscarPor] = useState('lote')
  const [permission, requestPermission] = useCameraPermissions()

  useEffect(() => {
      if (permission && !permission.granted) {
        requestPermission()
      }
  }, [permission])

  const drawer = useRef(null);

  async function handleBarCodeScanned({ type, data }) {
    // const inCamera = openCameraReader;
    if(loading) {
        return;
    }
    if(data === '') {
      return;
    }
    setLoading(true);

    if(buscarPor === 'lote') {
      await axios.get(`/wBuscaEtiq?Etiqueta=${data}&Saldo=NAO`)
      .then((response) => {
          setSelectedLote({LOTE: response.data.CODIGO, ETIQUETA: response.data, NUMSERIES: []})
      })
      setOpenCameraReader(false)
      setLoading(false);
    } else if(buscarPor === 'numserie') {
      if(selectedLote.NUMSERIES.includes(data)) {
          setOpenCameraReader(false)
          Alert.alert(`Atenção!`,`Número de série ${data} já contida na listagem.`,[
              {
                  text: 'Ok',
                  onPress: () => {
                      setLoading(false);
                      return;
                  }
              }
          ])
      } else {
          const newSeries = [...selectedLote.NUMSERIES];
          newSeries.push(data);
          setSelectedLote({...selectedLote, NUMSERIES: newSeries})
          setOpenCameraReader(false)
          setLoading(false);
      }
    }
    setLoading(false);

  };

  function handleRemoveNumSerie(indexNumSerie) {
      const newSeries = [...selectedLote.NUMSERIES];
      newSeries.splice(indexNumSerie, 1);

      setSelectedLote({...selectedLote, NUMSERIES: newSeries})
  }

  function handleLote() {
    setBuscarPor('lote')
    setOpenCameraReader({ ETIQUETA: 'Etiqueta de Lote' })
  }

  async function handleFinish() {
      await axios.post(`/wLoteNumseq`,{...selectedLote, IMPRESSORA: selectedPrinter.CODIGO})
      .then(({ data }) => {
        if(data.Status === 200) {
          setLoading(false)
          Alert.alert("Atenção!",data.Message)
          drawer.current.closeDrawer()
          setSelectedLote(null)
        } else {
          Alert.alert("Atenção!",data.Message)
          setLoading(false)
        }
      }).catch((error) => {
        Alert.alert('Atenção!',error.message)
      })
  }

  const navigationView = () => (
    <View style={[styles.container, styles.navigationContainer]}>
      { selectedLote ?
      <ScrollView>
          { selectedLote.ETIQUETA && <Image source={{ uri: selectedLote.ETIQUETA.PRODUTOS[0].IMAGEMGRANDE}} style={{ width: 300, height: 300 }} />}
        <Pressable style={{ position: 'absolute', top: 25, left: 10, padding: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: "#efefef", borderRadius: 8 }} onPress={() => drawer.current.closeDrawer()}>
          <Icon name="chevron-back-outline" size={18} color="#868686" /><Text style={{ fontSize: 12, color: "#868686" }}>Cancelar</Text>
        </Pressable>
          <View style={{ backgroundColor: "#FFF", padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#efefef', borderRadius: 8 }}>
              <Icon name="cube-outline" color="#111" size={24} />
              <Text style={{ textAlign: 'center', color: "#111", fontSize: 16, marginLeft: 4 }}><Text style={{ fontWeight: 'bold'}}>Etiqueta de Lote:</Text> {selectedLote.LOTE}</Text>
          </View>
          <View style={{ backgroundColor: "#FFF", padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#efefef', borderRadius: 8 }}>
              <Text style={{ textAlign: 'center', color: "#111", fontSize: 14, marginLeft: 4, fontWeight: 'bold' }}>{selectedLote.ETIQUETA.PRODUTOS[0].DESCRICAO}</Text>
          </View>

          <View style={{ paddingVertical: 16, backgroundColor: "#FFF", borderBottomWidth: 1 }}>
              <Text style={{ textAlign: 'center', color: "#111" }}>Nº Séries vinculados: <Text style={{ fontWeight: 'bold' }}>{selectedLote.NUMSERIES.length}</Text></Text>
          </View>
          <TouchableOpacity onPress={() => {setBuscarPor('numserie'); setOpenCameraReader(true) }} style={{ backgroundColor: colors['green-300'], padding: 16, width: '80%', marginLeft: '10%', borderRadius: 16, marginVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Adicionar Número de Série</Text>
          </TouchableOpacity>
          {selectedLote.NUMSERIES && selectedLote.NUMSERIES.length > 0 && selectedLote.NUMSERIES.map((numserie,index) => {
              return <View key={index} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent:'center', backgroundColor: '#FFF', padding: 16, borderBottomWidth: 1, borderColor: '#ccc' }}>
                  <Icon name="barcode-outline" color="#111" size={24} />
                  <Text style={{ flex: 1 }}>{numserie}</Text>
                  <Icon onPress={() => handleRemoveNumSerie(index)} name="trash-bin-outline" color="#c00" size={18} />
              </View>
          })}
          {selectedLote.NUMSERIES && selectedLote.NUMSERIES.length > 0 && <TouchableOpacity onPress={handleFinish} style={{ backgroundColor: colors['green-300'], padding: 16, width: '80%', marginLeft: '10%', borderRadius: 16, marginVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{ fontWeight: 'bold' }}>Finalizar</Text>
          </TouchableOpacity>}
      </ScrollView>
      : null }
    </View>
  );

  useEffect(() => {
    if(selectedLote) {
      drawer.current.openDrawer();
    }
  },[selectedLote])

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >

        <DrawerLayoutAndroid
          ref={drawer}
          drawerWidth={300}
          drawerPosition={'right'}
          drawerType="front"
          drawerLockMode="locked-open"
          onDrawerClose={() => setSelectedLote(null)}
          renderNavigationView={navigationView}>
          <View style={styles.container}>
          {openCameraReader && !loading ?
            <Modal
            animationType="slide"
            transparent={true}
            visible={openCameraReader ? true : false}
            onRequestClose={() => {
                setOpenCameraReader(null);
                return false
            }}>
                  <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 10, flex: 1 }}>
                    <TouchableOpacity onPress={() => setOpenCameraReader(null)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
                        <Icon
                          name="chevron-back-outline"
                          size={30}
                          color={colors['gray-500']}
                        />
                        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Leitura da Etiqueta</Text>
                    </TouchableOpacity>
                      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView>
                            <View style={{ width: '100%', paddingVertical: 12 }}>
                                <View style={{ width: '100%', height: RFPercentage(78), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <CameraView
                                    onBarcodeScanned={e => handleBarCodeScanned(e)}
                                    style={{ width: RFPercentage(45), height: RFPercentage(100) }}
                                    />
                                        <>
                                      { buscarPor === 'numserie' && <TextInput style={{ position: 'absolute', top: 10, width: RFPercentage(45), backgroundColor: "#FFF", height: 48,fontSize: 18, borderWidth: 1, borderColor: "#ccc", textAlign: 'center' }} keyboardType='number-pad' onEndEditing={e => handleBarCodeScanned({ data: e.nativeEvent.text.toUpperCase()})} placeholder='Digite manualmente...' placeholderTextColor='#ccc' />}
                                      
                                      <View style={{ position: 'absolute', bottom: 0, backgroundColor: "rgba(0,0,0,.3)", width: RFPercentage(45), flexDirection: 'row', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                                        <Icon name="cube-outline" color="#FFF" size={28} />
                                        <Text style={{ color: "#fff", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>{openCameraReader.ETIQUETA}</Text></Text>
                                      </View>
                                      </>
                                </View>
                            </View>
                        </ScrollView>

                        </TouchableWithoutFeedback>
                      </KeyboardAvoidingView>
                </View>
            </Modal> : null }

            <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 32, gap: 16 }}>
              { !loading && <TouchableOpacity onPress={handleLote} style={{ backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'], borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <>
                  <Icon name='scan-outline' color="#FFF" size={28} />
                  <Text style={{ color: ambiente === 'producao' ? '#111' : '#fff', fontWeight: 'bold' }}>Agrupar números de série</Text>
                </>
              </TouchableOpacity>}

            </View>
          </View>
        </DrawerLayoutAndroid>
        


        <PrinterButton navigation={navigation} />
        
      </ImageBackground>
    </SafeAreaView>
  )
}

const Item = ({item, onPress}) => (
  <TouchableOpacity onPress={onPress} style={[styles.item,{ backgroundColor: "#fff", borderRadius: 8, margin: 16, borderColor: colors["green-300"], borderWidth: 1 }]}>
    <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Image source={{ uri: item.PRODUTOOBJ.IMAGEM}} style={{ width: 50, height: 50 }} />
      <View style={{ flex: 1 }}>
        <View style={{ height: 50, flexDirection: 'column', justifyContent: 'space-between' }}>
          <Text style={[styles.title, {color: "#111", fontSize: 14 }]}>{item.PRODUTOOBJ.DESCRICAO}</Text>
          <Text style={[styles.title, {color: "#111", fontSize: 14 }]}><Text style={{ fontWeight: 'bold' }}>Código ME:</Text> {item.PRODUTOOBJ.CODIGO}</Text>
          <Text style={[styles.title, {color: "#111", fontSize: 14 }]}><Text style={{ fontWeight: 'bold' }}>Partnumber:</Text> {item.PRODUTOOBJ.PARTNUMBER}</Text>
        </View>
      </View>
    </View>

  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    shadowColor: '#222',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center'
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
  navigationContainer: {
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    padding: 16,
    fontSize: 15,
    textAlign: 'center',
  },
})
  