import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../../../styles/colors'
import { useEffect, useState } from 'react'
import Scanner from '../../../components/scanner'
import axios from 'axios'
export default function Separacao({ navigation, search = '' }) {
  const [ordens, setOrdens] = useState(null)
  const [ordem, setOrdem] = useState(null)
  const [find, setFind] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchEndereco, setSearchEndereco] = useState(false)
  const [searchItem, setSearchItem] = useState(false)
  const [separar, setSeparar] = useState([])

  useEffect(() => {
    async function getOrdensDeSeparacao() {
      const { data } = await axios.get(`/wSeparacao`)
      if(data.RESULTADOS) {
        setOrdens(data.RESULTADOS)
      }
    }
    getOrdensDeSeparacao()
  },[])

  function onFound(code) {
    setLoading(true)
    axios
        .get(`/wBuscaEtiq?Etiqueta=${code}`)
        .then(({ data }) => {
          setLoading(false)
          if(data.PRODUTOS.length > 0) {
            const etiqueta = data.PRODUTOS[0];
            if(etiqueta.CODIGO !== find.item.PRODUTO.CODIGO) {
              Alert.alert("Atenção!","Bipe a etiqueta do produto: "+etiqueta.DESCRICAO, [
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
          setLoading(false)
        })
  }

  function onFoundEndereco(code) {
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
      return
    } else {
      setFind({...find, searchEndereco: false, searchItem: true})
      setSearchEndereco(false)
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }

  function onQuantityChange(QTDE) {
    setFind({...find, QTDE})
  }

  function handleSeparar() {
    const body = {
      ordem: ordem.CODIGO,
      item: find.item.ITEM,
      produto: find.item.PRODUTO.CODIGO,
      armazem: find.armazem,
      endereco: find.endereco,
      quantidade: find.QTDE,
      pedido: ordem.PEDIDO,
      cliente: ordem.CLIENTE
    }
    console.log({ body })
    // axios
        // .post(`/wSeparacao`, body)
    //     .then(({ data }) => {
    //       setLoading(false)
    //     })
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

      {!find && <View style={styles.innerContent}>
        
        {!ordem && !ordens && <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <ActivityIndicator color={colors['green-300']} />
          <Text>Em desenvolvimento...</Text>
        </View>}

        {!ordem && ordens && ordens.length > 0 && <View
          style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, marginVertical: 24, borderRadius: 8 }}>
            
            <View style={{ width: '100%', backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4, padding: 8 }}>
              <Text style={{ fontSize: 16, textAlign: 'center', color: '#FFF' }}>Ordens de separação pendentes:</Text>
            </View>
          <FlatList
          data={ordens}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setOrdem(item)} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center', gap: 8, backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 8,elevation: 2,shadowColor: '#222',shadowOffset: { width: -2, height: 4 },shadowOpacity: 0.2,shadowRadius: 3}}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ borderRadius: 10, width: 20, height: 20, backgroundColor: colors['green-300'] }}></View>
                <View style={{ flexDirection: 'column', flex: 1 }}>
                  <Text style={{ fontSize: 16 }}>{item.CODIGO}</Text>
                  <Text style={{ fontSize: 13 }}>{item.RAZAOSOCIAL}</Text>
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

        {ordem && <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, marginVertical: 24, borderRadius: 8 }}>
          <View style={{ backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
            <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Pedido: {ordem.CODIGO}</Text>
              <Text style={{ fontSize: 12,color: '#FFF', textAlign: 'center' }}>Cliente: {ordem.RAZAOSOCIAL.trim()}</Text>
            </View>
          </View>
          <FlatList
          data={ordem.ITENS}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setFind({armazem: item.ARMAZEM, endereco: item.ENDERECO, item, searchEndereco: true, searchItem: true })} key={item.ITEM} style={{ flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12, backgroundColor: "#FFF",elevation: 2,shadowColor: '#222',shadowOffset: { width: -2, height: 4 },shadowOpacity: 0.2,shadowRadius: 3, borderRadius: 8, overflow: 'hidden'}}>
            <View style={{ padding: 8, backgroundColor: '#ccc', width: '100%' }}><Text style={{ fontSize: 13, textAlign: 'center' }}>{item.PRODUTO.DESCRICAO}</Text></View>
            <View style={{ padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={{ uri: item.PRODUTO.IMAGEM }} style={{ width: 50, height: 50 }} />
                <View style={{ flexDirection: 'column', flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.ARMAZEM} - {item.ENDERECO}</Text>
                  <Text style={{ fontSize: 12 }}>Partnumber: <Text style={{ fontWeight: 'bold' }}>{item.PRODUTO.PARTNUMBER}</Text></Text>
                </View>

                {item.SALDO === 0 ? 
                <View style={{ backgroundColor: colors['green-300'], height: 42, width: 42, borderRadius: 21, paddingHorizontal: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name="checkmark" size={20} color={colors['black']} />
                </View>
                :
                <View style={{ height: 42, paddingHorizontal: 8, borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#efefef' }}>
                  <Text style={{ fontSize: 10 }}>Quant.</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.SALDO}</Text>
                </View>
                }
              </View>
            </View>
            </TouchableOpacity>
          )}
        />
        </View>}

      </View>}


      {!searchEndereco && !searchItem && find && find.item && <View style={{ width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, marginVertical: 24, borderRadius: 8, padding: 24 }}>
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
                keyboardType='numeric'
                onChangeText={QTDE => onQuantityChange(QTDE)}
                value={find && find.QTDE ? find.QTDE : 0}
                style={[styles.button,{ minWidth: 50, textAlign: 'center'}]}
              /> : 
              <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 4, borderRadius: 4, marginLeft: 4, paddingVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>OK</Text>
              </View>}
            </View>




          {!searchEndereco && !searchItem && find.QTDE == find.item.SALDO && <TouchableOpacity
              style={[styles.button,{ width: '100%', marginTop: 24 }]}
              onPress={handleSeparar}
            >
              <Text>
                Separar Item
              </Text>
              <Icon
                name="checkmark"
                size={20}
                color={colors['gray-500']}
              />
            </TouchableOpacity>}
          
          </View>}


          {separar.length > 0 && separar.map((product, index) => ( 
            <View key={index} style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors['gray-200'] }}>
              <TouchableOpacity onPress={() => handleRemove(product)}>
                <Icon name="trash-bin" size={20} color={colors['red-500']} />
              </TouchableOpacity>
              <View style={{ padding: 2, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: colors['gray-100']}}>
                <Image source={{ uri: product.IMAGEM }} style={{ width: 32, height: 32 }} />
              </View>
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
                  <Icon name="barcode-outline" size={16} color={colors['gray-300']} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{product.ETIQUETA}</Text>
                </View>
                <Text style={{ fontSize: 12 }}>{product.PARTNUMBER} - {product.DESCRICAO.substring(0, 16)}...</Text>
              </View>
              <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 4, flexDirection: 'row', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 12 }}>{product.QUANTIDADE}</Text>
              </View>
            </View>
          ))
          }
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
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 56,
    gap: 32,
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
