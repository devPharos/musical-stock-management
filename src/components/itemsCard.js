import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native'
import { colors } from '../styles/colors'
import { API_URL } from '../../config'
import axios from 'axios'
import { useUser } from '../hooks/user'

export function ItemsCard({ itemData }) {
  const { user, selectedPrinter } = useUser()

  const handlePrintItemTag = () => {
    Alert.alert("Etiqueta de Nascionalização","Deseja realmente imprimir a etiqueta deste produto?", [
      {
        text: "Sim",
        onPress: () => {
          const body = {
            produto: itemData.codigodebarras,
            quantidade: itemData.quantidade,
            impressora: selectedPrinter?.codigo,
          }
          axios
            .post(`${API_URL}/rest/wNacionaliz`, body, {
              headers: {
                Authorization: `Bearer ${user?.access_token}`,
              },
            })
            .then((response) => {
              console.log(response.data)
            })
            .catch((error) => {
              if (error) {
                console.warn(error)
              }
            })
        }
      },
      {
        text: "Cancelar",
      }
    ])
    
  }

  return (
    <TouchableOpacity style={styles.itemContainer} onLongPress={handlePrintItemTag}>
      <View style={styles.content}>
        <View>
          <Image style={{ width: 50, height: 50 }} source={{ uri: itemData.imagem }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{itemData.descricao}</Text>
          <Text style={styles.itemNFQtdLabel}>Código ME: {itemData.codigo}</Text>
          <Text style={styles.itemNFQtdLabel}>Partnumber: {itemData.partnumber}</Text>
        </View>
        <View style={styles.itemContent}>
          { itemData.qtdScan && itemData.qtdScan.toString() === itemData.quantidade.toString() ?
            <View style={{ backgroundColor: colors['green-300'], paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{ color: "#222", fontWeight: 'bold' }}>{itemData.qtdScan}</Text>
            </View>
          : itemData.qtdScan && itemData.qtdScan.toString() !== itemData.quantidade.toString() ?
            <View style={{ backgroundColor: colors['red-500'], paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{ color: "#FFF", fontWeight: 'bold' }}>{itemData.qtdScan+" / "+itemData.quantidade}</Text>
            </View>
          :
            <View style={{ backgroundColor: "#EFEFEF", paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{ color: "#aaa", fontWeight: 'bold' }}>{itemData.quantidade}</Text>
            </View>
          }
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  button: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors['gray-200'],
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-200'],
    padding: 8,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
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
  itemNFQtdLabelCorrect: {
    fontWeight: '700',
    color: colors['green-500'],
  },
  itemNFQtdLabelIncorrect: {
    fontWeight: '700',
    color: colors['red-500'],
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
