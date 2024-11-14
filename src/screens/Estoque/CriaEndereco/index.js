import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { colors } from '../../../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { useRef, useState } from 'react'
import axios from 'axios'
import { useUser } from '../../../hooks/user'
export default function CriaEndereco({ navigation }) {
  const [endereco, setEndereco] = useState({ armazem: '', zona: '', rua: '', coluna: '', nivel: '', subnivel: '', tipo: 'P' })
  const [loading, setLoading] = useState(false)
  const zonaRef = useRef(null);
  const ruaRef = useRef(null);
  const colunaRef = useRef(null);
  const nivelRef = useRef(null);
  const subnivelRef = useRef(null);
  const { refreshAuthentication } = useUser()

  function handleSubmit() {
    setLoading(true)
    if(endereco.armazem.length < 2 || endereco.zona.length < 2 || endereco.rua.length < 1 || endereco.coluna.length < 2 || endereco.nivel.length < 2 || endereco.subnivel.length < 3) {
      Alert.alert('Atenção!','Preencha todos os campos seguindo o padrão de preenchimento.', [
        {
          text: 'Ok',
          onPress: () => {
            setLoading(false)
          }
        }
      ])
      return;
    }
    Alert.alert('Atenção!','Deseja realizar o cadastro?', [
      {
        text: 'Ok',
        onPress: () => {
          const { armazem, zona, rua, coluna, nivel, subnivel } = endereco
          axios.post(`/wCriarEnd`, { armazem, zona, rua, coluna, nivel, subnivel })
          .then(({ data }) => {
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
      },
      {
        text: 'Cancelar',
        onPress: () => {
          setLoading(false)
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
        <ScrollView style={{ height: '100%' }}>
        <KeyboardAvoidingView
        behavior={'height'}
        style={[{ flex: 1, width: '100%' }]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Armazém: </Text>
                  <TextInput
                    editable={true}
                    keyboardType='numeric'
                    onEndEditing={e => {setEndereco({ ...endereco, armazem: e.nativeEvent.text }); zonaRef.current.focus()}}
                    placeholder='00'
                    style={{paddingHorizontal: 10, paddingVertical: 5, flex: 1, textAlign: 'right', fontSize: 26, fontWeight: 'bold', color: colors['green-300']}}
                  />
                </View>
              </View>

              <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Zona: </Text>
                  <TextInput
                    ref={zonaRef}
                    editable={true}
                    keyboardType='numeric'
                    onEndEditing={e => {setEndereco({ ...endereco, zona: e.nativeEvent.text }); ruaRef.current.focus()}}
                    placeholder='00'
                    style={{paddingHorizontal: 10, paddingVertical: 5, flex: 1, textAlign: 'right', fontSize: 26, fontWeight: 'bold', color: colors['green-300']}}
                  />
                </View>
              </View>

              <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Rua: </Text>
                  <TextInput
                    ref={ruaRef}
                    editable={true}
                    keyboardType='default'
                    onEndEditing={e => {setEndereco({ ...endereco, rua: e.nativeEvent.text }); colunaRef.current.focus()}}
                    placeholder='X'
                    style={{paddingHorizontal: 10, paddingVertical: 5, flex: 1, textAlign: 'right', fontSize: 26, fontWeight: 'bold', color: colors['green-300']}}
                  />
                </View>
              </View>

              <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Coluna: </Text>
                  <TextInput
                    ref={colunaRef}
                    editable={true}
                    keyboardType='numeric'
                    onEndEditing={e => {setEndereco({ ...endereco, coluna: e.nativeEvent.text }); nivelRef.current.focus()}}
                    placeholder='00'
                    style={{paddingHorizontal: 10, paddingVertical: 5, flex: 1, textAlign: 'right', fontSize: 26, fontWeight: 'bold', color: colors['green-300']}}
                  />
                </View>
              </View>

              <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Nível: </Text>
                  <TextInput
                    ref={nivelRef}
                    editable={true}
                    keyboardType='numeric'
                    onEndEditing={e => {setEndereco({ ...endereco, nivel: e.nativeEvent.text }); subnivelRef.current.focus()}}
                    placeholder='00'
                    style={{paddingHorizontal: 10, paddingVertical: 5, flex: 1, textAlign: 'right', fontSize: 26, fontWeight: 'bold', color: colors['green-300']}}
                  />
                </View>
              </View>


              <View style={[styles.item,{ width: '100%', backgroundColor: "#fff", borderRadius: 8, borderColor: colors["green-300"], borderWidth: 1 }]}>
                <View style={{ width: '100%', padding: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Subnível: </Text>
                  <TextInput
                    ref={subnivelRef}
                    editable={true}
                    keyboardType='numeric'
                    onEndEditing={e => setEndereco({ ...endereco, subnivel: e.nativeEvent.text })}
                    placeholder='000'
                    style={{paddingHorizontal: 10, paddingVertical: 5, flex: 1, textAlign: 'right', fontSize: 26, fontWeight: 'bold', color: colors['green-300']}}
                  />
                </View>
              </View>
              <View style={[styles.item,{ width: '100%' }]}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center' }}>{endereco.armazem} - {endereco.zona}{endereco.rua}{endereco.coluna}{endereco.nivel}{endereco.subnivel}</Text>
              </View>

              <TouchableOpacity
              style={[styles.button,{ width: '100%', marginTop: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
              onPress={handleSubmit}
            >
              <Text>
                Confirmar criação do endereço
              </Text>
              <Icon
                name="arrow-forward"
                size={16}
                color={colors['gray-500']}
              />
            </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        </ScrollView>
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
    paddingHorizontal: 12,
    gap: 6,
    paddingVertical: 10
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
  },
  formContainer: {
    width: '100%',
    gap: 4,
  },
})
