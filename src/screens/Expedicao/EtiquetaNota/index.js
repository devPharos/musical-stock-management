import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Text,
  View,
  Alert,
  ScrollView,
} from 'react-native'
import * as ScreenOrientation from "expo-screen-orientation";
import { colors } from '../../../styles/colors'
import Scanner from '../../../components/scanner'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user';
import PrinterButton from '../../../components/PrinterButton';

export default function EtiquetaNota({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [openDanfeScanner, setOpenDanfeScanner] = useState(false)
  const { refreshAuthentication, selectedPrinter } = useUser()
  const danfeRegex = /\d{44}$/

  const onDanfeScanned = (code) => {
    setOpenDanfeScanner(false)
    axios.post('/wEtiquetaNota', { danfe: code, impressora: selectedPrinter.CODIGO })
    .then(({ data }) => {
      if(data.Status === 200) {
        Alert.alert("Atenção!",data.Message, [
          {
            text: 'Ok',
            onPress: () => {
              setLoading(false)
            }
          }
        ])
      }
      if(data.Status !== 200) {
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
        console.log(error)
        if(error.message?.includes('401')) {
          refreshAuthentication();
        }
        setLoading(false)
      }
    })
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
        {openDanfeScanner && (
          <Scanner barcodeTypes={["code128"]} loading={loading} regex={danfeRegex} setLoading={setLoading} handleCodeScanned={onDanfeScanned} handleClose={() => setOpenDanfeScanner(false)} />
        )}
        {!openDanfeScanner &&

        <ScrollView style={{ height: '100%' }}>
        <View style={styles.innerContent}>

          <View style={styles.inputContent}>
            <View style={styles.textContainer}>
              <View>
                <Text style={styles.buttonLabel}>Leia o Danfe</Text>
              </View>
            </View>
            <Pressable
              style={styles.button}
              onPress={() => {
                if(selectedPrinter) {
                  setOpenDanfeScanner(true)
                } else {
                  Alert.alert('Atenção!','Selecione uma impressora para ler o Danfe.')
                }

              }}
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
          

        </View>
        </ScrollView>}
        <PrinterButton navigation={navigation} />



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
