import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { colors } from '../styles/colors'
import { useUser } from '../hooks/user'

export default function PrinterButton({ navigation }) {
  const { selectedPrinter } = useUser()
  return (
    <View style={[styles.container,selectedPrinter && { backgroundColor: '#FFF', borderRadius: 8, padding: 4, shadowColor: '#222', shadowOffset: { width: -2, height: 4 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 20 }]}>
      <TouchableOpacity
        style={[styles.button, selectedPrinter  && { backgroundColor: colors['green-300'] }]}
        onPress={() => navigation?.navigate('Printer')}
      >
        <Icon name="print" color={colors.white} size={24} />
      </TouchableOpacity>
        { selectedPrinter && 
        <Text style={{ color: '#111', fontSize: 8, marginTop: 4, width: '100%', textAlign: 'center', fontWeight: 'bold' }}>  
          {selectedPrinter?.DESCRICAO}
        </Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors['gray-300'],
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
