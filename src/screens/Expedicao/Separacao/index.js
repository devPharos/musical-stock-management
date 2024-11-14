import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Text,
  View,
  FlatList,
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
export default function Separacao({ navigation, search = '' }) {
  const [ordens, setOrdens] = useState(null)
  const [ordem, setOrdem] = useState(null)
  const [find, setFind] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchEndereco, setSearchEndereco] = useState(false)
  const [searchItem, setSearchItem] = useState(false)
  const [searchFila, setSearchFila] = useState(false)
  const qtdRef = useRef(null)
  const { refreshAuthentication } = useUser()
  const [seeSeparated, setSeeSeparated] = useState(false)
  const filaRegex = /FC\d{4}$/

  useEffect(() => {
    async function getOrdensDeSeparacao() {
      setLoading(true)
      await axios.get(`/wSeparacao`)
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
        setLoading(false)
      })
    }
    getOrdensDeSeparacao()
  },[])


  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {

        if(ordem) {
          // Prevent default behavior of leaving the screen
          e.preventDefault();
  
          // Prompt the user before leaving the screen
          Alert.alert(
            'Deseja realmente sair?',
            'Ao sair, a separação deste item será cancelada.',
            [
              { text: "Não sair", style: 'cancel', onPress: () => {} },
              {
                text: 'Sair',
                style: 'destructive',
                // If the user confirmed, then we dispatch the action we blocked earlier
                // This will continue the action that had triggered the removal of the screen
                onPress: () => navigation.dispatch(e.data.action),
              },
            ]
          );
        }
      }),
    [navigation]
  );

  useEffect(() => {
    if(ordem && ordem.ITENS.find(item => item.PENDENTEINSPECAO === true)) {
      setLoading(true)
      Alert.alert("Atenção!","Há instrumentos musicais pendentes de inspeção. Deseja continuar mesmo assim?", [
        {
          text: 'Sim',
          onPress: () => {
            setLoading(false)
          }
        }, {
          text: 'Não',
          onPress: () => {
            setLoading(false)
            setOrdem(null)
          }
        }
      ])
      setLoading(false)
    }
  },[ordem])

  function onFound(code) {
    setSearchItem(false)
    setLoading(true)
    if(code.trim() === find.item.PRODUTO.CODIGOBARRAS.trim()) {
      setFind({...find, searchItem: false})
      setSearchItem(false)
      setLoading(false)
      return
    }
    axios
        .get(`/wBuscaProd2?Produto=${code}&Saldo=NAO`)
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
            if(code !== find.item.PRODUTO.CODIGO) {
              Alert.alert("Atenção!","Bipe a etiqueta do produto: "+find.item.PRODUTO.DESCRICAO, [
                {
                  text: 'Ok',
                  onPress: () => {
                    setLoading(false)
                  }
                }
              ])
              return
            }
            setFind({...find, searchItem: false})
            setSearchItem(false)
          }
        }).catch(err => {
          if(err.message?.includes('401')) {
            refreshAuthentication();
            setLoading(false)
            return;
          }
        })
  }

  function onFoundEndereco(code) {
    setSearchEndereco(false)
    setLoading(true)
    if(find.armazem.trim() !== code.substring(0, 2) || find.endereco.trim() !== code.trim().substring(2)) {
      Alert.alert("Atenção!","Endereço incorreto. Por favor, vá até o endereço: "+find.armazem+find.endereco, [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      setLoading(false)
      return
    } else {
      setLoading(false)
      setFind({...find, searchEndereco: false, searchItem: true})
      setSearchEndereco(false)
    }
  }

  function onFoundFila(code) {
    setSearchFila(false)
    setLoading(true)
    if(ordem.FILAS) {
      setOrdem({...ordem, FILAS: [...ordem.FILAS.filter(fila => fila !== code), code]})
      setLoading(false)
    } else {
      setOrdem({...ordem, FILAS: [code]})
      setLoading(false)
    }
  }

  function onQuantityChange(QTDE) {
    setFind({...find, QTDE})
  }

  function handleSeparar() {
    setLoading(true)
    const body = {
      ordem: ordem.CODIGO,
      item: find.item.ITEM,
      produto: find.item.PRODUTO.CODIGO,
      armazem: find.armazem,
      endereco: find.endereco,
      quantidade: parseInt(find.QTDE),
      pedido: ordem.PEDIDO,
      filas: ordem.FILAS || []
    }

    axios
        .post(`/wSeparacao`, body)
        .then(({ data }) => {
          if(data.Status === 201) {
            let alterado = false;
            const newOrderItems = ordem.ITENS.map(item => {
              if(!alterado && item.PRODUTO.CODIGO === find.item.PRODUTO.CODIGO && item.ITEM === find.item.ITEM) {
                if(item.SALDO === parseInt(find.QTDE)) {
                  alterado = true;
                  item.SALDO = parseInt(item.SALDO) - parseInt(find.QTDE)
                }
              }
              return item;
            })

            setOrdem({...ordem, ITENS: newOrderItems, RESTAM: newOrderItems.filter(item => item.SALDO > 0).length})

            setFind(null)
            setSearchItem(false)
            setSearchEndereco(false)
            setTimeout(() => {
              setLoading(false)
            }, 1000)
          } else if(data.Status === 200) {
            Alert.alert("Atenção!",data.Message, [
              {
                text: 'Ok',
                onPress: () => {
                  let alterado = false;
                  const newOrderItems = ordem.ITENS.map(item => {
                    if(!alterado && item.PRODUTO.CODIGO === find.item.PRODUTO.CODIGO && item.ITEM === find.item.ITEM) {
                      if(item.SALDO === parseInt(find.QTDE)) {
                        item.SALDO = parseInt(item.SALDO) - parseInt(find.QTDE);
                        alterado = true;
                      }
                    }
                    return item;
                  })
      
                  setOrdem({...ordem, ITENS: newOrderItems, RESTAM: newOrderItems.filter(item => item.SALDO > 0).length})

                  setFind(null)
                  setSearchItem(false)
                  setSearchEndereco(false)
                  setLoading(false)
                }
              }
            ])
          } else {
            Alert.alert("Atenção!",data.Message, [
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
          Alert.alert("Atenção!",err.message, [
            {
              text: 'Ok',
              onPress: () => {
                setLoading(false)
              }
            }
          ]);
        })
  }

  function handleIniciar() {
    setLoading(true)
    axios.post(`/wSepProcesso`, { ordem: ordem.CODIGO, status: 'iniciar' })
    .then(({ data }) => {
      setLoading(false)
      Alert.alert('Atenção!',data.Message, [
        {
          text: 'Ok',
          onPress: () => {
            if(data.Status === 200) {
              setOrdem({...ordem, STATUS: '1'})
              setLoading(false)
            }
          }
        },
      ])
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

  function handleRemove(fila) {
    const newFilas = ordem.FILAS.filter(retFila => retFila !== fila)
    setOrdem({...ordem, FILAS: newFilas})
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >

      {searchEndereco && (
        <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onFoundEndereco} handleClose={() => setSearchEndereco(false)} />
      )}

      {searchItem && (
        <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onFound} handleClose={() => setSearchItem(false)} />
      )}

      {searchFila && (
        <Scanner loading={loading} setLoading={setLoading} regex={filaRegex} handleCodeScanned={onFoundFila} handleClose={() => setSearchFila(false)} buscaPorTexto={false} />
      )}

      {!ordens && <ActivityIndicator color={colors["green-300"]} />}

      {!find && <View style={styles.innerContent}>

        {!ordem && ordens && ordens.length > 0 && <View
          style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, marginVertical: 12, borderRadius: 8 }}>
            
            <View style={{ width: '100%', backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4, padding: 8 }}>
              <Text style={{ fontSize: 16, textAlign: 'center', color: '#FFF' }}>Ordens de separação pendentes:</Text>
            </View>
          <FlatList
          data={ordens}
          renderItem={({ item }, index) => (
            <TouchableOpacity key={index} onPress={() => setOrdem({...item, RESTAM: item.ITENS.filter(item => item.SALDO > 0).length})} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center', gap: 8, backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 8,elevation: 2,shadowColor: '#222',shadowOffset: { width: -2, height: 4 },shadowOpacity: 0.2,shadowRadius: 3}}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ borderRadius: 10, width: 20, height: 20, backgroundColor: item.STATUS === '0' ? colors['green-300'] : colors['red-300'] }}></View>
                <View style={{ flexDirection: 'column', flex: 1 }}>
                  <Text style={{ fontSize: 16 }}>{item.PEDIDO}</Text>
                  <Text style={{ fontSize: 13 }}>{item.RAZAOSOCIAL}</Text>
                  {item.ITENS.find(item => item.PENDENTEINSPECAO === true) && <View style={{ borderWidth: 1, paddingVertical: 2, borderColor: colors['red-300'], borderRadius: 4 }}><Text style={{ textAlign: 'center', color: colors['red-300'] }}>Pendente de Inspeção Ibanez</Text></View>}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        </View>}

        {!ordem && ordens && ordens.length === 0 && <View style={styles.containerSecondary}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.productSecondary}>Não há ordem de separação pendente em sua zona.</Text>
          </View>
        </View>}

        {ordem && <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, borderRadius: 8, paddingBottom: 168 }}>
          <View style={{ backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
            <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Pedido: {ordem.PEDIDO}</Text>
              <Text style={{ fontSize: 12,color: '#FFF', textAlign: 'center' }}>Cliente: {ordem.RAZAOSOCIAL.trim()}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: ordem.STATUS === '0' ? colors['red-300'] : colors['green-300'], flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
            <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Status: {ordem.STATUS === '0' ? 'Não iniciado' : 'Iniciado'} - {ordem.RESTAM} item(s) restante(s)</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => setSeeSeparated(!seeSeparated)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 0, backgroundColor: seeSeparated ? colors['gray-100'] : colors['gray-50'], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: seeSeparated ? colors['gray-500'] : colors['gray-300'] }}>{seeSeparated ? 'Ver itens sem separação' : 'Ver itens separados'}</Text>
            <Icon name={seeSeparated ? 'eye-off' : 'eye'} size={20} color={seeSeparated ? colors['gray-500'] : colors['gray-300']} />
          </TouchableOpacity>

          <FlatList
          data={seeSeparated ? ordem.ITENS : ordem.ITENS.filter(item => item.SALDO > 0)}
          style={{ width: '100%' }}
          renderItem={({ item }, index) => (
            <TouchableOpacity key={index} onPress={() => setFind({armazem: item.ARMAZEM, endereco: item.ENDERECO, item, searchEndereco: true, searchItem: true })} style={{ flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12, backgroundColor: "#FFF",elevation: 2,shadowColor: '#222',shadowOffset: { width: -2, height: 4 },shadowOpacity: 0.2,shadowRadius: 3, borderRadius: 8, overflow: 'hidden'}}>
            <View style={{ padding: 8, backgroundColor: '#ccc', width: '100%' }}><Text style={{ fontSize: 13, textAlign: 'center' }}>{item.PRODUTO.DESCRICAO}</Text></View>
            <View style={{ padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={{ uri: item.PRODUTO.IMAGEM }} style={{ width: 50, height: 50 }} />
                <View style={{ flexDirection: 'column', flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.ARMAZEM} - {item.ENDERECO}</Text>
                  <Text style={{ fontSize: 12 }}>Partnumber: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.PARTNUMBER}</Text></Text>
                  <Text style={{ fontSize: 12 }}>EAN: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.CODIGOBARRAS}</Text></Text>
                  <Text style={{ fontSize: 12 }}>Código ME: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.CODIGO}</Text></Text>
                </View>

                {item.SALDO === 0 ? <>
                  <View style={{ height: 42, paddingHorizontal: 8, borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#efefef' }}>
                    <Text style={{ fontSize: 10 }}>Quant.</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.QUANTIDADE}</Text>
                  </View>
                  <View style={{ backgroundColor: colors['green-300'], height: 28, width: 28, borderRadius: 21, paddingHorizontal: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="checkmark" size={14} color={colors['black']} />
                  </View>
                </>
                :
                <>
                <View style={{ height: 42, paddingHorizontal: 8, borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#efefef' }}>
                  <Text style={{ fontSize: 10 }}>Quant.</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.SALDO}</Text>
                </View>
                </>
                }
              </View>
            </View>
            {item.PENDENTEINSPECAO && <View style={{ borderWidth: 1, paddingVertical: 2, borderColor: colors['red-300'], borderRadius: 8, width: '100%' }}><Text style={{ textAlign: 'center', color: colors['red-300'] }}>Pendente de Inspeção Ibanez</Text></View>}
            </TouchableOpacity>
          )}
        />
        </View>}

      </View>}

      {!searchEndereco && !searchItem && !searchFila && find && ordem.STATUS === '0' && find.item && <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, marginVertical: 24, borderRadius: 8, padding: 24 }}>
        <TouchableOpacity onPress={() => setFind(null)} style={{ flexDirection: 'row', backgroundColor: colors['gray-100'], padding: 8, borderRadius: 8, width: '100%', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
          <Icon name="arrow-back" size={20} color={colors['gray-500']} />
          <Text style={{ fontSize: 16, color: colors['gray-500'] }}>Voltar</Text>
        </TouchableOpacity>

        <Text style={{ width: '100%', fontSize: 18, color: colors['gray-500'], fontWeight: 'bold', textAlign: 'center', marginTop: 24 }}>
          Atenção!
        </Text>
        <Text style={{ width: '100%', fontSize: 14, color: colors['gray-500'], textAlign: 'center', marginTop: 4 }}>
          Este pedido ainda não foi iniciado.
        </Text>

        <View style={[styles.inputContent,{width: '100%', marginTop: 24}]}>
          <TouchableOpacity
            style={[styles.button,{ width: '100%' }]}
            onPress={handleIniciar}
          >
            <Text style={styles.buttonLabel}>
              Iniciar Separação
            </Text>
            <Icon
              name="arrow-forward"
              size={20}
              color={colors['gray-500']
              }
            />
          </TouchableOpacity>
        </View>
        </View>}


      {!searchEndereco && !searchItem && !searchFila && find && ordem.STATUS === '1' && find.item && <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, marginVertical: 24, borderRadius: 8, padding: 24 }}>
          <TouchableOpacity onPress={() => setFind(null)} style={{ flexDirection: 'row', backgroundColor: colors['gray-100'], padding: 8, borderRadius: 8, width: '100%', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
            <Icon name="arrow-back" size={20} color={colors['gray-500']} />
            <Text style={{ fontSize: 16, color: colors['gray-500'] }}>Voltar</Text>
          </TouchableOpacity>
          <View style={[styles.inputContent,{width: '100%', marginTop: 24}]}>
            <View style={styles.textContainer}>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <Text style={styles.buttonLabel}>Endereço</Text>
              <Text style={{ fontSize: 14 }}>{find.armazem} - {find.endereco}</Text>
              </View>
            </View>
            {find.searchEndereco ? <TouchableOpacity
              style={styles.button}
              onPress={() => setSearchEndereco(true)}
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
            : <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 4, borderRadius: 4, marginLeft: 4, paddingVertical: 8, paddingHorizontal: 16 }}>
              <Text style={{ color: colors.white, fontWeight: '700' }}>OK</Text>
            </View>}
          </View>

          <View style={[styles.inputContent,{width: '100%', marginTop: 24}]}>
            <View style={styles.textContainer}>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                <Text style={styles.buttonLabel}>Quantidade</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: 170 }}>
                <Text style={{ fontSize: 14 }}>{find.item.SALDO} unidade(s)</Text>
              </View>
              </View>
            </View>
              {!find.QTDE || find.QTDE != find.item.SALDO ? <TextInput
                editable={true}
                ref={qtdRef}
                keyboardType='numeric'
                onChangeText={QTDE => onQuantityChange(QTDE)}
                value={find && find.QTDE ? find.QTDE : 0}
                style={[styles.button,{ minWidth: 50, textAlign: 'center'}]}
              /> : 
              <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 4, borderRadius: 4, marginLeft: 4, paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>OK</Text>
              </View>}
            </View>

          <View style={[styles.inputContent,{width: '100%', marginTop: 24}]}>
            <View style={styles.textContainer}>
              <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <Text style={styles.buttonLabel}>Produto</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: 170 }}>
                <Text style={{ fontSize: 14 }}>{find.item.PRODUTO.DESCRICAO}</Text>
              </View>
              </View>
            </View>
            {find.searchItem ? <TouchableOpacity
              style={styles.button}
              onPress={() => setSearchItem(true)}
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
            : <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 4, borderRadius: 4, marginLeft: 4, paddingVertical: 8, paddingHorizontal: 16 }}>
              <Text style={{ color: colors.white, fontWeight: '700' }}>OK</Text>
            </View>}
          </View>

          {ordem.RESTAM === 1 && 
          <ScrollView style={{ height: '100%', width: '100%' }}>
            <View style={[styles.inputContent,{width: '100%', marginTop: 24, borderTopWidth: 1, borderColor: colors['gray-200'], paddingTop: 24 }]}>
              <View style={styles.textContainer}>
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                  <Text style={styles.buttonLabel}>Filas de Conferência</Text>
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
            </ScrollView>}


              {ordem.FILAS && ordem.FILAS && ordem.FILAS.map((fila, index) =><View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors['gray-200'], width: '100%' }} key={index}>
                <TouchableOpacity onPress={() => handleRemove(fila)}>
                  <Icon name="trash-bin" size={20} color={colors['red-500']} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                   <Text key={index} style={{ fontSize: 14 }}>{fila}</Text>
                </View>
              </View>)}

          {!loading && !searchEndereco && !searchItem && !searchFila && 
            find.QTDE == find.item.SALDO && 
            !find.searchItem &&
            !find.searchEndereco &&
            (ordem.RESTAM === 1 && ordem.FILAS && ordem.FILAS.length > 0 || ordem.RESTAM > 1) && 
              <TouchableOpacity
                style={[styles.button,{ width: '100%', marginTop: 24 }]}
                onPress={handleSeparar}
              >
                <Text>
                  {ordem.RESTAM === 1 ? 'Concluir separação' : 'Separar Item'}
                </Text>
                <Icon
                  name="checkmark"
                  size={20}
                  color={colors['gray-500']}
                />
              </TouchableOpacity>
            }
          
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
    paddingBottom: 140,
    paddingHorizontal: 12,
    paddingTop: 24,
    gap: 16,
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
