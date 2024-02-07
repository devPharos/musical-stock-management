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
  Button,
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
import { API_URL } from '../../../../config'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { RFPercentage } from 'react-native-responsive-fontsize'

export default function Ibanez({ navigation }) {
  const [openCameraReader, setOpenCameraReader] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [pendentes, setPendentes] = useState(null)
  const [selectedPendente, setSelectedPendente] = useState(null)
  const [emConformidade,setEmConformidade] = useState(true)
  const [blockSale, setBlockSale] = useState(false)

  const [motivo, setMotivo] = useState(null)

  const drawer = useRef(null);
  const [drawerPosition, setDrawerPosition] = useState('right');

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);


  async function handleBarCodeScanned({ type, data }) {
    if(loading) {
        return;
    }
    setLoading(true);

    if(data === openCameraReader.NUMSERIE) {
      // Trecho de consulta
      setSelectedPendente(openCameraReader)
      setTimeout(() => {
        setOpenCameraReader(null);
      },200)
      setLoading(false);

    } else {
      setLoading(false);
    }
  };

  async function handleInspecao() {
    console.log({motivo,emConformidade})
    setLoading(true)
    if(!motivo && !emConformidade) {
      setLoading(false)
      Alert.alert("Atenção!","Obrigatório relatar os problemas encontrados.")
      return false
    }
    const body = {
      Produto: selectedPendente.PRODUTO,
      NumSerie: selectedPendente.NUMSERIE,
      Aprovado: emConformidade ? "S" : "N",
      Motivo: motivo,
      BloqVenda: blockSale ? "S" : "N"
    }
    try {
      axios
        .post(`${API_URL}/rest/wIbanez`, body, {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        })
        .then(({ data }) => {
          if(data.Status === 200) {
            setLoading(false)
            drawer.current.closeDrawer()
            setSelectedPendente(null)
          } else {
            Alert.alert("Atenção!",data.Message)
            setLoading(false)
          }
        })
    } catch(err) {
      console.log(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    axios
      .get(`${API_URL}/rest/wIbanez`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      })
      .then((response) => {
        setPendentes(response.data.RESULTADOS)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          console.warn(error)
          setLoading(false)
        }
      })
  }, [selectedPendente])

  const renderItem = ({item}) => {

    return (
      <Item
        item={item}
        onPress={() => setOpenCameraReader(item)}
      />
    );
  };

  const navigationView = () => (
    <View style={[styles.container, styles.navigationContainer]}>
      { selectedPendente ?
      <ScrollView>
        <View style={{ backgroundColor: "#FFF", padding: 16 }}>
          <Image source={{ uri: selectedPendente.PRODUTOOBJ.IMAGEMGRANDE}} style={{ width: 284, height: 284 }} />
          <Pressable style={{ position: 'absolute', top: 25, left: 10, padding: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: "#efefef", borderRadius: 8 }} onPress={() => drawer.current.closeDrawer()}>
            <Icon name="chevron-back-outline" size={18} color="#868686" /><Text style={{ fontSize: 12, color: "#868686" }}>Cancelar</Text>
          </Pressable>
          <View style={{ position: 'absolute', bottom: 25, right: 10, backgroundColor: "#FFF", padding: 4, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#efefef', borderRadius: 8 }}>
            <Icon name="barcode-outline" color="#111" size={18} />
            <Text style={{ textAlign: 'center', color: "#111", fontSize: 12 }}>{selectedPendente.NUMSERIE}</Text>
          </View>
        </View>

        <View style={{ paddingVertical: 8, backgroundColor: "#FFF", borderBottomWidth: 1 }}>
          <Text style={{ textAlign: 'center', color: "#111" }}>Revisão: <Text style={{ fontWeight: 'bold' }}>{selectedPendente.PROXIMAREVISAO}</Text> - Validade: <Text style={{ fontWeight: 'bold' }}>{selectedPendente.PROXIMAVIGENCIA}</Text></Text>
        </View>

        <View style={{ backgroundColor: "#efefef" }}>
          <Pressable onPress={() => setEmConformidade(true)} style={{ padding: 16, backgroundColor: emConformidade ? colors["green-300"] : colors["gray-50"], borderBottomWidth: 1, borderColor: "#ccc"  }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Em Conformidade</Text>
          </Pressable>
          <Pressable onPress={() => setEmConformidade(false)} style={{ padding: 16, backgroundColor: !emConformidade ? colors["red-300"] : colors["gray-50"], borderBottomWidth: 1, borderColor: "#ccc" }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: !emConformidade ? "#FFF" : "#111" }}>Apresentou Problemas</Text>
          </Pressable>

          { !emConformidade && <Pressable onPress={() => setBlockSale(!blockSale)} style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 24,height: 24, borderWidth: 1, borderColor: "#868686",flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              {blockSale && <Icon name="checkmark-outline" size={20} color="#f00" />}
            </View>
            <Text>O problema impossibilita a venda</Text>
          </Pressable>}

          <Text style={{ marginLeft: 16, marginTop: 32, color: "#868686", fontWeight: 'bold'}}>Problemas:</Text>
          <TextInput onChangeText={setMotivo} multiline={true} numberOfLines={3} style={{ padding: 16, borderWidth: 1, margin: 16, borderColor: "#ccc" }} />
        </View>

        <Pressable
          onPress={handleInspecao}
          style={{ padding: 16, backgroundColor: colors["gray-100"] }}>
          <Text style={{ textAlign: 'center', color: "#111", fontWeight: 'bold' }}>Finalizar Inspeção</Text>
        </Pressable>
      </ScrollView>
      : null }
    </View>
  );

  useEffect(() => {
    if(selectedPendente) {
      drawer.current.openDrawer();
    }
  },[selectedPendente])

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >

        <DrawerLayoutAndroid
          ref={drawer}
          drawerWidth={300}
          drawerPosition={drawerPosition}
          drawerLockMode="locked-closed"
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
                                      <Text style={{ color: "#fff", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 18, fontWeight: 'bold' }}>{openCameraReader.NUMSERIE}</Text></Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal> : null }
            { pendentes?.length > 0 ?
            <FlatList data={pendentes}
              renderItem={renderItem}
              keyExtractor={item => item.NUMSERIE}
              extraData={selectedPendente} style={{ flex: 1 }} />
              :
              <View style={{ backgroundColor:"#FFF", borderRadius: 8, padding: 8, width: 200 }}>
                <Text style={{ textAlign: 'center' }}>Não há produtos pendentes de inspeção no momento.</Text>
              </View>
              }
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
        <Text style={{ color: "#111", fontSize: 14, textAlign: 'center' }}><Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.NUMSERIE}</Text></Text>
      </View>
      <Icon name="chevron-forward-outline" color="#111" size={24} />
    </View>

    <View style={{ paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <View style={{ padding: 8, borderRadius: 8 }}>
        <Text style={{ color: "#111", fontSize: 14 }}>Última Revisão: <Text style={{ color: colors["green-300"], fontSize: 18, fontWeight: 'bold' }}>{item.REVISAO}</Text></Text>
      </View>
      <View style={{ padding: 8, borderRadius: 8 }}>
        <Text style={{ color: "#111", fontSize: 14 }}>Validade. <Text style={{ color: colors["green-300"], fontSize: 18, fontWeight: 'bold' }}>{item.VIGENCIA}</Text></Text>
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
