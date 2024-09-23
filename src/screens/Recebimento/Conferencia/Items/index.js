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
  Alert,
  ActivityIndicator,
} from 'react-native'
import { colors } from '../../../../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { ItemsCard } from '../../../../components/itemsCard'
import { useEffect, useState } from 'react'
import PrinterButton from '../../../../components/PrinterButton'
import { useUser } from '../../../../hooks/user'
import axios from 'axios'
import { useRecebimento } from '../../../../hooks/recebimento'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { RFPercentage } from 'react-native-responsive-fontsize'

export function Items({ navigation }) {
  const [openCameraReader, setOpenCameraReader] = useState(false);
  const [loading, setLoading] = useState(false)
  const { selectedInvoices, invoiceItems, setSelectedInvoices, setInvoiceItems, handleModifySelectedInvoices } = useRecebimento()
  const { selectedPrinter } = useUser()
  const [allItemsWereConferred, setAllItemsWereConferred] = useState(false)
  const [printerNotSelected, setPrinterNotSelected] = useState(false)
  const [checkdItems, setCheckedItems] = useState(0)
  const [permission, requestPermission] = useCameraPermissions()
  const openQuantityInformDefault = {
    codigo: '',
    qtdScan: 0,
    qtdEmb: 0,
    quantidade: 0,
    notafiscal: 0,
    serie: 0,
  }
  const [openQuantityInform, setOpenQuantityInform] = useState(openQuantityInformDefault)

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
        if(item.codigodebarras.trim() === data.trim()) {
          filteredItems.push(item)
        }
        return item
      })
      return invoice
    })
    // setSelectedProduct(filteredItems)
    setOpenQuantityInform(filteredItems)
    setLoading(true);

    // Trecho de consulta
    setOpenCameraReader(false);
    setLoading(false);
  };

  useEffect(() => {
    let newCheckedItems = 0;

    selectedInvoices.map(invoice => {
      invoice.itens.map(item => {
        if(item.qtdScan) {
          newCheckedItems++
        }
      })
    })

    if (newCheckedItems === invoiceItems[0].length) {
      setAllItemsWereConferred(true)
    } else {
      setAllItemsWereConferred(false)
    }
    setCheckedItems(newCheckedItems)
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
    setLoading(true)
    if (!selectedPrinter) {
      setPrinterNotSelected(true)
      setLoading(false)
      return
    }

    if (selectedPrinter) {
      const itens = []

      invoiceItems.map(inv => {
          itens.push(...inv)
      })
      const body = {
        itens,
        impressora: selectedPrinter.CODIGO,
        imprimeetiquetas: true,
      }

      axios
        .post(`/wConfereNF`, body)
        .then((response) => {
          if (response.status === 200) {
            selectedInvoices.forEach(inv => {
              inv.itens.forEach(item => {
                item.qtdScan = 0
              })
              handleModifySelectedInvoices(inv)
            })
            setSelectedInvoices([])
            setInvoiceItems([])
            setLoading(false)
            Alert.alert('Atenção!',response.data.Message, [
              {
                text: 'Ok',
                onPress: () => {
                  navigation.popToTop()
                }
              }
            ])
          }
        })
        .catch((error) => {
          if (error) {
            console.warn(error)
            setLoading(false)
          }
        })
    }
  }

  function handleOpenQuantityInform() {

    const notFinished = openQuantityInform.filter((inform) => parseInt(inform.qtdScan) === 0 || parseInt(inform.qtdEmb) === 0 || parseInt(inform.qtdEmb) > parseInt(inform.qtdScan))
    if(notFinished.length > 0) {
      Alert.alert('Atenção!','Preencha as quantidades recebidas e por embalagem.\n\nVerifique se a quantidade por embalagem está maior que a quantidade lida.')
    } else {
      invoiceItems.map((inv) => {
        return inv.map((item) => {
          if(item.qtdScan > 0 && !item.order) {
            item.order = inv.filter(inv => inv.order).length + 1
            console.log(item.order)
          }
          return item
        })
      })
      // console.log(invoiceItems[0].filter(item => item.qtdScan > 0))
      setOpenQuantityInform(openQuantityInformDefault)
      
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/bg.png')}
        style={styles.content}
      >
        {loading ?
        <ActivityIndicator color={colors['green-300']} />
        : allItemsWereConferred ?
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
        checkdItems > 0 ?
        <>
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
          </>
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
                                  <TextInput style={{ position: 'absolute', top: 0, width: RFPercentage(45), backgroundColor: "#FFF", height: 48,fontSize: 18, borderWidth: 1, borderColor: "#ccc", textAlign: 'center' }} keyboardType='number-pad' onEndEditing={e => handleBarCodeScanned({ data: e.nativeEvent.text.toUpperCase()})} placeholder='Digite manualmente...' placeholderTextColor='#ccc' />
                              </View>
                          </View>
                      </ScrollView>
                  </KeyboardAvoidingView>
              </View>
          </Modal> : null }


      {openQuantityInform && openQuantityInform.length > 0 && !loading ?
        <Modal animationType="slide"  transparent={true} visible={openQuantityInform && openQuantityInform.length > 0}
        onRequestClose={() => {
            setOpenQuantityInform(openQuantityInformDefault);
        }}>
          <View style={{ height: RFPercentage(50), backgroundColor: "#efefef", marginTop: 10, flex: 1 }}>
            <TouchableOpacity onPress={() => {setOpenQuantityInform(openQuantityInformDefault); setOpenCameraReader(true)}} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24, marginLeft: 12}}>
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
                  <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 6, width: '40%' }}>
                    
                    <TextInput 
                      onChangeText={val => inform.qtdScan = parseInt(val)}
                      autoFocus={index === 0 ? true : false}
                      keyboardType='numeric'
                      placeholder={inform.qtdScan.toString()}
                      style={{ fontSize: 24, width: '100%', fontWeight: 'bold', padding: 16, borderWidth: 1, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderColor: '#ccc', textAlign: 'center' }}
                    />
                    <Text style={{ width:'100%',textAlign: 'center' }}>Qtd.</Text>
                  </View>
                  <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 6, width: '40%' }}>
                    <TextInput 
                      editable={true}
                      onChangeText={val => inform.qtdEmb = parseInt(val)}
                      keyboardType='numeric' 
                      placeholder={inform.qtdEmb.toString()}
                      style={{ fontSize: 24, width: '100%', fontWeight: 'bold', padding: 16, borderWidth: 1, borderLeftWidth: 0,  borderTopRightRadius: 16, borderBottomRightRadius: 16, borderColor: '#ccc', textAlign: 'center' }}
                    />
                    <Text style={{ width:'100%',textAlign: 'center' }}>Qtd. / Emb.</Text>
                  </View>
                  </View>
                </View>
              })
            }
            <TouchableOpacity style={{ backgroundColor: colors["green-300"], width: 200, borderRadius: 8, marginTop: 24 }} onPress={() => handleOpenQuantityInform()}>
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
