import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../../../styles/colors'
import { useEffect, useRef, useState } from 'react'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import { useUser } from '../../../hooks/user'
import { Audio } from 'expo-av'
export default function Conferencia({ navigation }) {
  const [volume, setVolume] = useState(1)
  const [finished, setFinised] = useState(false)
  const [volumes, setVolumes] = useState([1])
  const [seeOtherVolumes, setSeeOtherVolumes] = useState(false)
  const [ordens, setOrdens] = useState(null)
  const [ordem, setOrdem] = useState(null)
  const [find, setFind] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchItem, setSearchItem] = useState(false)
  const [searchFila, setSearchFila] = useState(false)
  const [searchNumSerie, setSearchNumSerie] = useState(false)
  const [searchPeso, setSearchPeso] = useState(null)
  const { refreshAuthentication } = useUser()
  const [sound, setSound] = useState(null);
  const [seeList, setSeeList] = useState(false)
  const qtdRef = useRef(null)
  const filaRegex = /FC\d{4}$/

  function handleIniciar() {
    setLoading(true)
    axios.post(`/wConfProcesso`, { ordem: ordem.CODIGO, status: 'iniciar' })
    .then(({ data }) => {
      setLoading(false)
      if(data.Status === 200) {
        setOrdem({...ordem, STATUS: '3'})
        setSeeList(false)
        playSound();
        setLoading(false)
      }
    })
    .catch(err => {
      if(err.message?.includes('401')) {
        refreshAuthentication();
        setLoading(false)
        return;
      }
      console.log(err)
    })
  }

  useEffect(() => {
    async function getOrdensDeSeparacao() {
      setLoading(true)
      await axios.get(`/wConferencia`)
      .then(({ data }) => {
        if(data.RESULTADOS) {
          setOrdens(data.RESULTADOS)
          setLoading(false)
        }
      })
      .catch(err => {
        if(err.message?.includes('401')) {
          refreshAuthentication();
          setLoading(false)
          return;
        }
        console.log(err)
      })
    }
    getOrdensDeSeparacao()
  },[])

  function onFound(code) {
    setSearchItem(false)
    setLoading(true)
    const foundProduct = ordem.ITENS.find(prod => prod.PRODUTO.CODIGOBARRAS.trim() === code.trim() && prod.SALDO > 0);
    if(foundProduct) {
      setFind(foundProduct)
      if(foundProduct.SALDO === 0) {
        setLoading(false)
        setSearchItem(false)
        Alert.alert("Atenção!","Produto já totalmente conferido.", [
          {
            text: 'Ok',
            onPress: () => {
              setFind(null)
            }
          }
        ])
        return;
      }
      setLoading(false)
      if(foundProduct.PRODUTO.CONFSN === 'S') {
          Alert.alert("Atenção!","Por favor, leia a etiqueta de número de série do produto.", [
            {
              text: 'Ok',
              onPress: () => {
                setSearchNumSerie(true)
              }
            }
          ])
      }
      return;
    }
    axios
        .get(`/wBuscaEtiq2?Etiqueta=${code}&Saldo=NAO`)
        .then(({ data }) => {
          if(data.Status === 400) {
            Alert.alert("Atenção!", data.Message, [
              {
                text: 'Ok',
                onPress: () => {
                  setLoading(false)
                }
              }
            ]);
            return;
          }
          setLoading(false)
          if(data.PRODUTOS.length > 0) {
            const etiqueta = data.PRODUTOS[0];
            const foundProduct = ordem.ITENS.filter(prod => prod.PRODUTO.CODIGO === etiqueta.CODIGO)[0];
            setSearchItem(false)
            if(foundProduct && foundProduct.SALDO >= data.QTDE) {
              const newItens = ordem.ITENS.map(item => {
                if(item.PRODUTO.CODIGO.trim() === foundProduct.PRODUTO.CODIGO.trim() && item.SALDO >= data.QTDE) {
                  console.log(4)
                  item.SALDO -= data.QTDE
                  item.VOLUME = volume
                  if(!item.VOLUMES.find(vol => vol.volume === volume)) {
                    item.VOLUMES.push({volume: volume, quantidade: parseInt(data.QTDE).toString()})
                  } else {
                    item.VOLUMES.find(vol => vol.volume === volume).quantidade = (parseInt(item.VOLUMES.find(vol => vol.volume === volume).quantidade) + parseInt(data.QTDE)).toString()
                  }
                }
                return item;
              })
              confereProduto(foundProduct, data.QTDE.toString());
              setOrdem({...ordem, ITENS: newItens})
              
            } else {
              console.log(1)
              if(data.QTDE > item.SALDO) {
                console.log(2)
                Alert.alert("Atenção!","Quantidade informada maior que disponível para embalar.", [
                  {
                    text: 'Ok',
                    onPress: () => {
                      setLoading(false)
                    }
                  }
                ])
                return
              }
              console.log(3)
              Alert.alert("Atenção!","Produto já totalmente conferido.", [
                {
                  text: 'Ok',
                  onPress: () => {
                    setLoading(false)
                  }
                }
              ])
            }
          } else {
            setLoading(false)
          }
        }).catch(err => {
          console.log(4)
          if(err.message?.includes('401')) {
            refreshAuthentication();
            setLoading(false)
            return;
          } else {
            Alert.alert("Atenção!","Produto não localizado na conferência.", [
              {
                text: 'Ok',
                onPress: () => {
                  setLoading(false)
                }
              }
            ])
          }
        })
  }

  function onFoundFila(code) {
    // setLoading(true)
    setSearchFila(false)
    const foundFilas = ordem.FILAS.map((fila) => {
      if(fila[0] === code && fila[1] !== 'C') {
        fila[1] = 'C';
      }
      return fila
    })
    axios.post(`/wFila/${code}`, { ordem: ordem.CODIGO, fila: code })
    setOrdem({...ordem, FILAS: foundFilas })
  }

  async function onFoundNumSerie(code) {
    setLoading(true)
    setSearchNumSerie(false)
    await axios.get(`/wIbanezEan?Produto=${find.PRODUTO.CODIGO}&SN=${code}`)
          .then(({ data: retorno }) => {
            if(retorno && retorno.Message) {
              setFind({...find, SN: code})
              setTimeout(() => {
                onQuantityChange({...find, SN: code}, "1")
              },500)
            } else {
              Alert.alert("Atenção!","Número de série não localizado para este produto.")
              setFind(null)
            }
            setLoading(false)
          })
  }

  function handleOpenConf(item) {
    const newVolumes = [];
    const newItem = {...item, ITENS: item.ITENS.map((item) => {
      return {...item, VOLUMES: item.VOLUMES.map((volume, index) => {
        if(!newVolumes.find(vol => vol.volume === parseInt(volume.VOLUME.substring(6, 10)))) {
          newVolumes.push({ volume: parseInt(volume.VOLUME.substring(6, 10)), quantidade: volume.QUANTIDADE, peso: 0 })
        }
        return { volume: parseInt(volume.VOLUME.substring(6, 10)), quantidade: volume.QUANTIDADE, peso: 0 }
      })}
    })}
    
    setVolumes(newVolumes.length > 0 ? newVolumes : [{ volume: 1, quantidade: 0, peso: 0 }])
    setOrdem({...newItem, RESTAM: newItem.ITENS.filter(item => item.SALDO > 0).length})
    if(newVolumes.length === 0) {
      setSeeList(true)
    }
  }

  async function handleAddVolume() {
    setVolume(volumes.length + 1)
    setVolumes([...volumes, { volume: volumes.length + 1, quantidade: 0, peso: 0 }])
  }

  function handleRemoveVolume() {
    if(ordem.ITENS.find(item => item.VOLUME === volume)) {
      Alert.alert("Atenção!","Há produtos embalados neste volume.", [
        {
          text: 'Ok',
          onPress: () => {
            return
          }
        }
      ])
      return
    }
    if(volumes.length === 1) {
      Alert.alert("Atenção!","Não é possível remover o último volume.", [
        {
          text: 'Ok',
          onPress: () => {
            return
          }
        }
      ])
      return
    }
    const newVolumes = volumes.filter((vol, volIndex) => volIndex+1 !== volume)
    setVolumes(newVolumes)
    setVolume(newVolumes.length)
  }

  function onQuantityChange(product, QTDE) {
    if(QTDE > 0) {
      if(QTDE > product.SALDO) {
        Alert.alert("Atenção!","Quantidade informada maior que disponível para embalar.", [
          {
            text: 'Ok',
            onPress: () => {
              return
            }
          }
        ])
        return
      }
      const newItens = ordem.ITENS.map(item => {
        if(item.PRODUTO.CODIGO.trim() === product.PRODUTO.CODIGO.trim() && item.SALDO >= QTDE) {
          item.SALDO -= QTDE
          item.VOLUME = volume
          if(!item.VOLUMES.find(vol => vol.volume === volume)) {
            item.VOLUMES.push({volume: volume, quantidade: parseInt(QTDE).toString()})
          } else {
            item.VOLUMES.find(vol => vol.volume === volume).quantidade = (parseInt(item.VOLUMES.find(vol => vol.volume === volume).quantidade) + parseInt(QTDE)).toString()
          }
        }
        return item;
      })
      confereProduto(product, QTDE);
      setOrdem({...ordem, ITENS: newItens})
    }
  }

  async function confereProduto(product, QTDE) {
    setLoading(true)
    setFind(null)
    await axios.post(`/wConferencia`, { ordem: ordem.CODIGO, item: product.ITEM, produto: product.PRODUTO.CODIGO, quantidade: QTDE, volume, armazem: product.ARMAZEM, endereco: product.ENDERECO, SN: product.SN || '', volumes })
    .then(({ data }) => {
      if(data.Status === 201) {
        setLoading(false)
        setSeeList(false)
        playSound();
        setTimeout(() => {
          setSearchItem(true)
        }, 1000)
      } else if(data.Status === 200) {
        setLoading(false)
        setFind(null)
        playSound();
        Alert.alert("Atenção!",data.Message, [
          {
            text: 'Ok',
            onPress: () => {
              setOrdem({...ordem, STATUS: '4'})
              setLoading(false)
              setSeeOtherVolumes(true)
              setSeeList(false)
              setVolume(1)
            }
          }
        ])
      } else {
        Alert.alert('Atenção!',data.Message, [
          {
            text: 'Ok',
            onPress: () => {
              setLoading(false)
            }
          }
        ])
      }
    })
    .catch(err => {
      if(err.message?.includes('401')) {
        refreshAuthentication();
        setLoading(false)
        return;
      }
      console.log(err)
    })
  }

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync( require('../../../assets/ok.mp3')
    );
    setSound(sound);

    await sound.playAsync();
  }

  function handleSetVolume(vol) {
    setFind(null)
    setVolume(vol);
    setSeeList(false);
    if(volumes[vol - 1].peso) {
      Alert.alert('Atenção!','Deseja realmente limpar a pesagem deste volume?', [
        {
          text: 'Sim',
          onPress: () => {
            setSearchPeso(vol)
            return
          }
        }, {
          text: 'Não',
          onPress: () => {
            return
          }
        }
      ])
    }
  }

  function handleSearchPeso(volume) {
    setVolume(volume)
    setSearchPeso(volume)
  }

  function handleSeeList() {
    setSeeList(!seeList);
  }

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {

        if(ordem && ordem.STATUS >= '4' && !finished) {
          console.log(ordem.STATUS, finished)
          e.preventDefault();
          // Prevent default behavior of leaving the screen
          Alert.alert(
            'Cancelar pesagem?',
            'Você tem certeza que deseja sair sem realizar a pesagem do pedido?',
            [
              {
                text: 'Não sair',
                style: 'cancel',
                onPress: () => {
                  // Do nothing
                },
              },
              {
                text: 'Sair',
                style: 'destructive',
                // If the user confirmed, then we dispatch the action we blocked earlier
                // This will continue the action that had triggered the removal of the screen
                onPress: () => navigation.dispatch(e.data.action),
              },
            ],
            { cancelable: false }
          );
        }

      }),
    [navigation, ordem]
  );

  useEffect(() => {
    return sound ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  function onChangePeso(volume, peso) {
    setVolumes([...volumes.filter(vol => vol.volume !== volume), ...volumes.filter(vol => vol.volume === volume).map(vol => ({ volume: vol.volume, quantidade: vol.quantidade, peso }))])
    if(volume + 1 <= volumes.length) {
      setSearchPeso(null)
    } else {
      setSearchPeso(null)
    }
  }

  async function handleSendPeso() {
    setLoading(true)
    Alert.alert('Atenção!','Deseja imprimir as etiquetas de pedido?', [
      {
        text: 'Sim',
        onPress: async () => {
          sendPeso('S')
        }
      }, {
        text: 'Não',
        onPress: () => {
          sendPeso('N')
        }
      }
    ])
    async function sendPeso(print = 'N') {
      try {
        const { data } = await axios.post('/wPesagem', { pedido: ordem.PEDIDO, ordem: ordem.CODIGO, volumes, print })
        if(data.Status === 200) {
          setLoading(false)
          setFinised(true)
          setOrdem({...ordem, STATUS: '4'})
          Alert.alert('Atenção!',data.Message, [
            {
              text: 'Ok',
              onPress: () => {
                setLoading(false)
                navigation.goBack();
              }
            }
          ])
          return
        }
        setLoading(false)
      } catch(err) {
        if(err.message?.includes('401')) {
          refreshAuthentication();
          setLoading(false)
          return;
        }
        console.log(err)
        setLoading(false)
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >

      {!ordens && <ActivityIndicator color={colors["green-300"]} />}

      {searchFila && (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <Scanner loading={loading} setLoading={setLoading} regex={filaRegex} handleCodeScanned={onFoundFila} handleClose={() => setSearchFila(false)} buscaPorTexto={false} />
        </View>
      )}

      {searchItem && (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Scanner loading={loading} setLoading={setLoading} over={true} handleCodeScanned={onFound} handleClose={() => setSearchItem(false)} />
          </View>
      )}

      {searchNumSerie && (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <Scanner loading={loading} setLoading={setLoading} over={true} handleCodeScanned={onFoundNumSerie} handleClose={() => setSearchNumSerie(false)} />
          </View>
      )}

      {!loading && !searchFila && !searchItem && !searchNumSerie && <ScrollView style={{ width: '100%'}}>
        <View style={styles.innerContent}>

        {!ordem && ordens && ordens.length > 0 && <View
          style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, marginVertical: 12, borderRadius: 8 }}>
            
            <View style={{ width: '100%', backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4, padding: 8 }}>
              <Text style={{ fontSize: 16, textAlign: 'center', color: '#FFF' }}>Embalagem pendente:</Text>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {ordens.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => handleOpenConf(item)} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center', gap: 8, backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 8,elevation: 2,shadowColor: '#222',shadowOffset: { width: -2, height: 4 },shadowOpacity: 0.2,shadowRadius: 3}}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ borderRadius: 10, width: 20, height: 20, backgroundColor: item.STATUS === '2' ? colors['red-300'] : colors['yellow-500'] }}></View>
                <View style={{ flexDirection: 'column', flex: 1 }}>
                  <Text style={{ fontSize: 16 }}>{item.PEDIDO} - <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{item.STATUS === '2' ? 'Não iniciado' : 'Conferência Iniciada'}</Text></Text>
                  <Text style={{ fontSize: 13 }}>{item.RAZAOSOCIAL}</Text>
                  {item.ITENS.find(item => item.PENDENTEINSPECAO === true) && <View style={{ borderWidth: 1, paddingVertical: 2, borderColor: colors['red-300'], borderRadius: 4 }}><Text style={{ textAlign: 'center', color: colors['red-300'] }}>Pendente de Inspeção Ibanez</Text></View>}
                </View>
              </View>
            </TouchableOpacity>)
          )}
          </View>
        </View>}

        {!ordem && ordens && ordens.length === 0 && <View style={styles.containerSecondary}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.productSecondary}>Não há ordem de separação pendente em sua zona.</Text>
          </View>
        </View>}

        {ordem && ordem.FILAS.find((fila) => fila[1] !== 'C') && !searchFila && <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, borderRadius: 8 }}>
          <View style={{ backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
            <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Pedido: {ordem.PEDIDO}</Text>
              <Text style={{ fontSize: 12,color: '#FFF', textAlign: 'center' }}>Cliente: {ordem.RAZAOSOCIAL.trim()}</Text>
            </View>
          </View>
          <View style={{ backgroundColor: ordem.STATUS === '0' ? colors['red-300'] : colors['green-300'], flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
            <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Colete as caixas e leia a etiq. das seguintes filas:</Text>
            </View>
            </View>
            {ordem.FILAS && ordem.FILAS.map((fila, index) =><View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }} key={index}>
              <View style={{ flexDirection: 'column', alignItems: 'flex-start', backgroundColor: colors['gray-500'], paddingHorizontal: 8, borderRadius: 4 }}>
                 <Text key={index} style={{ fontSize: 16, color: colors.white }}>{fila[0]}</Text>
              </View>
              {fila[1] === 'C' && <Icon name="checkmark-circle" size={20} color={colors['green-300']} />}
            </View>)}

            <View style={[styles.inputContent,{width: '100%', marginTop: 24, borderTopWidth: 1, borderColor: colors['gray-200'], paddingTop: 24 }]}>
                <View style={styles.textContainer}>
                  <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={styles.buttonLabel}>Fila de Conferência</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setSearchFila(true)}
                >
                  <Text style={styles.buttonLabel}>
                    Escanear
                  </Text>
                  <Icon
                    name="barcode-outline"
                    size={30}
                    color={colors['gray-500']}
                  />
                </TouchableOpacity>

              </View>

        </View>}
        
        {ordem && !ordem.FILAS.find((fila) => fila[1] !== 'C') && !searchFila && 
        <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, borderRadius: 8 }}>
            <View style={{ height: 48, backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
              <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Pedido: {ordem.PEDIDO}</Text>
                <Text style={{ fontSize: 12,color: '#FFF', textAlign: 'center' }}>Cliente: {ordem.RAZAOSOCIAL.trim()}</Text>
              </View>
            </View>

            {ordem.STATUS !== '4' && <View style={{ height: 32, backgroundColor: ordem.STATUS === '2' ? colors['red-300'] : colors['green-300'], flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
              <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Status: {ordem.STATUS === '2' ? 'Não iniciado' : 'Iniciado'} - {ordem.RESTAM} item(s) restante(s)</Text>
              </View>
            </View>}
            
            {volumes.length > 0 && <View style={{ backgroundColor: colors['gray-50'], flexDirection: 'column', alignItems: 'center', gap: 8, borderRadius: 4 }}>
                {find && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', paddingVertical: 8 }}>
                  <Image source={{ uri: find.PRODUTO.IMAGEM }} style={{ width: 50, height: 50 }} />
                  <View style={{ flexDirection: 'column', flex: 1 }}>
                  <Text style={{ fontSize: 12 }}>Volume: <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{volume.toString().padStart(2, '0')}</Text></Text>
                    <Text style={{ fontSize: 12 }}>Partnumber: <Text style={{ fontWeight: 'bold' }}>{find.PRODUTO.PARTNUMBER}</Text></Text>
                    <Text style={{ fontSize: 12 }}>Código ME: <Text style={{ fontWeight: 'bold' }}>{find.PRODUTO.CODIGO}</Text></Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: 70 }}>
                    <TextInput
                      editable={true}
                      ref={qtdRef}
                      keyboardType='numeric'
                      autoFocus={true}
                      onEndEditing={e => onQuantityChange(find, e.nativeEvent.text)}
                      value={find.CONFSN === 'S' ? 1 : 0}
                      style={[styles.button,{ minWidth: 50, textAlign: 'center'}]}
                    />
                  </View>
                </View>}
              {volumes.sort((a, b) => a.volume - b.volume).map((vol, index) => {
                if(seeOtherVolumes || volume === (index + 1)) {
                return <View key={index} style={{ width: '100%', flexDirection: 'column', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: volume === (index + 1) ? colors['green-300'] : colors['gray-100'], borderRadius: 4, padding: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity onPress={() => handleSetVolume(index + 1)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-50'], paddingHorizontal: 16, paddingVertical: 4, borderRadius: 8 }}>
                      <Icon name={volume === index + 1 ? 'albums-outline' : 'albums'} size={20} color={colors['gray-300']} />
                      <Text style={{ fontSize: 14, color: colors['gray-300'] }}>Volume: {(index + 1).toString().padStart(2, '0')}</Text>
                  </TouchableOpacity>
                  {ordem.STATUS === '2' && <TouchableOpacity onPress={() => handleIniciar()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-500'], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                      <Icon name={'play'} size={16} color='#FFF' />
                      <Text style={{ fontSize: 14, color: '#FFF' }}>Iniciar Conferência</Text>
                  </TouchableOpacity>}
                  {ordem.STATUS === '3' && volume === (index + 1 ) && <TouchableOpacity onPress={() => setSearchItem(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-500'], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                      <Icon name={'add-sharp'} size={20} color='#FFF' />
                      <Text style={{ fontSize: 14, color: '#FFF' }}>Produtos</Text>
                  </TouchableOpacity>}
                  {ordem.STATUS === '4' && searchPeso !== vol.volume && vol.peso != 0 &&
                    <>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: vol.peso < ordem.ITENS.filter(item => item.VOLUMES.length > 0).map(item => item.PRODUTO.PESO * item.VOLUMES.filter(vol2 => vol2.volume === vol.volume).map(vol3 => vol3.quantidade).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0).toFixed(2) ? colors["red-300"] : colors['green-300'] }}>
                        {vol.peso} Kg <Text style={{ fontSize: 16, color: colors['gray-200'] }}> / {ordem.ITENS.filter(item => item.VOLUMES.length > 0).map(item => item.PRODUTO.PESO * item.VOLUMES.filter(vol2 => vol2.volume === vol.volume).map(vol3 => vol3.quantidade).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0).toFixed(2)} Kg</Text></Text>
                    </>
                  }
                  {ordem.STATUS === '4' && 
                  <>
                  
                  {searchPeso === volume && vol.volume === volume ?
                    <TextInput
                      editable={true}
                      ref={qtdRef}
                      keyboardType='numeric'
                      autoFocus={true}
                      onEndEditing={e => onChangePeso(volume, e.nativeEvent.text.replace(',', '.'))}
                      // value={volumes[index].quantidade.toString()}
                      style={{ backgroundColor: '#FFF', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, flex: 1, textAlign: 'right', fontSize: 16, fontWeight: 'bold', color: colors['green-300']}}
                    />
                  :
                  !vol.peso && <TouchableOpacity onPress={() => handleSearchPeso(vol.volume)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-500'], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                        <Icon name={'add-sharp'} size={20} color='#FFF' />
                        <Text style={{ fontSize: 14, color: '#FFF' }}>Peso</Text>
                    </TouchableOpacity>
                  }
                  </>}
                  {index > 0 && ordem.STATUS < '4' && !ordem.ITENS.find(item => item.VOLUMES && item.VOLUMES.find(vol => vol.volume === volume)) && volume === (index + 1 ) && <TouchableOpacity onPress={() => handleRemoveVolume()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-500'], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                      <Icon name={'trash-bin'} size={16} color='#FFF' />
                  </TouchableOpacity>}
                </View>
              </View>}}
              )}
            </View>}

            {ordem.STATUS === '3' && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2, marginTop: 0, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 4 }}>
              {ordem.ITENS.find(item => item.SALDO > 0) && <TouchableOpacity onPress={() => handleAddVolume()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-500'], paddingHorizontal: 8, paddingVertical: 8, borderRadius: 4 }}>
                  <Icon name={'add-sharp'} size={14} color='#FFF' />
                  <Text style={{ fontSize: 12, color: '#FFF' }}>Volume</Text>
              </TouchableOpacity>}
              <TouchableOpacity onPress={() => setSeeOtherVolumes(!seeOtherVolumes)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-50'], borderWidth: 1, borderColor: seeOtherVolumes ? colors['green-300'] : colors['gray-100'], paddingHorizontal: 8, paddingVertical: 8, borderRadius: 4 }}>
                  <Icon name={seeOtherVolumes ? 'eye' : 'eye-off'} size={14} color='#111' />
                  <Text style={{ fontSize: 12, color: '#111' }}>Outros volumes</Text>
              </TouchableOpacity>
              {ordem.ITENS.find(item => item.SALDO > 0) ? <TouchableOpacity onPress={() => handleSeeList()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: colors['gray-50'], borderWidth: 1, borderColor: seeList ? colors['green-300'] : colors['gray-100'], paddingHorizontal: 8, paddingVertical: 8, borderRadius: 4 }}>
                  <Icon name={seeList ? 'eye' : 'eye-off'} size={14} color='#111' />
                  <Text style={{ fontSize: 12, color: '#111' }}>Pendentes</Text>
              </TouchableOpacity>
              :
              <TouchableOpacity onPress={() => setOrdem({...ordem, STATUS: '4' })} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 0, backgroundColor: colors['green-300'], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ fontSize: 14, color: '#111' }}>Realizar Pesagem</Text>
              <Icon name={'barcode'} size={20} color='#111' />
            </TouchableOpacity>}
            </View>}

            {ordem.STATUS === '4' && volumes.filter(vol => !vol.peso).length === 0 && 
              <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', gap: 8, borderRadius: 4 }}>
                {/* Finalizar pesagem */}
                <TouchableOpacity onPress={() => handleSendPeso()} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 0, backgroundColor: colors['green-300'], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Icon name={'checkmark-circle'} size={20} color='#111' />
                  <Text style={{ fontSize: 14, color: '#111' }}>Finalizar Pesagem</Text>
                </TouchableOpacity>
              </View>
            }


            {!loading && volume > 0 && !seeList? 
              <>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 2, backgroundColor: '#efefef', borderBottomWidth: 1, borderBottomColor: colors['gray-200'], borderRadius: 8, overflow: 'hidden', paddingVertical: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>Itens no volume {volume.toString().padStart(2, '0')}</Text>
              </View>
                {ordem.ITENS.filter(item => item.VOLUMES.length > 0).map((item, index) => {
                  return item.VOLUMES.map((vol, index) => {
                    if(vol.volume === volume) {
                      // console.log(item.PRODUTO.CODIGO,vol)
                      return <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, backgroundColor: '#efefef', borderBottomWidth: 1, borderBottomColor: colors['gray-200'], borderRadius: 8, overflow: 'hidden', paddingVertical: 8 }}>
                      <Image source={{ uri: item.PRODUTO.IMAGEM }} style={{ width: 30, height: 30, borderRadius: 2 }} />
                      <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={{ fontSize: 12 }}>Partnumber: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.PARTNUMBER}</Text></Text>
                        <Text style={{ fontSize: 12 }}>Código ME: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.CODIGO}</Text></Text>
                        <Text style={{ fontSize: 12 }}>Endereço: <Text style={{ fontWeight: 'bold' }}>{item.ARMAZEM+' '+item.ENDERECO}</Text></Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: 70 }}>
                      <Text style={{ fontSize: 12, width: '100%', textAlign: 'center' }}>{vol.quantidade} un.</Text>
                      </View>
                    </View>
                    }
                  })
                }
              )}</>
            :
            <>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, backgroundColor: '#efefef', borderBottomWidth: 1, borderBottomColor: colors['gray-200'], borderRadius: 8, overflow: 'hidden', paddingVertical: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>Produtos pendentes de conferência</Text>
              </View>
                {ordem.ITENS.filter(item => item.SALDO > 0).map((item, index) => <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, backgroundColor: '#efefef', borderBottomWidth: 1, borderBottomColor: colors['gray-200'], borderRadius: 8, overflow: 'hidden', paddingVertical: 8 }}>
                  <Image source={{ uri: item.PRODUTO.IMAGEM }} style={{ width: 30, height: 30, borderRadius: 2 }} />
                  <View style={{ flexDirection: 'column', flex: 1 }}>
                    <Text style={{ fontSize: 12 }}>Partnumber: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.PARTNUMBER}</Text></Text>
                    <Text style={{ fontSize: 12 }}>Código ME: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.CODIGO}</Text></Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: 70 }}>
                  <Text style={{ fontSize: 12, width: '100%', textAlign: 'center' }}>{item.SALDO} un.</Text>
                  </View>
                </View>)}
                </>
            }
        </View>}

      </View>
      </ScrollView>}

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
    paddingHorizontal: 12,
    paddingTop: 24,
    gap: 16,
    height: '100%',
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
    width: '100%'
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
