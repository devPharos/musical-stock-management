import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  TextInput
} from 'react-native'
import { colors } from '../styles/colors'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import Icon from 'react-native-vector-icons/Ionicons'
import { useConference } from '../hooks/conference'

export default function ReceiptModal({
  setItemQuantity,
  open = false,
  handleModalClose,
  item,
  invoiceItems,
}) {

  const itemQuantityFormSchema = Yup.object().shape({
    quantity: Yup.number(0).positive('Quantidade deve ser maior que zero.').integer().required('Campo obrigatório.').max(item.quantidade2um, 'A quantidade não pode ser maior que a da nota: '+item.quantidade2um)
  })

  const { receiptGroup, setReceiptGroup } = useConference()

  const methods = useForm({
    resolver: yupResolver(itemQuantityFormSchema),
  })

  const onSubmit = ({ quantity }) => {
    if (parseInt(quantity) <= item.quantidade2um && parseInt(quantity) >= 0) {

      invoiceItems.forEach((i) => {
        if (i.codigodebarras === item.codigodebarras) {
          console.log(quantity,i.codigodebarras)
          i.qtdScan = quantity
        }
      })

      setItemQuantity(quantity)
      handleModalClose()
      methods.reset()
    }

    if (parseInt(quantity) > item.quantidade2um) {
      methods.setError('quantity', {
        message: 'Quantidade inserida maior que a quantidade da nota fiscal',
      })
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {console.log({item})}
          <View style={styles.data}>
            <Text style={styles.modalText}>{item.partnumber} - {item.descricao}</Text>
          </View>
          <View style={styles.data}>
            <Text style={styles.modalText}>NF: {item.notafiscal}</Text>
            <Text style={styles.modalText}>Quantidade: {item.quantidade2um} cx.</Text>
          </View>
          <Controller
            control={methods.control}
            name="quantity"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <View style={styles.formContainer}>
                  <View
                    style={
                      error ? styles.inputContainerError : styles.inputContainer
                    }
                  >
                    <Icon
                      color={error ? colors['red-500'] : colors['gray-300']}
                      name="calculator"
                      size={20}
                    />
                    <TextInput
                      autoFocus={true}
                      placeholder={'Quantidade recebida'}
                      style={error ? styles.inputError : styles.input}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="number-pad"
                      placeholderTextColor={
                        error ? colors['red-500'] : colors['gray-300']
                      }
                    />
                  </View>
                  {error && (
                    <Text style={styles.errorMessage}>{error.message}</Text>
                  )}
                </View>
              )
            }}
          />

          <Pressable
            style={styles.buttonContainer}
            onPress={methods.handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonLabel}>INSERIR</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  data: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: 350,
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 32,
  },
  errorMessage: {
    color: colors['red-500'],
    marginLeft: 16,
  },
  formContainer: {
    width: '100%',
    gap: 4,
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
    backgroundColor: colors['gray-50'],
    borderRadius: 90,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
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
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors['gray-200'],
  },
  buttonLabel: {
    fontWeight: '700',
    color: colors['gray-500'],
  },
})
