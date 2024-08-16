import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import { colors } from '../styles/colors'
import { ReceiptCardItem } from './receiptCardItem'
import { useRecebimento } from '../hooks/recebimento'
import { useEffect } from 'react'

export function ReceiptCard({ loading, invoices, setInvoices }) {

  const { handleModifySelectedInvoices } = useRecebimento()

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        invoices.map((invoice, index) => {
          return (
            <TouchableOpacity
            key={index}
            onPress={() => handleModifySelectedInvoices(invoice)}>
              <ReceiptCardItem
                invoice={invoice}
              />
            </TouchableOpacity>
          )
        })
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  items: {
    flex: 1,
  },
})
