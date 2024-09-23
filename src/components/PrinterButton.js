import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { colors } from '../styles/colors'

export default function PrinterButton({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation?.navigate('Printer')}
      >
        <Icon name="print" color={colors.white} size={24} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  button: {
    backgroundColor: colors['green-500'],
    borderRadius: 30,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
})
