import {
  StyleSheet,
  SafeAreaView,
  View,
  ImageBackground,
  Text,
} from 'react-native'
import { colors } from '../../styles/colors'
import Header from '../../components/header'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../../config'
import { useUser } from '../../hooks/user'
import { PrinterCardItem } from '../../components/printerCardItem'

export default function PrinterSelection({ navigation }) {
  const { user, selectedPrinter } = useUser()
  const [printers, setPrinters] = useState([])

  useEffect(() => {
    axios
      .get(`${API_URL}/rest/wPrinter`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      })
      .then((response) => {
        const availablePrinters = response.data.impressoras
        setPrinters(availablePrinters)
      })
      .catch((error) => {
        if (error) {
          console.warn(error)
        }
      })
  }, [user?.access_token])

  const findSelectedPrinter = (printer) => {
    if (printer) {
      return printers.findIndex((item) => item.codigo === printer.codigo)
    }

    return -1
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header label="Seleção de impressora" hasGoBackAction />

      <ImageBackground
        source={require('../../assets/bg.png')}
        style={styles.content}
      >
        <View style={styles.cardContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Selecione uma impressora</Text>
          </View>

          {printers &&
            printers.map((printer, index) => {
              const selectedPrinterIndex = findSelectedPrinter(selectedPrinter)
              // console.log(printer,index)
              return (
                <PrinterCardItem
                  printer={printer}
                  key={index}
                  selected={selectedPrinterIndex === index}
                />
              )
            })}
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['gray-50'],
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: colors.white,
    width: '100%',
  },
  header: {
    backgroundColor: colors['gray-500'],
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    display: 'flex',
  },
  title: {
    color: colors.white,
    fontSize: 16,
  },
  printerInfoContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  contentItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors['gray-500'],
  },
  contentTitle: {
    fontSize: 12,
    color: colors['gray-500'],
  },
  itemContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors['gray-200'],
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemHeader: {
    backgroundColor: colors.white,
    flexWrap: 'wrap',
    flexDirection: 'column',
    gap: 8,
  },
  itemTitle: {
    color: colors['gray-500'],
    fontWeight: '700',
    fontSize: 14,
    flexWrap: 'wrap',
  },
  itemContent: {
    display: 'flex',
    flex: 1,
    gap: 8,
  },
})
