import { Pressable, View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../styles/colors'
import { useUser } from '../hooks/user'

export function PrinterCardItem({
  printer,
  selected = false,
}) {
  const { setSelectedPrinter } = useUser()

  console.log(printer)

  const onPrinterSelection = () => {
    setSelectedPrinter(printer)
  }

  return (
    <Pressable style={styles.itemContainer} onPress={onPrinterSelection}>
      <Icon
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={colors['gray-500']}
      />

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{printer.modelo}</Text>
          <Text>{printer.descricao}</Text>
        </View>

        <View style={styles.printerInfoContainer}>
          <View style={styles.contentItem}>
            <Text style={styles.contentTitle}>Fila</Text>
            <Text style={styles.contentLabel}>{printer.fila}</Text>
          </View>

          <View style={styles.contentItem}>
            <Text style={styles.contentTitle}>LPT</Text>
            <Text style={styles.contentLabel}>{printer.lpt}</Text>
          </View>

          <View style={styles.contentItem}>
            <Text style={styles.contentTitle}>Tipo</Text>
            <Text style={styles.contentLabel}>{printer.tipo}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
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
