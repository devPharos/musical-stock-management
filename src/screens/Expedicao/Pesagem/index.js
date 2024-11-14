import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  View,
  TextInput,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../../../styles/colors'
import { useState } from 'react'
import axios from 'axios'
import { useUser } from '../../../hooks/user'
export default function Pesagem({ navigation }) {
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(false)
  const { refreshAuthentication } = useUser()

  async function getPedido(find) {
    setLoading(true)
    await axios
      .get(`/wPesagem?Pedido=${find}`)
      .then(({ data }) => {
        setLoading(false)
        setPedido(data)
      }).catch(err => {
        setLoading(false)
        if(err.message?.includes('401')) {
          refreshAuthentication();
          return;
        }
      })
    }

    async function handleAtualizaPeso() {

      async function sendPeso(print = 'N') {
        await axios.post('/wPesagem', { ...pedido, print: 'S' })
        .then(({ data }) => {
          if(data.Status === 200) {
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
          } else {
            Alert.alert('Atenção!',data.Message, [
              {
                text: 'Ok',
                onPress: () => {
                  setLoading(false)
                }
              },
            ])
            setLoading(false)
          }
        }).catch((err) => {
          setLoading(false)
          if(err.message?.includes('401')) {
            refreshAuthentication();
            return;
          }
          console.log(err)
          // Alert.alert('Atenção!',err.Message, [
          //   {
          //     text: 'Ok',
          //     onPress: () => {
          //       setLoading(false)
          //     }
          //   },
          // ])
        })
      }
      setLoading(true)
      Alert.alert('Atenção!','Deseja imprimir as etiquetas de pedido?', [
        {
          text: 'Sim',
          onPress: async () => {
            sendPeso('S')
          }
        },
        {
          text: 'Não',
          onPress: () => {
            sendPeso('N')
          }
        }
      ])
    }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >

        { loading ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator color={colors["green-300"]} />
          </View>
        :
          <ScrollView>
            <View style={styles.inputContent}>
            <View style={styles.productContainer}>
              <View style={styles.formContainer}>
                {!pedido ? <View
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
                    placeholder={'Pedido de Venda'}
                    style={styles.input}
                    keyboardType='numeric'
                    onEndEditing={(e) => getPedido(e.nativeEvent.text.toUpperCase())}
                  />
                </View>
                : 
                <View style={{ margin: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, borderRadius: 8 }}>
                  <View style={{ backgroundColor: "#111", flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 4 }}>
                    <View style={{ flexDirection: 'column', flex: 1, paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ fontSize: 14,color: '#FFF',textAlign: 'center' }}>Pedido: {pedido.PEDIDO}</Text>
                      <Text style={{ fontSize: 12,color: '#FFF', textAlign: 'center' }}>Cliente: {pedido.CLIENTE}</Text>
                    </View>
                  </View>
                  <View style={{ width: '100%', backgroundColor: '#efefef', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8 }}>
                    <Text style={{ fontWeight: 'bold' }}>Volume</Text>
                    <Text style={{ fontWeight: 'bold' }}>Peso</Text>
                  </View>
                  {pedido.VOLUMES.sort((a, b) => a.VOLUME - b.VOLUME).map((volume, index) => {
                    return <View key={index} style={{ width: '100%', backgroundColor: '#efefef', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 }}>
                      <Text style={{ fontWeight: 'bold' }}>{volume.VOLUME}</Text>
                      <TextInput
                        editable={true}
                        keyboardType='numeric'
                        onEndEditing={e => setPedido({...pedido, VOLUMES: pedido.VOLUMES.map((vol, index) => {
                          if(vol.VOLUME === volume.VOLUME) {
                            vol.PESO = e.nativeEvent.text.replace(',','.')
                          }
                          return vol
                        })})}
                        defaultValue={volume.PESO ? volume.PESO.toString() : ''}
                        style={[styles.button,{ minWidth: 50, textAlign: 'center'}]}
                      />
                    </View>
                  })}
                  <TouchableOpacity onPress={handleAtualizaPeso} style={{ width: '100%', backgroundColor: colors["green-300"], borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 }}>
                    <Text style={{ fontWeight: 'bold' }}>Salvar</Text>
                  </TouchableOpacity>
                </View>
                }
              </View>
            </View>
          </View>
          </ScrollView>
      }
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
    margin: 24,
  },
  formContainer: {
    width: '100%',
    gap: 4,
  },
})
