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
import { CameraView, useCameraPermissions } from 'expo-camera'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { Camera, useCameraDevice } from 'react-native-vision-camera'
import ConsultaProduto from '../../Estoque/ConsultaProduto'
import Video from 'react-native-video'

export default function Ibanez({ navigation }) {
  const [sequencial, setSequencial] = useState(1)
  const [openCameraReader, setOpenCameraReader] = useState(null);
  const [fotos, setFotos] = useState([])
  const { ambiente, refreshAuthentication, user } = useUser()
  const [loading, setLoading] = useState(true)
  const [loadingFoto, setLoadingFoto] = useState(false)
  const [videoIsRecording, setVideoIsRecording] = useState(false)
  const [pendentes, setPendentes] = useState(null)
  const [selectedPendente, setSelectedPendente] = useState(null)
  const [buscarPor, setBuscarPor] = useState('etiqueta')
  const [motivos, setMotivos] = useState(null)
  const [printed, setPrinted] = useState(true)
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [openCamera, setOpenCamera] = useState(false)
  const [lantern, setLantern] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [consultarProduto, setConsultarProduto] = useState(null)
  const [camType, setCamType] = useState('photo');
  const [time, setTime] = useState(0)
  const armazensDestino = [{ val: '01', label: 'Vendas' }, { val: '26', label: 'Outlet' }, { val: '27', label: 'Cemitério' }, { val: '28', label: 'Aguardando Peça' }, { val: '29', label: 'Reparo Interno'}]

  const videoRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission()
    }
  }, [permission])

  const drawer = useRef(null);
  const cameraRef = useRef(null)


  async function handleBarCodeScanned({ type, data }) {
    const inCamera = openCameraReader;
    if (loading) {
      return;
    }
    const defaultSelectedPendente = { BLOQVENDA: 'N', CONFORMIDADE: 'S', MOTIVO: [], ESCALA: 1, ARMAZEMDEST: '01', PECASDESCRICOES: '', PECASPARTNUMBERS: '' }
    setLoading(true);

    if (buscarPor === 'etiqueta' && data.toUpperCase() === inCamera.ETIQUETA.toUpperCase()) {
      // Trecho de consulta
      setSelectedPendente({ ...defaultSelectedPendente, ...selectedPendente, ...inCamera })
      setTimeout(() => {
        setOpenCameraReader(null);
        if (inCamera.NUMSERIE === '') {
          setLoading(true);
          setBuscarPor('numserie')
          Alert.alert('Atenção!', 'Este produto ainda não possui número de série.\nPor favor, bipe a etiqueta do número de série do produto.', [
            {
              title: 'ok',
              onPress: () => setOpenCameraReader(inCamera)
            }
          ])
        }
      }, 200)
      setLoading(false);

    } else if (buscarPor === 'numserie') {
      setPrinted(false)
      setOpenCameraReader(null);
      if (data.toUpperCase() === inCamera.ETIQUETA.toUpperCase()) {
        Alert.alert('Atenção!', 'A etiqueta bipada se refere à etiqueta do produto e não ao número de série.', [
          {
            title: 'ok',
            onPress: () => setOpenCameraReader(inCamera)
          }
        ])
      // } else if (data !== inCamera.NUMSERIE) {
      //   Alert.alert('Atenção!', 'A etiqueta bipada não se refere ao número de série do produto selecionado.', [
      //     {
      //       title: 'ok',
      //       onPress: () => setOpenCameraReader(inCamera)
      //     }
      //   ])
      } else {
        axios.get(`/wIbanezEan?Produto=${inCamera.PRODUTO}&SN=${data.toUpperCase()}`)
          .then(({ data: retorno }) => {
            setLoading(false)
            setOpenCameraReader(null)
            setSelectedPendente({ ...defaultSelectedPendente, ...selectedPendente, ...inCamera, NUMSERIE: data.toUpperCase() })
          })
      }
      setLoading(false);
    } else if (buscarPor === 'ean') {
      axios.get(`/wIbanezEan?EAN=${data.toUpperCase()}`)
        .then(({ data }) => {
          setOpenCameraReader(null)
          setSelectedPendente({ ...defaultSelectedPendente, ...selectedPendente, ...data })
          setBuscarPor('numserie')
          Alert.alert('Atenção!', 'Este produto ainda não possui número de série.\nPor favor, bipe a etiqueta do número de série do produto.', [
            {
              title: 'ok',
              onPress: () => {
                setOpenCameraReader({ ETIQUETA: 'S/N do produto' });
                setLoading(false)
              }
            }
          ])
        })
        .catch((error) => {
          setOpenCameraReader(null)
          if (error) {
            if (error.message?.includes('401')) {
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
    // setLoading(false);
  };

  useEffect(() => {
    if(selectedPendente) {
      console.log(selectedPendente.ARMAZEMDEST)
    }
  },[selectedPendente])

  function handleMotivo(index) {
    const motivosSelecionados = [...selectedPendente.MOTIVO];
    const novoMotivoSelecionado = motivos[index].CHAVE.trim();
    if (motivosSelecionados.indexOf(novoMotivoSelecionado) > -1) {
      motivosSelecionados.splice(motivosSelecionados.indexOf(novoMotivoSelecionado), 1);
    } else {
      motivosSelecionados.push(novoMotivoSelecionado)
    }


    setSelectedPendente({ ...selectedPendente, MOTIVO: motivosSelecionados })
  }

  async function handleInspecao() {
    setLoading(true)
    if (selectedPendente.CONFORMIDADE === 'N') {
      if (!selectedPendente.MOTIVO.length) {
        setLoading(false)
        Alert.alert("Atenção!", "Obrigatório selecionar ao menos um motivo.")
        return false
      }
      if (!selectedPendente.OBSERVACOES) {
        setLoading(false)
        Alert.alert("Atenção!", "Obrigatório relatar os problemas encontrados.")
        return false
      }
      if (!fotos.length) {
        setLoading(false)
        Alert.alert("Atenção!", "Obrigatório fotografar o problema encontrado.")
        return false
      }
    }
    if (!selectedPendente.NUMSERIE) {
      setLoading(false)
      Alert.alert("Atenção!", "Obrigatório bipar a etiqueta com número de série.", [
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
      BloqVenda: selectedPendente.CONFORMIDADE === 'S' ? 'N' : (selectedPendente.BLOQVENDA || 'N'),
      Conformidade: selectedPendente.CONFORMIDADE,
      Observacoes: selectedPendente.OBSERVACOES,
      Escala: selectedPendente.ESCALA,
      ArmazemDest: selectedPendente.ARMAZEMDEST || '01',
      PecasDesc: selectedPendente.PECASDESCRICOES || '' ,
      PecasPN: selectedPendente.PECASPARTNUMBERS || ''
    }

    console.log(selectedPendente)

    setLoading(false)

    try {
      axios
        .post(`/wIbanez`, body)
        .then(({ data }) => {
          if (data.Status === 200) {
            setLoading(false)
            Alert.alert("Atenção!", data.Message)
            drawer.current.closeDrawer()
            setSelectedPendente(null)
          } else {
            Alert.alert("Atenção!", data.Message)
            setLoading(false)
          }
        }).catch((error) => {
          console.log(body, error)
          Alert.alert('Atenção!', error.message)
        })
    } catch (err) {
      Alert.alert("Atenção!", err.Message)
      setLoading(false)
    }
  }

  function handleBuscarItem(item) {
    setOpenCameraReader(item)
    setBuscarPor('numserie')
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
            if (error.message?.includes('401')) {
              refreshAuthentication();
            }
            setLoading(false)
          }
        })
    }
    buscaPendentes()
  }, [selectedPendente, user.refresh_token])

  const renderItem = ({ item }) => {
    return (
      <Item
        item={item}
        onPress={() => handleBuscarItem(item)}
      />
    );
  };

  function handlePrint() {
    Alert.alert('Atenção!', 'Deseja realmente imprimir a etiqueta de número de série?', [
      {
        text: 'Sim',
        isPreferred: true,
        onPress: async () => {
          axios.get(`/wEtiqSN?produto=${selectedPendente.PRODUTO}&numserie=${selectedPendente.NUMSERIE}`)
          setPrinted(true)
        }
      }, {
        text: 'Não',
        onPress: () => {
          return false
        }
      }
    ])
  }

  function handleEAN() {
    setBuscarPor('ean')
    setOpenCameraReader({ ETIQUETA: 'EAN do produto' })
  }

  function handlePreviewPhoto(foto) {
    if (foto.name.substr(-3) === 'mp4') {
      setCamType('video')
      setPreviewVideo(foto)
    } else {
      setCamType('photo')
      setPreviewPhoto(foto)
    }
  }

  const Item = ({ item, onPress }) => (
    <>
      <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor: "#fff", borderRadius: 8, margin: 16, borderColor: colors["green-300"], borderWidth: 1 }]}>
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Image source={{ uri: item.PRODUTOOBJ.IMAGEM }} style={{ width: 50, height: 50 }} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View style={{ height: 50, flexDirection: 'column', justifyContent: 'space-between' }}>
              <Text style={[styles.title, { color: "#111", fontSize: 14 }]}>{item.PRODUTOOBJ.DESCRICAO}</Text>
              <Text style={[styles.title, { color: "#111", fontSize: 14 }]}><Text style={{ fontWeight: 'bold' }}>Código ME:</Text> {item.PRODUTOOBJ.CODIGO}</Text>
              <Text style={[styles.title, { color: "#111", fontSize: 14 }]}><Text style={{ fontWeight: 'bold' }}>Partnumber:</Text> {item.PRODUTOOBJ.PARTNUMBER}</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 8, backgroundColor: "#EFEFEF", flexDirection: 'row', justifyContent: 'justify-content', gap: 8, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', marginLeft: 16, justifyContent: 'flex-start', gap: 8, alignItems: 'center', flex: 1 }}>
            <Icon name="barcode-outline" color="#111" size={24} />
            <Text style={{ color: "#111", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 14, fontWeight: 'bold' }}>{item.NUMSERIE}</Text></Text>
          </View>
          <Icon name="chevron-forward-outline" color="#111" size={24} />
        </View>
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          {item.PROXIMAREVISAO ? <View style={{ padding: 8, borderRadius: 8 }}>
            <Text style={{ color: "#111", fontSize: 14 }}>Última Revisão: <Text style={{ color: colors["green-300"], fontSize: 14, fontWeight: 'bold' }}>{item.REVISAO}</Text></Text>
          </View> : <View style={{ padding: 8, borderRadius: 8 }}>
            <Text style={{ color: "#111", fontSize: 14 }}>Produto ainda não inspecionado.</Text>
          </View>}
          {item.PROXIMAREVISAO && <View style={{ padding: 8, borderRadius: 8 }}>
            <Text style={{ color: "#111", fontSize: 14 }}>Validade: <Text style={{ color: colors["green-300"], fontSize: 14, fontWeight: 'bold' }}>{item.VIGENCIA}</Text></Text>
          </View>}
        </View>
        
        {item.ENDERECO.trim() && <View style={{ paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <View style={{ padding: 8, borderRadius: 8 }}>
            <Text style={{ color: "#111", fontSize: 14 }}>Armazém: <Text style={{ color: colors["green-300"], fontSize: 14, fontWeight: 'bold' }}>{item.ARMAZEM.trim()}</Text></Text>
          </View>
          <View style={{ padding: 8, borderRadius: 8 }}>
            <Text style={{ color: "#111", fontSize: 14 }}>Endereço: <Text style={{ color: colors["green-300"], fontSize: 14, fontWeight: 'bold' }}>{item.ENDERECO.trim()}</Text></Text>
          </View>
        </View>}

      </TouchableOpacity>
      <TouchableOpacity onPress={() => setConsultarProduto(item.PRODUTO)} style={[styles.item, { backgroundColor: colors["green-300"], borderRadius: 8, margin: 16, marginTop: 0, borderColor: '#222', borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12 }]}>
        <Icon name='search' color='#111' size={18} />
        <Text style={{ color: '#222' }}>
          Consultar Endereços</Text>
      </TouchableOpacity>
    </>
  );

  const navigationView = () => (
    <View style={[styles.container, styles.navigationContainer]}>
      {selectedPendente ?
        <ScrollView>
          <View style={{ backgroundColor: "#FFF", padding: 16 }}>
            {selectedPendente.PRODUTOOBJ && <Image source={{ uri: selectedPendente.PRODUTOOBJ.IMAGEMGRANDE.replace('_main', '_detail1') }} style={{ width: 300, height: 300 }} />}
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

          <View style={{ backgroundColor: "#efefef", paddingBottom: 16 }}>
            <Pressable onPress={() => setSelectedPendente({ ...selectedPendente, CONFORMIDADE: 'S' })} style={{ padding: 16, backgroundColor: selectedPendente.CONFORMIDADE === 'S' ? colors["green-300"] : colors["gray-50"], borderBottomWidth: 1, borderColor: "#ccc" }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Em Conformidade</Text>
            </Pressable>
            <Pressable onPress={() => setSelectedPendente({ ...selectedPendente, CONFORMIDADE: 'N' })} style={{ padding: 16, backgroundColor: selectedPendente.CONFORMIDADE === 'N' ? colors["red-300"] : colors["gray-50"], borderBottomWidth: 1, borderColor: "#ccc" }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: selectedPendente.CONFORMIDADE === 'N' ? "#FFF" : "#111" }}>Apresentou Problemas</Text>
            </Pressable>

            <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', paddingHorizontal: 16, maxWidth: '100%' }}>

            
              {selectedPendente.CONFORMIDADE === 'N' && 
              <>
              <Pressable onPress={() => setSelectedPendente({ ...selectedPendente, BLOQVENDA: selectedPendente.BLOQVENDA != 'S' ? 'S' : 'N' })} style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 24, height: 24, borderWidth: 1, borderColor: "#868686", borderRadius: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {selectedPendente.BLOQVENDA === 'S' && <Icon name="checkmark-outline" size={20} color="#f00" />}
                </View>
                <Text>O problema impossibilita a venda</Text>
              </Pressable>

              <Text style={{ marginTop: 32, color: "#868686", fontWeight: 'bold' }}>Escala do Problema:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 16, marginTop: 12 }}>
                {[1,2,3,4,5].map((val) => {
                  return <TouchableOpacity onPress={() => setSelectedPendente({ ...selectedPendente, ESCALA: val })} key={val} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, backgroundColor: selectedPendente.ESCALA >= val ? '#FFF' : 'transparent', borderColor: colors["gray-200"], borderRadius: 8, width: 36,height: 36 }}>
                  <Text style={{ color: selectedPendente.ESCALA >= val ? '#111' : colors["gray-200"] }}>{val}</Text>
                </TouchableOpacity>
                } )}
              </View>

              <Text style={{ marginTop: 32, color: "#868686", fontWeight: 'bold' }}>Motivos:</Text>

              { motivos.map((motivo, index) => {
                  return <TouchableOpacity key={index} onPress={() => handleMotivo(index)} style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 24, height: 24, borderWidth: 1, borderRadius: 4, borderColor: "#868686", flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      {selectedPendente.MOTIVO?.includes(motivo.CHAVE.trim()) && <Icon name="checkmark-outline" size={20} color="#f00" />}
                    </View>
                    <Text style={{ fontSize: 12 }}>{motivo.CHAVE.trim()} - {motivo.DESCRICAO}</Text>
                  </TouchableOpacity>
                })}

              </>}

              <Text style={{ marginTop: 32, color: "#868686", fontWeight: 'bold' }}>Problemas:</Text>
              <TextInput onChangeText={Observacoes => setSelectedPendente({ ...selectedPendente, OBSERVACOES: Observacoes })} multiline={true} numberOfLines={3} style={{ padding: 16, borderWidth: 1, borderRadius: 4, borderColor: "#ccc", width: '100%' }} />

              <View style={{ backgroundColor: "#efefef", width: '100%' }}>
                { fotos.length > 0 && (
                  <View style={{ backgroundColor: "#efefef", height: 170 }}>
                    <Text style={{ marginTop: 32, color: "#868686", fontWeight: 'bold' }}>Fotos:</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8, flex: 1 }}>
                      {fotos.map((foto, index) => {
                        return <TouchableOpacity onPress={() => handlePreviewPhoto(foto)} key={index} style={{ backgroundColor: "#000", width: 62, height: 82, borderWidth: 1, borderRadius: 4 }}>
                          <Image source={{ uri: foto.obj }} style={{ width: 60, height: 80 }} />
                        </TouchableOpacity>
                      })}
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setOpenCamera(true)}
                  style={{ padding: 16, backgroundColor: colors["gray-500"], marginTop: 16, width: '100%', borderRadius: 4 }}>
                  <Text style={{ textAlign: 'center', color: "#fff", fontWeight: 'bold' }}>Adicionar Foto / Vídeo</Text>
                </TouchableOpacity>
              </View>


              <Text style={{ marginTop: 32, color: "#868686", fontWeight: 'bold' }}>Armazém de Destino</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 16, marginTop: 12 }}>
                {armazensDestino.map(({ val, label }) => {
                  return <TouchableOpacity onPress={() => setSelectedPendente({ ...selectedPendente, ARMAZEMDEST: val })} key={val} style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderWidth: 1, backgroundColor: selectedPendente.ESCALA >= val ? '#FFF' : 'transparent', borderColor: colors["gray-200"], borderRadius: 8, paddingHorizontal: 8, height: 36 }}>
                  <Text style={{ color: selectedPendente.ARMAZEMDEST === val ? '#111' : colors["gray-200"] }}>{val}</Text>
                </TouchableOpacity>
                } )}

              </View>

              {armazensDestino.map((arm) => {
                  if(arm.val === selectedPendente.ARMAZEMDEST) {
                    return <Text style={{ fontSize: 16, fontWeight: '200', textAlign: 'center', width: '100%', marginTop: 16 }}>{arm.label}</Text>
                  }
              })}


              { selectedPendente.ARMAZEMDEST === '28' &&
              <>
              <Text style={{ marginTop: 32, color: "#868686", fontWeight: 'bold' }}>Peças - Descrições:</Text>
              <TextInput onChangeText={descricoes => setSelectedPendente({ ...selectedPendente, PECASDESCRICOES: descricoes })} multiline={true} numberOfLines={3} style={{ padding: 16, borderWidth: 1, borderRadius: 4, borderColor: "#ccc", width: '100%' }} />

              <Text style={{ marginTop: 32, color: "#868686", fontWeight: 'bold' }}>Peças - Partnumbers:</Text>
              <TextInput onChangeText={partnumbers => setSelectedPendente({ ...selectedPendente, PECASPARTNUMBERS: partnumbers })} multiline={true} numberOfLines={3} style={{ padding: 16, borderWidth: 1, borderRadius: 4, borderColor: "#ccc", width: '100%' }} />
              </>}
              



              {buscarPor === 'numserie' && !printed && selectedPendente.NUMSERIE && <TouchableOpacity
                onPress={handlePrint}
                style={{ padding: 16, marginTop: 16, backgroundColor: colors["gray-100"], width: '100%', borderRadius: 4 }}>
                <Text style={{ textAlign: 'center', color: "#111", fontWeight: 'bold' }}>Imprimir Etiqueta</Text>
              </TouchableOpacity>}
              
              {selectedPendente.NUMSERIE && printed && selectedPendente.CONFORMIDADE && <TouchableOpacity
                onPress={handleInspecao}
                style={{ padding: 16, backgroundColor: colors["gray-100"], borderRadius: 4 }}>
                <Text style={{ textAlign: 'center', color: "#111", fontWeight: 'bold' }}>Finalizar Inspeção</Text>
              </TouchableOpacity>}

            </View>

          </View>

        </ScrollView>
        : null}
    </View>
  );

  useEffect(() => {
    if (selectedPendente) {
      drawer.current.openDrawer();
    }
  }, [selectedPendente])

  const device = useCameraDevice('back')

  async function recordVideo() {
    function getTime(deadline) {
      const seconds = Date.parse(deadline) - Date.now();
      setTime(Math.floor((seconds / 1000) % 60) * -1);
    }
    if (!videoIsRecording) {
      setVideoIsRecording(true)
      const deadline = new Date()
      const interval = setInterval(() => getTime(deadline), 1000)
      await cameraRef.current.startRecording({
        quality: 50,
        videoBitRate: 'extra-low',
        videoCodec: 'h265',
        onRecordingFinished: async (video) => {
          clearInterval(interval);
          setTime(0)
          setLoadingFoto(true)
          const result = await fetch(`file://${video.path}`)
          const data = await result.blob();

          var reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onloadend = function () {
            var base64data = reader.result.substr(reader.result.indexOf(',') + 1);
            const revisao = selectedPendente.PROXIMAREVISAO || "01"
            const name = selectedPendente.PRODUTO + "_" + selectedPendente.NUMSERIE + "_REV" + revisao + "_" + sequencial.toString().padStart(2, "0") + ".mp4";
            try {
              axios
                .post(`/wInspecaoPhoto`, { name, base64data })
                .then(({ data }) => {
                  if (data.Status === 200) {
                    setFotos([...fotos, { name, obj: reader.result }])
                    setSequencial(sequencial + 1)
                    setLoadingFoto(false)
                    setPreviewVideo({ name, obj: reader.result })
                  } else {
                    setLoadingFoto(false)
                  }
                }).catch((error) => {
                  setLoadingFoto(false)
                })
            } catch (err) {
              setLoadingFoto(false)
            }
          }
        },
        onRecordingError: (error) => {
          clearInterval(interval);
          setTime(0)
          if (error.code === 'capture/recording-canceled') {
            setVideoIsRecording(false)
            Alert.alert('Atenção!', 'Gravação cancelada e vídeo descartado.');
          }
        }
      })
    } else {
      await cameraRef.current.stopRecording()
      setVideoIsRecording(false)
    }

  }

  async function takePhoto() {
    setLoadingFoto(true)
    const photo = await cameraRef.current.takeSnapshot({
      quality: 50,
      qualityPrioritization: 'speed',
      flash: 'off',
    })
    const result = await fetch(`file://${photo.path}`)
    const data = await result.blob();

    var reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = function () {
      var base64data = reader.result.substr(reader.result.indexOf(',') + 1);
      const revisao = selectedPendente.PROXIMAREVISAO || "01"
      const name = selectedPendente.PRODUTO + "_" + selectedPendente.NUMSERIE + "_REV" + revisao + "_" + sequencial.toString().padStart(2, "0") + ".jpg";
      try {
        axios
          .post(`/wInspecaoPhoto`, { name, base64data })
          .then(({ data }) => {
            if (data.Status === 200) {
              setFotos([...fotos, { name, obj: reader.result }])
              setSequencial(sequencial + 1)
              setLoadingFoto(false)
              setPreviewPhoto({ obj: reader.result })
            } else {
              setLoadingFoto(false)
            }
          }).catch((error) => {
            setLoadingFoto(false)
          })
      } catch (err) {
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
                  <TouchableOpacity onPress={() => setOpenCameraReader(null)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12 }}>
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
                          <CameraView
                            autofocus={true}
                            enableTorch={lantern}
                            // barcodeScannerSettings={{
                            //   barcodeTypes: ["ean13","ean8","qr"],
                            // }}
                            onBarcodeScanned={e => handleBarCodeScanned(e)}
                            style={{ width: RFPercentage(45), height: RFPercentage(100) }}
                          />

                          <View style={{ position: 'absolute', bottom: 0, backgroundColor: "rgba(0,0,0,.3)", width: RFPercentage(45), flexDirection: 'row', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                            <Icon name="barcode-outline" color="#FFF" size={28} />
                            <Text style={{ color: "#fff", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>{openCameraReader.ETIQUETA || openCameraReader.NUMSERIE}</Text></Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => setLantern(!lantern)} style={{ width: '100%', paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}><Icon name='flashlight' size={24} /></TouchableOpacity>
                      </View>
                    </ScrollView>
                  </KeyboardAvoidingView>
                </View>
              </Modal> : null}

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
                  <TouchableOpacity onPress={() => setOpenCamera(false)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12 }}>
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
                          <Camera photoQualityBalance="speed" video={camType === 'video'} device={device} isActive={true} photo={camType === 'photo'} ref={cameraRef}
                            style={{ width: RFPercentage(55), height: RFPercentage(100) }} />
                          {!loadingFoto ?
                            <>
                              {time > 0 && <View style={{ position: 'absolute', backgroundColor: "transparent", padding: 8, borderRadius: 4, bottom: 87, left: 80 }}>
                                <Text style={{ color: "#FFF" }}>{time.toString().padStart(2, "0")}s</Text>
                              </View>}
                              <TouchableOpacity onPress={() => camType === 'photo' ? takePhoto() : recordVideo()} style={{ borderWidth: 3, borderColor: "#fff", fontWeight: 'bold', backgroundColor: videoIsRecording || loadingFoto ? "#F00" : "transparent", borderRadius: 50, width: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, position: 'absolute', bottom: 80, left: 152 }}>

                              </TouchableOpacity>
                              {videoIsRecording && <TouchableOpacity onPress={() => cameraRef.current.cancelRecording()} style={{ position: 'absolute', backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: 'rgba(0,0,0,.4)', padding: 8, borderRadius: 4, bottom: 87, left: 220 }}>
                                <Text style={{ color: "#FFF" }}>Cancelar</Text>
                              </TouchableOpacity>}
                            </>
                            :
                            <View style={{ borderWidth: 1, borderColor: "#efefef", fontWeight: 'bold', backgroundColor: "#FFF", borderRadius: 50, width: 300, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, position: 'absolute', bottom: 50, left: 28 }}>
                              <Text>Por favor aguarde, enviando imagem...</Text>
                            </View>}
                          <View style={{ position: 'absolute', top: 20, width: '100%', left: 0, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                            <View>
                              <TouchableOpacity onPress={() => setCamType('photo')} style={{ borderWidth: 1, borderColor: "#efefef", fontWeight: 'bold', backgroundColor: camType === 'video' ? "transparent" : "#efefef", borderRadius: 50, width: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 30 }}>
                                <Icon
                                  name="camera"
                                  size={18}
                                  color={camType === 'photo' ? colors['gray-500'] : colors['white']}
                                />
                              </TouchableOpacity>
                              <Text style={{ fontSize: 12, color: camType === 'photo' ? '#FFF' : 'transparent', width: '100%', textAlign: 'center' }}>Foto</Text>
                            </View>
                            <View>
                              <TouchableOpacity onPress={() => setCamType('video')} style={{ borderWidth: 1, borderColor: "#efefef", fontWeight: 'bold', backgroundColor: camType === 'photo' ? "transparent" : "#FFF", borderRadius: 50, width: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 30 }}>
                                <Icon
                                  name="videocam"
                                  size={18}
                                  color={camType === 'video' ? colors['gray-500'] : colors['white']}
                                />
                              </TouchableOpacity>
                              <Text style={{ fontSize: 12, color: camType === 'video' ? '#FFF' : 'transparent', width: '100%', textAlign: 'center' }}>Vídeo</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </ScrollView>
                  </KeyboardAvoidingView>
                </View>
              </Modal> : null}

            {(previewPhoto || previewVideo) &&
              <Modal
                animationType="slide"
                transparent={true}
                visible={previewPhoto || previewVideo ? true : false}
                onRequestClose={() => {
                  setPreviewPhoto(null);
                  setPreviewVideo(null);
                  return false
                }}>
                <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 10, flex: 1 }}>
                  <TouchableOpacity onPress={() => { setPreviewPhoto(null); setPreviewVideo(null) }} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12 }}>
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
                          {camType === 'photo' && <Image source={{ uri: previewPhoto.obj }} style={{ width: 400, height: 600 }} />}
                          {camType === 'video' && previewVideo && <Video controls={true} ref={videoRef} source={{ uri: `https://b2b.musical-express.com.br/assets/images/Inspecoes Ibanez/${previewVideo.name}` }} style={{ width: 350, height: 600 }} />}
                        </View>
                      </View>
                    </ScrollView>
                  </KeyboardAvoidingView>
                </View>
              </Modal>}


            {consultarProduto &&
              <Modal
                animationType="slide"
                transparent={true}
                visible={consultarProduto ? true : false}
                onRequestClose={() => {
                  setConsultarProduto(null);
                  return false
                }}>
                <ConsultaProduto search={consultarProduto} setSearch={setConsultarProduto} />
              </Modal>}


            <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 24, gap: 8 }}>
              {!loading && <TouchableOpacity onPress={handleEAN} style={{ backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'], borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <>
                  <Icon name='scan-outline' color="#FFF" size={28} />
                  <Text style={{ color: ambiente === 'producao' ? '#111' : '#fff', fontWeight: 'bold' }}>Inspecionar novo produto</Text>
                </>
              </TouchableOpacity>}
              {pendentes?.length > 0 && <>
                <View style={{ borderTopWidth: 2, borderStyle: 'dashed', width: '100%', textAlign: 'center', paddingTop: 16, borderColor: 'rgba(0,0,0,.2)', marginTop: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                  <Icon name='alert-circle-outline' size={20} />
                  <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Pendentes de Reinspeção</Text>
                </View>
                <FlatList data={pendentes}
                  renderItem={renderItem}
                  keyExtractor={item => item.NUMSERIE}
                  extraData={selectedPendente} style={{ flex: 1, width: '100%' }} />
              </>}
              {loading && <View style={{ backgroundColor: "#FFF", borderRadius: 8, padding: 8, width: 200 }}>
                <Text style={{ textAlign: 'center' }}>Buscando...</Text>
              </View>}
              {pendentes?.length === 0 && !loading && <View style={{ backgroundColor: "#FFF", borderRadius: 8, padding: 8, width: 200 }}>
                <Text style={{ textAlign: 'center' }}>Não há produtos com inspeção perto da data de vencimento.</Text>
              </View>}
            </View>
          </View>
        </DrawerLayoutAndroid>

      </ImageBackground>
    </SafeAreaView>
  )
}

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
