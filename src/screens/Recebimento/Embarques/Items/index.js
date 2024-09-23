import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native'
import { colors } from '../../../../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { ItemsCard } from '../../../../components/itemsCard'
import { useEffect, useState } from 'react'
import PrinterButton from '../../../../components/PrinterButton'
import { useUser } from '../../../../hooks/user'
import axios from 'axios'
import { useRecebimento } from '../../../../hooks/recebimento'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { CameraView, useCameraPermissions } from 'expo-camera'

export function Items({ navigation }) {
  const [openCameraReader, setOpenCameraReader] = useState(false);
  const [loading, setLoading] = useState(false)
  const { selectedInvoices, invoiceItems, handleModifySelectedInvoices } = useRecebimento()
  const { selectedPrinter, refreshAuthentication } = useUser()
  const [allItemsWereConferred, setAllItemsWereConferred] = useState(false)
  const [printerNotSelected, setPrinterNotSelected] = useState(false)
  const [openQuantityInform, setOpenQuantityInform] = useState(null)
  const [permission, requestPermission] = useCameraPermissions()

  useEffect(() => {
      if (permission && !permission.granted) {
        requestPermission()
      }
  }, [permission])


  async function handleBarCodeScanned({ type, data }) {
    if(loading) {
        return;
    }
    const filteredItems = [];

    invoiceItems.map(invoice => {
      invoice.map(item => {
        if(item.codigodebarras === data) {
          filteredItems.push(item)
        }
        return item
      })
      return invoice
    })
    setOpenQuantityInform(filteredItems)
    setLoading(true);

    // Trecho de consulta
    setOpenCameraReader(false);
    setLoading(false);
  };

  useEffect(() => {
    let checkdItems = 0;

    selectedInvoices.map(invoice => {
      invoice.itens.map(item => {
        if(item.qtdScan) {
          checkdItems++
        }
      })
    })

    if (checkdItems === invoiceItems.length) {
      setAllItemsWereConferred(true)
    }
  },[openQuantityInform])

  function handleOpenCamera() {
      setOpenCameraReader(!openCameraReader)
  }

  useEffect(() => {
    if (selectedPrinter) {
      setPrinterNotSelected(false)
    }
  }, [selectedPrinter])

  const handleButtonAction = () => {
    if (!selectedPrinter) {
      setPrinterNotSelected(true)
    }

    if (selectedPrinter) {
      const itens = []

      invoiceItems.map(inv => {
        itens.push(...inv)
      })
      const body = {
        itens,
        imprimeetiquetas: true,
      }

      axios
        .post(`/wConfereNF`, body)
        .then((response) => {
          if (response.status === 200) {
            selectedInvoices.forEach(inv => {
              handleModifySelectedInvoices(inv)
            })
            setTimeout(() => {
              navigation.popToTop()
            },200)
          }
        })
        .catch((error) => {
          if (error) {
            if(error.message?.includes('401')) {
              refreshAuthentication();
            }
          }
          setLoading(false)
        })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/bg.png')}
        style={styles.content}
      >
        {allItemsWereConferred ?
          <TouchableOpacity style={styles.button} onPress={() => handleButtonAction()}>
            <Text style={styles.buttonLabel}>
              Finalizar Recebimento
            </Text>
            <Icon
              name="barcode-outline"
              size={30}
              color={colors['gray-500']}
            />
          </TouchableOpacity>
        :
          <TouchableOpacity style={styles.button} onPress={() => handleOpenCamera()}>
            <Text style={styles.buttonLabel}>
              Continuar Recebimento
            </Text>
            <Icon
              name="barcode-outline"
              size={30}
              color={colors['gray-500']}
            />
          </TouchableOpacity>
        }

        {printerNotSelected && (
          <Text style={styles.errorLabel}>Selecione uma impressora</Text>
        )}

        <View style={styles.table}>
          <ScrollView style={styles.items}>
            {selectedInvoices.map((i, index) => {
              return (
                <View key={index}>
                  <View style={styles.header}>
                    <Text style={styles.title}>
                      NF {i.notafiscal} - {i.razaosocial.substring(0, 20)}
                    </Text>
                  </View>
                  {i?.itens?.map((item, index) => {
                    return <ItemsCard itemData={item} key={index} />
                  })}
                </View>
              )
            })}
          </ScrollView>
        </View>
        <PrinterButton navigation={navigation} />
        {openCameraReader && !loading ?
          <Modal
          animationType="slide"
          transparent={true}
          visible={openCameraReader}
          onRequestClose={() => {
              setOpenCameraReader(!openCameraReader);
          }}>
                <View style={{ height: RFPercentage(100), backgroundColor: "#efefef", marginTop: 10, flex: 1 }}>
                  <TouchableOpacity onPress={() => setOpenCameraReader(false)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
                      <Icon
                        name="arrow-back"
                        size={22}
                        style={{ marginRight: 34 }}
                        color={colors['gray-500']}
                      />
                      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Leitura da Etiqueta</Text>
                  </TouchableOpacity>
                  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
                      <ScrollView>
                          <View style={{ width: '100%', paddingVertical: 12 }}>
                              <View style={{ width: '100%', height: RFPercentage(78), overflow: 'hidden', zIndex: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                  <CameraView
                                  onBarcodeScanned={e => handleBarCodeScanned(e)}
                                  style={{ width: RFPercentage(45), height: RFPercentage(100) }}
                                  />
                              </View>
                          </View>
                      </ScrollView>
                  </KeyboardAvoidingView>
              </View>
          </Modal> : null }


      {openQuantityInform && openQuantityInform.length > 0 && !loading ?
        <Modal animationType="slide"  transparent={true} visible={openQuantityInform && openQuantityInform.length > 0}
        onRequestClose={() => {
            setOpenQuantityInform(null);
        }}>
          <View style={{ height: RFPercentage(50), backgroundColor: "#efefef", marginTop: 10, flex: 1 }}>
            <TouchableOpacity onPress={() => {setOpenQuantityInform(null); setOpenCameraReader(true)}} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
                <Icon
                  name="chevron-back-outline"
                  size={30}
                  color={colors['gray-500']}
                />
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{openQuantityInform[0].descricao}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, flexDirection: 'column', width: '100%', justifyContent: 'flex-start', alignItems: 'center', borderWidth: 1 }}>
            {
              openQuantityInform.map((inform,index) => {
                return <View key={index} style={{ width: '90%', padding: 16, backgroundColor: "#FFF", borderRadius: 8, marginTop: 32, gap: 8, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Nota Fiscal: {inform.notafiscal.trim()} / {inform.serie.trim()}</Text>
                  <Text style={{ fontSize: 16 }}>Quantidade na nota: {inform.quantidade}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TextInput 
                    // value={inform.qtdScan ? inform.qtdScan.toString() : null} 
                    onChangeText={val => inform.qtdScan = val}
                    autoFocus={index === 0 ? true : false}
                    keyboardType='numeric'
                    placeholder='0' 
                    style={{ fontSize: 24, width: '40%', fontWeight: 'bold', padding: 16, borderWidth: 1, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderColor: '#ccc', textAlign: 'center' }}
                  />
                  <TextInput 
                    value={inform.quantidade.toString()}
                    editable={false}
                    keyboardType='numeric' 
                    placeholder='0' 
                    style={{ fontSize: 24, width: '40%', fontWeight: 'bold', padding: 16, borderWidth: 1, borderLeftWidth: 0,  borderTopRightRadius: 16, borderBottomRightRadius: 16, borderColor: '#ccc', textAlign: 'center' }}
                  />
                  </View>
                </View>
              })
            }
            <TouchableOpacity style={{ backgroundColor: colors["green-300"], width: 200, borderRadius: 8, marginTop: 24 }} onPress={() => setOpenQuantityInform(null)}>
              <Text style={{ color: "#FFF", textAlign: 'center', fontSize: 18, fontWeight: 'bold', padding: 16 }}>Gravar quantidades</Text>
            </TouchableOpacity>
            </View>
          </View>
        </Modal>
        : null }
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  errorLabel: {
    fontSize: 16,
    color: colors['red-500'],
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
  container: {
    flex: 1,
    backgroundColor: colors['gray-50'],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 24,
    alignItems: 'center',
    gap: 24,
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
    gap: 8,
  },
  buttonLabel: {
    fontSize: 16,
    color: colors['gray-500'],
    fontWeight: '600',
  },
  items: {
    flex: 1,
    width: '100%',
  },
  itemContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-200'],
    padding: 8,
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors['gray-500'],
  },
  itemNFQtd: {
    flexDirection: 'row',
  },
  itemNFQtdLabel: {
    fontWeight: '500',
    color: colors['gray-500'],
  },
  table: {
    flex: 1,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 8,
  },
  tableHQtdNF: {
    width: '20%',
  },
  tableHQtdCF: {
    width: '20%',
  },
  tableHDesc: {
    width: '60%',
  },
})
