import { View, StyleSheet, Text } from 'react-native'
import { colors } from '../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { useConference } from '../hooks/conference'

export function ReceiptCardItem({ invoice }) {
  const { selectedInvoices } = useConference()
  return (
    <View style={styles.container}>
      <Icon
        name={selectedInvoices.includes(invoice) ? 'checkbox' : 'square-outline'}
        size={20}
        color={selectedInvoices.includes(invoice) ? colors['green-300'] : colors['gray-500']}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {invoice?.razaosocial.length > 22
              ? invoice?.razaosocial.substring(0, 22) + '...'
              : invoice?.razaosocial}
          </Text>
          <View
            style={
              invoice.tiponotafiscal === 'Nacional'
                ? styles.tagNacional
                : styles.tagImportado
            }
          >
            <Text>{invoice.tiponotafiscal}</Text>
          </View>
        </View>

        <View style={styles.receiptInfoContainer}>
          <View>
            <Text style={styles.contentTitle}>Nota fiscal</Text>
            <Text style={styles.contentLabel}>{invoice?.notafiscal}</Text>
          </View>

          <View style={styles.contentItem}>
            <Text style={styles.contentTitle}>Emissão</Text>
            <Text style={styles.contentLabel}>{invoice?.emissao}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors['gray-200'],
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagNacional: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: colors['gray-50'],
  },
  tagImportado: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: colors['green-300'],
  },
  title: {
    color: colors['gray-500'],
    fontWeight: '800',
    fontSize: 14,
    flexWrap: 'wrap',
  },
  content: {
    display: 'flex',
    flex: 1,
    gap: 8,
  },
  receiptInfoContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  contentItem: {
    alignItems: 'flex-end',
  },
  contentLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: colors['gray-500'],
  },
  contentTitle: {
    fontSize: 14,
    color: colors['gray-500'],
  },
})
