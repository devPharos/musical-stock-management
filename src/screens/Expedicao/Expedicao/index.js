import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user';

export default function FilaExpedicao({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [openVolumeScanner, setOpenVolumeScanner] = useState(false)
  const [openFilaScanner, setOpenFilaScanner] = useState(false)
  const { refreshAuthentication } = useUser()
  const [fila, setFila] = useState({ FILA: '', VOLUMES: [] })

  const onVolumeScanned = (code) => {
    setOpenVolumeScanner(false)
    const validRegex = /\d{10}$/
    if(!validRegex.test(code)) {
      console.log('erro', code)
      Alert.alert('Atenção!','Preencha o código de volume corretamente.', [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return;
    }
    if(fila.VOLUMES.find(vol => vol === code)) {
      Alert.alert('Atenção!','Este volume já está na relação abaixo.', [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return;
    }
    setFila({...fila, VOLUMES: [...fila.VOLUMES, code]})
    setTimeout(() => {
      setOpenVolumeScanner(true)
    }, 1000)
  }

  const onFilaScanned = (code) => {
    setOpenFilaScanner(false)
    const validRegex = /EX\d{4}$/
    if(!validRegex.test(code)) {
      Alert.alert('Atenção!','Preencha o código da fila corretamente.')
      return;
    }
    setFila({...fila, FILA: code})
  }

  function handleAlocarVolumes() {
    setLoading(true)
    Alert.alert("Atenção!",`Confirma alocar os volumes lidos na fila ${fila.FILA}?`, [
      {
        text: 'Sim',
        onPress: () => {
          axios.post(`/wFilaExpedicao`, fila)
          .then(({ data }) => {
            
            Alert.alert("Atenção!",data.Message, [
              {
                text: 'Ok',
                onPress: () => {
                  if(data.Status === 200) {
                    navigation.goBack()
                  }
                  setLoading(false)
                }
              }
            ])

          }).catch((err) => {
            console.log({ err })
            setLoading(false)
          })
        }
      },
      {
        text: 'Não',
        onPress: () => {
          setLoading(false)
        }
      }
    ])
    
  }

  function handleRemove(volume) {
    const newVolumes = fila.VOLUMES.filter(vol => vol !== volume)
    setFila({...fila, VOLUMES: newVolumes})
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        {openVolumeScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onVolumeScanned} handleClose={() => setOpenVolumeScanner(false)} />
        )}
        {openFilaScanner && (
          <Scanner loading={loading} setLoading={setLoading} handleCodeScanned={onFilaScanned} handleClose={() => setOpenFilaScanner(false)} />
        )}
        {!openVolumeScanner && !openFilaScanner &&

        <ScrollView style={{ height: '100%' }}>
        <View style={styles.innerContent}>
          <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <Text style={styles.buttonLabel}>Volumes</Text>
              {fila.VOLUMES.length > 0 && (
              <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 4, borderRadius: 4, marginLeft: 4 }}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>{fila.VOLUMES.length}</Text>
              </View>)}
            </View>
            <Pressable
              style={styles.button}
              onPress={() => setOpenVolumeScanner(true)}
            >
              <Text style={styles.buttonLabel}>
                Escanear
              </Text>
              <Icon
                name="barcode-outline"
                size={30}
                color={colors['gray-500']}
              />
            </Pressable>
          </View>


          {fila.VOLUMES.length > 0 && <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <View>
                <Text style={styles.buttonLabel}>Fila de Expedição</Text>
              </View>
              {fila.FILA !== '' && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={colors['green-300']}
                />
              )}
            </View>
            <Pressable
              style={styles.button}
              onPress={() => setOpenFilaScanner(true)}
            >
              <Text style={styles.buttonLabel}>
                {fila.FILA !== '' ? fila.FILA : 'Escanear'}
              </Text>
              <Icon
                name="barcode-outline"
                size={30}
                color={colors['gray-500']}
              />
            </Pressable>
          </View>}


          {loading ? <ActivityIndicator color={colors['green-300']} /> : 
          fila.FILA !== '' && <Pressable
              style={[styles.button, { backgroundColor: colors['green-300'] }]}
              onPress={handleAlocarVolumes}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                Confirmar Alocação
              </Text>
              <Icon
                name="arrow-forward"
                size={20}
                color='#FFF'
              />
            </Pressable>}

            <View style={{ paddingVertical: 12, borderRadius: 4, backgroundColor: '#fff', flexDirection: 'column', alignItems: 'center', gap: 8, borderRadius: 4 }}>
              <View style={{ paddingHorizontal: 12, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Volumes:</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{fila.VOLUMES.length}</Text>
            </View>
            {fila.VOLUMES.length > 0 && fila.VOLUMES.map((volume, index) => ( 
            <View key={index} style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors['gray-50'] }}>
              <TouchableOpacity onPress={() => handleRemove(volume)}>
                <Icon name="trash-bin" size={20} color={colors['red-500']} />
              </TouchableOpacity>
              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
                  <Icon name="barcode-outline" size={16} color={colors['gray-300']} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{volume}</Text>
                </View>
              </View>
            </View>
          ))
          }
          </View>

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
