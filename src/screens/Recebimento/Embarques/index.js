import {
  StyleSheet,
  SafeAreaView,
  Text,
  ImageBackground,
  View,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native'
import { colors } from '../../../styles/colors'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../../../hooks/user'

export default function Embarques({ navigation }) {
  const { user, refreshAuthentication } = useUser()
  const [loading, setLoading] = useState(true)
  const [embarques, setEmbarques] = useState(null)
  const [selectedPedido, setSelectedPedido] = useState(null)

  useEffect(() => {
    axios
      .get(`/wIbanezPed?marca=0170`)
      .then(({ data }) => {
        setEmbarques(data.PEDIDOS)
        setLoading(false)
      })
      .catch((error) => {
        if (error) {
          console.warn(error.message)
          if(error.message?.includes('401')) {
            refreshAuthentication();
          }
          setLoading(false)
        }
      })
  }, [user.refresh_token])

  const renderItem = ({item}) => {

    return (
      <Item
        item={item}
        onPress={() => setSelectedPedido(item.PEDIDO)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg.png')}
        style={styles.content}
      >
        <View style={styles.container}>
          { loading ? 
            <View style={{ backgroundColor:"#FFF", borderRadius: 8, padding: 8, width: 200 }}>
              <Text style={{ textAlign: 'center' }}>Buscando...</Text>
            </View>
          : embarques.length > 0 ?
          <FlatList data={embarques}
            renderItem={renderItem}
            keyExtractor={item => item.PEDIDO}
            extraData={selectedPedido} style={{ flex: 1 }} />
            :
            <View style={{ paddingVertical: 24 }}>
              <Text style={{ fontWeight: 'bold',textAlign: 'center' }}>Não há nenhum embarque previsto</Text>
              <Text style={{ fontWeight: 'bold',textAlign: 'center' }}>para chegar no momento.</Text>
            </View>
          }
        </View>

      </ImageBackground>
    </SafeAreaView>
  )
}

const Item = ({item, onPress}) => (
  <TouchableOpacity onPress={onPress} style={[styles.item,{ padding: 16, backgroundColor: "#FFF", gap: 8, borderRadius: 16, margin: 16 }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderColor: '#EFEFEF', paddingBottom: 8 }}>
      <Text style={[styles.title, {color: "#111", fontSize: 14}]}><Text style={{ fontWeight: 'bold' }}>{item.MARCA}</Text> - {item.FORNECEDOR}</Text>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <View style={{ backgroundColor: "#efefef", padding: 8, borderRadius: 8 }}>
        <Text style={[styles.title, {color: "#111", fontSize: 14}]}>{item.PREVISAO}</Text>
      </View>
      <Text style={[styles.title, {color: "#111", fontSize: 14}]}>Qtd: {item.QUANTIDADE}</Text>
      <Text style={[styles.title, {color: "#111", fontSize: 14}]}>Ped: {item.PEDIDO}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
  buttonLabel: {
    fontWeight: '700',
    color: colors['gray-500'],
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
    paddingVertical: 12,
    width: '100%',
    gap: 4,
  },
  errorMessage: {
    color: colors['red-500'],
    marginLeft: 16,
  },
})
