import {
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  View,
  Text,
  Image,
  Pressable,
} from 'react-native'
import { colors } from '../../../../styles/colors'
import axios from 'axios'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useTransferencia } from '../../../../hooks/transferencia'

export default function ConfirmacaoTransf() {

  const { destinationAddress, originAddress, product } = useTransferencia()

  const handleEndConference = async () => {
    const body = {
      produtos: product.CODIGO,
      armazem_origem: product.ARMAZEM,
      endereco_origem: product.ENDERECO,
      armazem_destino: product.ARMAZEMDESTINO,
      endereco_destino: product.ENDERECODESTINO,
    }
    axios
      .post(`/wTransferir`, body)
      .then((response) => {
        // navigation.navigate('Dashboard')
      }).catch(err => {
      })
  }
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/bg.png')}
        style={styles.content}
      >
        <View style={styles.productContainer}>
          <Image
            alt=""
            style={styles.tinyLogo}
            source={{
              uri: product.PRODUTOS.IMAGEM,
            }}
          />

          <View style={styles.productContent}>
            <Text>Descrição: {product.PRODUTOS.DESCRICAO}</Text>
            <Text>Código: {product.CODIGO}</Text>
            <Text>Quantidade: {product.QTDE}</Text>
          </View>

          <View>
            <Text style={styles.buttonLabel}>
              Endereço de origem: {originAddress.ENDERECO}
            </Text>
            <Text style={styles.buttonLabel}>
              Endereço de destino: {destinationAddress.ENDERECO}
            </Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={handleEndConference}>
          <Text style={styles.buttonLabel}>Finalizar conferência</Text>
          <Icon name="md-arrow-forward" size={20} color={colors['gray-500']} />
        </Pressable>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  productContent: {
    gap: 8,
  },
  productContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
  tinyLogo: {
    width: 80,
    height: 80,
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
    padding: 24,
    paddingTop: 56,
    gap: 32,
  },
  buttonLabel: {
    fontSize: 16,
    color: colors['gray-500'],
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 24,
    shadowColor: '#222',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 20,
    gap: 32,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
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
})
