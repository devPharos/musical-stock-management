import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'

export default function CustomButton({
  label = '',
  navigatePath = '',
  detail = '',
  navigation,
  type = 'primary',
}) {
  const handleNavigation = () => {
    navigation?.navigate(navigatePath)
  }

  return (
    <Pressable
      style={
        type === 'secondary'
          ? styles.containerSecondary
          : styles.containerPrimary
      }
      onPress={handleNavigation}
    >
      <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, flex: 1 }}>
        <Text
          style={
            type === 'secondary' ? styles.labelSecondary : styles.labelPrimary
          }
        >
          {label}
        </Text>
        { detail && <Text style={{ fontSize: 12 }}>
          {detail}
        </Text> }
      </View>
      <Icon name="chevron-forward-outline" color="#868686" size={24} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  containerSecondary: {
    backgroundColor: colors.white,
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 0,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#222',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 20,
  },
  containerPrimary: {
    backgroundColor: colors['green-300'],
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  labelSecondary: {
    fontWeight: '400',
    color: colors['gray-500'],
    fontSize: 16,
  },
  labelPrimary: {
    fontWeight: '700',
    color: colors.white,
  },
})
