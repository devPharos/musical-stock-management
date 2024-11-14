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
import * as ScreenOrientation from "expo-screen-orientation";
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user';
import { useEmbarque } from '../../../hooks/embarque'

export default function Embarque({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [openVolumeScanner, setOpenVolumeScanner] = useState(false)
  const [openFilaScanner, setOpenFilaScanner] = useState(false)
  const [openDanfeScanner, setOpenDanfeScanner] = useState(false)
  const [filaSelected, setFilaSelected] = useState(null)
  const { refreshAuthentication } = useUser()
  const { embarque, setEmbarque } = useEmbarque()
  const danfeRegex = /\d{44}$/
  const filaRegex = /EX\d{4}$/
  const volumeRegex = /\d{10}$/

  const onVolumeScanned = (code) => {
    setOpenVolumeScanner(false)
    if(embarque.VOLUMES.find(vol => vol === code)) {
      if(vol.LIDO === true) {
        Alert.alert('Atenção!','Este volume já foi lido.', [
          {
            text: 'Ok',
            onPress: () => {
              setLoading(false)
            }
          }
        ])
        return;
      }
    }
    const volumesLidos = embarque.VOLUMES.map(volume => {
      if(volume.CODIGO === code) {
        volume.LIDO = true;
      }
      return volume;
    })

    if(embarque.VOLUMES.filter(volume => volume.FILA === filaSelected && !volume.LIDO).length === 0) {
      setFilaSelected(null)
    }

    console.log(volumesLidos)

    setEmbarque({...embarque, VOLUMES: volumesLidos})
  }

  const onFilaScanned = (code) => {
    setOpenFilaScanner(false)
    setFilaSelected(code)
  }

  const onDanfeScanned = (code) => {
    setOpenDanfeScanner(false)
    axios.get('/wEmbarque?Danfe=' + code)
    .then(({ data }) => {
      if(data.DANFE) {
        setEmbarque({...embarque, DANFE: data.DANFE, VOLUMES: data.VOLUMES})
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
    .catch((error) => {
      if (error) {
        if(error.message?.includes('401')) {
          refreshAuthentication();
        }
        setLoading(false)
      }
    })
  }

  function handleExpedirVolumes() {
    setLoading(true)
    Alert.alert("Atenção!",`Confirma expedir os volumes lidos ref à Danfe ${embarque.DANFE}?`, [
      {
        text: 'Sim',
        onPress: () => {
          axios.post(`/wEmbarque`, embarque)
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

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {

        // Prompt the user before leaving the screen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }),
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        {openVolumeScanner && (
          <Scanner loading={loading} regex={volumeRegex} navigation={navigation} setLoading={setLoading} handleCodeScanned={onVolumeScanned} handleClose={() => setOpenVolumeScanner(false)} />
        )}
        {openFilaScanner && (
          <Scanner loading={loading} regex={filaRegex} navigation={navigation} setLoading={setLoading} handleCodeScanned={onFilaScanned} handleClose={() => setOpenFilaScanner(false)} />
        )}
        {openDanfeScanner && (
          <Scanner barcodeTypes={["code128"]} loading={loading} regex={danfeRegex} setLoading={setLoading} handleCodeScanned={onDanfeScanned} handleClose={() => setOpenDanfeScanner(false)} />
        )}
        {!openVolumeScanner && !openDanfeScanner && !openFilaScanner &&

        <ScrollView style={{ height: '100%' }}>
        <View style={styles.innerContent}>

        {embarque.DANFE && !embarque.VOLUMES.find(volume => !volume.LIDO) ? <View style={styles.inputContent}>
              <View style={styles.textContainer}>
                <Text style={[styles.buttonLabel,{ textAlign: 'center', width: '100%' }]}>
                  Todos os volumes do pedido já foram lidos.
                </Text>
              </View>
            </View>
            :

          <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <View>
                <Text style={styles.buttonLabel}>Leia o Danfe</Text>
              </View>
              {embarque.DANFE !== '' && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={colors['green-300']}
                />
              )}
            </View>
            <Pressable
              style={styles.button}
              onPress={() => setOpenDanfeScanner(true)}
            >
              <Text style={styles.buttonLabel}>
                {embarque.DANFE !== '' ? embarque.DANFE : 'Escanear'}
              </Text>
              <Icon
                name="barcode-outline"
                size={30}
                color={colors['gray-500']}
              />
            </Pressable>
          </View>
          }



          {embarque.DANFE && embarque.VOLUMES.find(volume => !volume.LIDO) && <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <View>
              <Text style={styles.buttonLabel}>Leia a Fila: {embarque.VOLUMES.find(volume => !volume.LIDO).FILA}</Text>
              </View>
              {filaSelected && (
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
                Escanear
              </Text>
              <Icon
                name="barcode-outline"
                size={30}
                color={colors['gray-500']}
              />
            </Pressable>
          </View>}


          {filaSelected && <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <Text style={styles.buttonLabel}>Leia os Volumes abaixo:</Text>
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
          </View>}


          {loading ? <ActivityIndicator color={colors['green-300']} /> : embarque.VOLUMES.filter(volume => !volume.LIDO).length === 0 && <Pressable
              style={styles.button}
              onPress={handleExpedirVolumes}
            >
              <Text>
                Confirmar Embarque
              </Text>
              <Icon
                name="arrow-forward"
                size={20}
                color={
                  !(embarque.DANFE !== '' && embarque.VOLUMES.length > 0)
                    ? colors['gray-300']
                    : colors['gray-500']
                }
              />
            </Pressable>}

            
            {filaSelected &&
            <View style={{ paddingVertical: 12, borderRadius: 4, backgroundColor: '#fff', flexDirection: 'column', alignItems: 'center', gap: 8, borderRadius: 4 }}>
                <View style={{ paddingHorizontal: 12, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Volumes Pendentes na fila {filaSelected}:</Text>
                </View>
                {embarque.VOLUMES.length > 0 && embarque.VOLUMES.filter(volume => volume.FILA === filaSelected).map((volume, index) => ( 
                <View key={index} style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors['gray-50'] }}>
                  <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <View style={{ width: '100%', flex: 1, flexDirection: 'row', justifyContent: 'flex-start', gap: 12, alignItems: 'center' }}>
                      <Icon name="barcode-outline" size={16} color={colors['gray-300']} />
                      {/* <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Fila <Text style={{ fontSize: 16 }}>{volume.FILA}</Text></Text> */}
                      <Text style={{ fontSize: 10, fontWeight: 'bold' }}><Text style={{ fontSize: 16 }}>{volume.CODIGO}</Text></Text>

                      {volume.LIDO && <Icon
                        name="checkmark-circle"
                        size={20}
                        color={colors['green-300']}
                      />}
                    </View>
                  </View>
                </View>
              ))
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
