import { StyleSheet, View, Text, Pressable } from 'react-native'
import { colors } from '../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'


export default function Header({
  label,
  hasGoBackAction = false,
}) {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      {hasGoBackAction ? (
        <>
          <Pressable onPress={() => navigation?.goBack()}>
            <Icon name="arrow-back" size={20} color={colors['gray-500']} />
          </Pressable>
        </>
      ) : (
        <View />
      )}
      <Text style={styles.label}>{label}</Text>
      <Icon name="cog-outline" size={20} color={colors['gray-500']} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors['green-300'],
    flexDirection: 'row',
    padding: 16,
    paddingTop: 32,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors['gray-500'],
  },
})
