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
  Alert
} from 'react-native'
import { colors } from '../../../styles/colors'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { Camera, useCameraDevice } from 'react-native-vision-camera'

export default function Ibanez({ navigation }) {
  const [sequencial, setSequencial] = useState(1)
  const [openCameraReader, setOpenCameraReader] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [fotos, setFotos] = useState([])
  const { ambiente,refreshAuthentication, user } = useUser()
  const [loading, setLoading] = useState(true)
  const [loadingFoto, setLoadingFoto] = useState(false)
  const [pendentes, setPendentes] = useState(null)
  const [selectedPendente, setSelectedPendente] = useState(null)
  const [buscarPor, setBuscarPor] = useState('etiqueta')
  const [motivos, setMotivos] = useState(null)
  const [printed, setPrinted] = useState(true)
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [openCamera, setOpenCamera] = useState(false)

  const drawer = useRef(null);
  const cameraRef = useRef(null)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    if(!hasPermission) {
      getBarCodeScannerPermissions();
    }
  }, []);


  async function handleBarCodeScanned({ type, data }) {
    const inCamera = openCameraReader;
    if(loading) {
        return;
    }
    setSelectedPendente({BLOQVENDA: 'N',CONFORMIDADE: 'S', MOTIVO: []})
    setLoading(true);

    if(buscarPor === 'etiqueta' && data === inCamera.ETIQUETA) {
      // Trecho de consulta
      setSelectedPendente({...selectedPendente, ...inCamera})
      setTimeout(() => {
        setOpenCameraReader(null);
        if(inCamera.NUMSERIE === '') {
          setLoading(true);
          setBuscarPor('numserie')
          Alert.alert('Atenção!','Este produto ainda não possui número de série.\nPor favor, bipe a etiqueta do número de série do produto.',[
            {
              title: 'ok',
              onPress: () => setOpenCameraReader(inCamera)
            }
          ])
        }
      },200)
      setLoading(false);

    } else if(buscarPor === 'numserie') {
      setPrinted(false)
      setOpenCameraReader(null);
      setLoading(true);
      if(data === inCamera.ETIQUETA) {
        Alert.alert('Atenção!','A etiqueta bipada se refere à etiqueta do produto e não ao número de série.',[
          {
            title: 'ok',
            onPress: () => setOpenCameraReader(inCamera)
          }
        ])
      } else {
        axios.get(`/wIbanezEan?Produto=${selectedPendente.PRODUTO}&SN=${data}`)
        .then(({ data: retorno }) => {
          //console.log(data)
          setLoading(false)
          setOpenCameraReader(null)
          setSelectedPendente({...selectedPendente, NUMSERIE: data })
        })
      }
      setLoading(false);
    } else if(buscarPor === 'ean') {
      axios.get(`/wIbanezEan?EAN=${data}`)
      .then(({ data }) => {
        setLoading(false)
        setOpenCameraReader(null)
        setSelectedPendente({...selectedPendente, ...data})
        setLoading(true);
        setBuscarPor('numserie')
        Alert.alert('Atenção!','Este produto ainda não possui número de série.\nPor favor, bipe a etiqueta do número de série do produto.',[
          {
            title: 'ok',
            onPress: () => setOpenCameraReader({ ETIQUETA: 'S/N do produto' })
          }
        ])
      })
      .catch((error) => {
        setOpenCameraReader(null)
        if (error) {
          if(error.message?.includes('401')) {
            refreshAuthentication();
          } else {
            Alert.alert('Atenção', error.message)
          }
          setLoading(false)
        }
      })
    } else {
      setLoading(false);
    }
  };

  function handleMotivo(index) {
    const motivosSelecionados = [...selectedPendente.MOTIVO];
    const novoMotivoSelecionado = motivos[index].CHAVE.trim();
    if(motivosSelecionados.indexOf(novoMotivoSelecionado) > -1) {
      motivosSelecionados.splice(motivosSelecionados.indexOf(novoMotivoSelecionado), 1);
    } else {
      motivosSelecionados.push(novoMotivoSelecionado)
    }


    setSelectedPendente({...selectedPendente, MOTIVO: motivosSelecionados })
  }

  async function handleInspecao() {
    setLoading(true)
    if(!selectedPendente.OBSERVACOES && selectedPendente.CONFORMIDADE === 'N') {
      setLoading(false)
      Alert.alert("Atenção!","Obrigatório relatar os problemas encontrados.")
      return false
    }
    if(!selectedPendente.NUMSERIE) {
      setLoading(false)
      Alert.alert("Atenção!","Obrigatório bipar a etiqueta com número de série.",[
        {
          title: 'ok',
          onPress: () => {
            setBuscarPor('numserie');
            setOpenCameraReader(selectedPendente);
            return false
          }
        }
      ])
      return false
    }
    const body = {
      Produto: selectedPendente.PRODUTO,
      NumSerie: selectedPendente.NUMSERIE,
      Etiqueta: selectedPendente.ETIQUETA,
      Motivo: selectedPendente.MOTIVO && selectedPendente.MOTIVO.length > 0 ? selectedPendente.MOTIVO.join() : '',
      BloqVenda: selectedPendente.CONFORMIDADE === 'S' ? 'N' : selectedPendente.BLOQVENDA,
      Conformidade: selectedPendente.CONFORMIDADE,
      Observacoes: selectedPendente.OBSERVACOES
    }
    try {
      axios
        .post(`/wIbanez`, body)
        .then(({ data }) => {
          if(data.Status === 200) {
            setLoading(false)
            Alert.alert("Atenção!",data.Message)
            drawer.current.closeDrawer()
            setSelectedPendente(null)
          } else {
            Alert.alert("Atenção!",data.Message)
            setLoading(false)
          }
        }).catch((error) => {
          Alert.alert('Atenção!',error.message)
        })
    } catch(err) {
      Alert.alert("Atenção!",err.Message)
      //console.log(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    async function buscaPendentes() {
      await axios
      .get(`/wIbanez`)
      .then((response) => {
        setPendentes(response.data.RESULTADOS)
        setMotivos(response.data.MOTIVOS)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          if(error.message?.includes('401')) {
            refreshAuthentication();
          }
          setLoading(false)
        }
      })
    }
    buscaPendentes()
  }, [selectedPendente, user.refresh_token])

  const renderItem = ({item}) => {

    return (
      <Item
        item={item}
        onPress={() => {
          setBuscarPor('etiqueta')
          setOpenCameraReader(item)
        }}
      />
    );
  };

  function handlePrint() {
    Alert.alert('Atenção!','Deseja realmente imprimir a etiqueta de número de série?',[
      {
        text: 'Sim',
        isPreferred: true,
        onPress: async () => {
          //console.log('Imprimindo...')
          axios.get(`/wEtiqSN?produto=${selectedPendente.PRODUTO}&numserie=${selectedPendente.NUMSERIE}`)
          setPrinted(true)
        }
      },{
        text: 'Não',
        onPress: () => {
          return false
        }
      }
    ])
  }

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  function handleEAN() {
    setBuscarPor('ean')
    setOpenCameraReader({ ETIQUETA: 'EAN do produto' })
  }

  function handlePreviewPhoto(foto) {
    setPreviewPhoto(foto)
  }

  const navigationView = () => (
    <View style={[styles.container, styles.navigationContainer]}>
      { selectedPendente ?
      <ScrollView>
        <View style={{ backgroundColor: "#FFF", padding: 16 }}>
          { selectedPendente.PRODUTOOBJ && <Image source={{ uri: selectedPendente.PRODUTOOBJ.IMAGEMGRANDE.replace('_main','_detail1')}} style={{ width: 300, height: 300 }} />}
          <Pressable style={{ position: 'absolute', top: 25, left: 10, padding: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: "#efefef", borderRadius: 8 }} onPress={() => drawer.current.closeDrawer()}>
            <Icon name="chevron-back-outline" size={18} color="#868686" /><Text style={{ fontSize: 12, color: "#868686" }}>Cancelar</Text>
          </Pressable>
          <Pressable style={{ position: 'absolute', top: 25, right: 10, paddingVertical: 4, paddingHorizontal: 8, gap: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: "#222", borderRadius: 8 }} onPress={handlePrint}>
            <Icon name="print-outline" size={18} color="#fff" /><Text style={{ fontSize: 12, color: "#fff" }}>Etiq. Nº Série</Text>
          </Pressable>
          <View style={{ position: 'absolute', bottom: 25, right: 10, backgroundColor: "#FFF", padding: 4, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#efefef', borderRadius: 8 }}>
            <Icon name="barcode-outline" color="#111" size={18} />
            <Text style={{ textAlign: 'center', color: "#111", fontSize: 12 }}>{selectedPendente.ETIQUETA}</Text>
          </View>
        </View>

        <View style={{ paddingVertical: 8, backgroundColor: "#FFF", borderBottomWidth: 1 }}>
          <Text style={{ textAlign: 'center', color: "#111" }}>Revisão: <Text style={{ fontWeight: 'bold' }}>{selectedPendente.PROXIMAREVISAO}</Text> - Validade: <Text style={{ fontWeight: 'bold' }}>{selectedPendente.PROXIMAVIGENCIA}</Text></Text>
        </View>

        {buscarPor === 'numserie' && !selectedPendente.NUMSERIE ? <TouchableOpacity
          onPress={() => setOpenCameraReader(true)}
          style={{ padding: 16, backgroundColor: colors["gray-100"] }}>
            <Text style={{ textAlign: 'center', color: "#111", fontWeight: 'bold' }}>Ler Número de Série</Text>
        </TouchableOpacity>
        
        : <View style={{ paddingVertical: 8, backgroundColor: "#FFF", borderBottomWidth: 1 }}>
          <Text style={{ textAlign: 'center', color: "#111" }}>Nº Série: <Text style={{ fontWeight: 'bold' }}>{selectedPendente.NUMSERIE}</Text></Text>
        </View>
        }
        
        

        <View style={{ backgroundColor: "#efefef" }}>
          <Pressable onPress={() => setSelectedPendente({...selectedPendente, CONFORMIDADE: 'S' })} style={{ padding: 16, backgroundColor: selectedPendente.CONFORMIDADE === 'S' ? colors["green-300"] : colors["gray-50"], borderBottomWidth: 1, borderColor: "#ccc"  }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Em Conformidade</Text>
          </Pressable>
          <Pressable onPress={() => setSelectedPendente({...selectedPendente, CONFORMIDADE: 'N' })} style={{ padding: 16, backgroundColor: selectedPendente.CONFORMIDADE === 'N' ? colors["red-300"] : colors["gray-50"], borderBottomWidth: 1, borderColor: "#ccc" }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: selectedPendente.CONFORMIDADE === 'N' ? "#FFF" : "#111" }}>Apresentou Problemas</Text>
          </Pressable>

          <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 32 }}>
          { selectedPendente.CONFORMIDADE === 'N' && <Pressable onPress={() => setSelectedPendente({...selectedPendente, BLOQVENDA: selectedPendente.BLOQVENDA != 'S' ? 'S' : 'N' })} style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 24,height: 24, borderWidth: 1, borderColor: "#868686",flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              {selectedPendente.BLOQVENDA === 'S' && <Icon name="checkmark-outline" size={20} color="#f00" />}
            </View>
            <Text>O problema impossibilita a venda</Text>
          </Pressable>}

          { selectedPendente.CONFORMIDADE === 'N' && <Text style={{ marginTop: 32, fontSize: 18 }}>Motivos:</Text>}

          { selectedPendente.CONFORMIDADE === 'N' ? 
          motivos.map((motivo, index) => {
            return <TouchableOpacity key={index} onPress={() => handleMotivo(index)} style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 24,height: 24, borderWidth: 1, borderColor: "#868686",flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              {selectedPendente.MOTIVO?.includes(motivo.CHAVE.trim()) && <Icon name="checkmark-outline" size={20} color="#f00" />}
            </View>
            <Text>{motivo.CHAVE.trim()} - {motivo.DESCRICAO}</Text>
          </TouchableOpacity>
          })
          : null}
          </View>

          <Text style={{ marginLeft: 16, marginTop: 32, color: "#868686", fontWeight: 'bold'}}>Problemas:</Text>
          <TextInput onChangeText={Observacoes => setSelectedPendente({...selectedPendente, OBSERVACOES: Observacoes })} multiline={true} numberOfLines={3} style={{ padding: 16, borderWidth: 1, margin: 16, borderColor: "#ccc" }} />
        </View>
        
        

        { selectedPendente.CONFORMIDADE === 'N' && <View style={{ backgroundColor: "#efefef", height: 170 }}>
          <Text style={{ marginLeft: 16, marginTop: 32, color: "#868686", fontWeight: 'bold'}}>Fotos:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8, flex: 1 }}>
            {fotos.map((foto, index) => {
              return <TouchableOpacity onPress={() => handlePreviewPhoto(foto)} key={index} style={{ backgroundColor: "#000",width: 62, height: 82, borderWidth: 1 }}>
                <Image source={{ uri: foto }} style={{ width: 60, height: 80}} />
              </TouchableOpacity>
            })}
            </View>
            <TouchableOpacity
            onPress={() => setOpenCamera(true)}
            style={{ padding: 16, backgroundColor: colors["gray-500"], marginTop: 16 }}>
            <Text style={{ textAlign: 'center', color: "#fff", fontWeight: 'bold' }}>Adicionar Foto</Text>
          </TouchableOpacity>
        </View>}

        
        {buscarPor === 'numserie' && !printed && selectedPendente.NUMSERIE && <TouchableOpacity
          onPress={handlePrint}
          style={{ padding: 16, backgroundColor: colors["gray-100"] }}>
          <Text style={{ textAlign: 'center', color: "#111", fontWeight: 'bold' }}>Imprimir Etiqueta</Text>
        </TouchableOpacity>}
        {selectedPendente.NUMSERIE && printed && selectedPendente.CONFORMIDADE && <TouchableOpacity
          onPress={handleInspecao}
          style={{ padding: 16, backgroundColor: colors["gray-100"] }}>
          <Text style={{ textAlign: 'center', color: "#111", fontWeight: 'bold' }}>Finalizar Inspeção</Text>
        </TouchableOpacity>}
      </ScrollView>
      : null }
    </View>
  );

  useEffect(() => {
    if(selectedPendente) {
      drawer.current.openDrawer();
    }
  },[selectedPendente])

  const device = useCameraDevice('back')

  async function takePhoto() {
    setLoadingFoto(true)
    const photo = await cameraRef.current.takePhoto({
      qualityPrioritization: 'speed',
      flash: 'off',
    })
    const result = await fetch(`file://${photo.path}`)
    const data = await result.blob();

    var reader = new FileReader();
    reader.readAsDataURL(data); 
    reader.onloadend = function() {
      var base64data = reader.result.substr(reader.result.indexOf(',')+1);
      const revisao = selectedPendente.PROXIMAREVISAO || "01"
      const name = selectedPendente.PRODUTO+"_"+selectedPendente.NUMSERIE+"_REV"+revisao+"_"+sequencial.toString().padStart(2,"0")+".jpg";
      console.log({sequencial})
      try {
        axios
          .post(`/wInspecaoPhoto`, {name, base64data })
          .then(({ data }) => {
            if(data.Status === 200) {
              setFotos([...fotos, reader.result])
              setSequencial(sequencial + 1)
              setLoadingFoto(false)
              setPreviewPhoto(reader.result)
            } else {
              console.log(2)
              setLoadingFoto(false)
            }
          }).catch((error) => {
            console.log(error)
            setLoadingFoto(false)
          })
      } catch(err) {
        console.log(err.message)
        setLoadingFoto(false)
      }
    }

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
          drawerPosition={'right'}
          drawerType="front"
          drawerLockMode="locked-open"
          onDrawerClose={() => setSelectedPendente(null)}
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
                        <ScrollView>
                            <View style={{ width: '100%', paddingVertical: 12 }}>
                                <View style={{ width: '100%', height: RFPercentage(78), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <BarCodeScanner
                                    onBarCodeScanned={e => handleBarCodeScanned(e)}
                                    style={{ width: RFPercentage(45), height: RFPercentage(100) }}
                                    />

                                    <View style={{ position: 'absolute', bottom: 0, backgroundColor: "rgba(0,0,0,.3)", width: RFPercentage(45), flexDirection: 'row', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                                      <Icon name="barcode-outline" color="#FFF" size={28} />
                                      <Text style={{ color: "#fff", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>{openCameraReader.ETIQUETA}</Text></Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal> : null }

          {openCamera && !loading ?
            <Modal
            animationType="slide"
            transparent={true}
            visible={openCamera ? true : false}
            onRequestClose={() => {
                setOpenCamera(false);
                return false
            }}>
                  <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 10, flex: 1 }}>
                    <TouchableOpacity onPress={() => setOpenCamera(false)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
                        <Icon
                          name="chevron-back-outline"
                          size={30}
                          color={colors['gray-500']}
                        />
                        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Fotos dos problemas encontrados</Text>
                    </TouchableOpacity>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
                        <ScrollView>
                            <View style={{ width: '100%', paddingVertical: 12 }}>
                                <View style={{ width: '100%', height: RFPercentage(90), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                  <Camera device={device} isActive={true} photo={true} ref={cameraRef}
                                    style={{ width: RFPercentage(55), height: RFPercentage(100) }} />
                                  {!loadingFoto ?
                                    <TouchableOpacity onPress={() => takePhoto()} style={{ borderWidth: 1, borderColor: "#efefef", fontWeight: 'bold', backgroundColor: "#FFF", borderRadius: 50, width: 150, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, position: 'absolute', bottom: 50, left: 102 }}>
                                    <Text>Tirar foto</Text>
                                  </TouchableOpacity>
                                  :
                                  <View style={{ borderWidth: 1, borderColor: "#efefef", fontWeight: 'bold', backgroundColor: "#FFF", borderRadius: 50, width: 300, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, position: 'absolute', bottom: 50, left: 28 }}>
                                    <Text>Por favor aguarde, enviando imagem...</Text>
                                  </View>}
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal> : null }

          {previewPhoto &&
            <Modal
            animationType="slide"
            transparent={true}
            visible={previewPhoto ? true : false}
            onRequestClose={() => {
                setPreviewPhoto(null);
                return false
            }}>
                  <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 10, flex: 1 }}>
                    <TouchableOpacity onPress={() => setPreviewPhoto(null)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
                        <Icon
                          name="chevron-back-outline"
                          size={30}
                          color={colors['gray-500']}
                        />
                        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Preview da Foto</Text>
                    </TouchableOpacity>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
                        <ScrollView>
                            <View style={{ width: '100%', paddingVertical: 12 }}>
                                <View style={{ width: '100%', height: RFPercentage(90), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                  <Image source={{ uri: previewPhoto }} style={{ width: 400, height: 600 }} />
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>}


            <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 32, gap: 16 }}>
              { !loading && <TouchableOpacity onPress={handleEAN} style={{ backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'], borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <>
                  <Icon name='scan-outline' color="#FFF" size={28} />
                  <Text style={{ color: ambiente === 'producao' ? '#111' : '#fff', fontWeight: 'bold' }}>Inspecionar novo produto</Text>
                </>
              </TouchableOpacity>}
              {pendentes?.length > 0 && <FlatList data={pendentes}
                renderItem={renderItem}
                keyExtractor={item => item.ETIQUETA}
                extraData={selectedPendente} style={{ flex: 1, width: '100%' }} />}
              { loading && <View style={{ backgroundColor:"#FFF", borderRadius: 8, padding: 8, width: 200 }}>
                <Text style={{ textAlign: 'center' }}>Buscando...</Text>
              </View>}
              {pendentes?.length === 0 && !loading && <View style={{ backgroundColor:"#FFF", borderRadius: 8, padding: 8, width: 200 }}>
                <Text style={{ textAlign: 'center' }}>Não há produtos com inspeção perto da data de vencimento.</Text>
              </View>}
            </View>
          </View>
        </DrawerLayoutAndroid>
        
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

    <View style={{ padding: 8, backgroundColor: "#EFEFEF", flexDirection: 'row', justifyContent: 'justify-content', gap: 8, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', marginLeft: 16, justifyContent: 'flex-start', gap: 8, alignItems: 'center', flex: 1 }}>
        <Icon name="barcode-outline" color="#111" size={24} />
        <Text style={{ color: "#111", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.ETIQUETA}</Text></Text>
      </View>
      <Icon name="chevron-forward-outline" color="#111" size={24} />
    </View>
    <View style={{ paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      {item.PROXIMAREVISAO ? <View style={{ padding: 8, borderRadius: 8 }}>
        <Text style={{ color: "#111", fontSize: 14 }}>Última Revisão: <Text style={{ color: colors["green-300"], fontSize: 18, fontWeight: 'bold' }}>{item.REVISAO}</Text></Text>
      </View> : <View style={{ padding: 8, borderRadius: 8 }}>
        <Text style={{ color: "#111", fontSize: 14 }}>Produto ainda não inspecionado.</Text>
      </View>}
      {item.PROXIMAREVISAO && <View style={{ padding: 8, borderRadius: 8 }}>
        <Text style={{ color: "#111", fontSize: 14 }}>Validade. <Text style={{ color: colors["green-300"], fontSize: 18, fontWeight: 'bold' }}>{item.VIGENCIA}</Text></Text>
      </View>}
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
    alignItems: 'center',
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
