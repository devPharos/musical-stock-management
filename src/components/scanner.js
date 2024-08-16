import { CameraView, useCameraPermissions } from 'expo-camera'
import { useState, useEffect } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'
import { colors } from '../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
export default function Scanner({ handleCodeScanned, loading, handleClose }) {
  const [scanned, setScanned] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  useEffect(() => {
      if (permission && !permission.granted) {
        requestPermission()
      }
  }, [permission])

  const handleBarCodeScanned = ({ data }) => {
    if(loading) {
      return
    }
    handleCodeScanned(data)
  }

  function handleManualInput() {
    handleCodeScanned(scanned)
  }

  return (
    <SafeAreaView style={styles.container}>
      { loading || !permission ? <ActivityIndicator />
      :
      <>
       {handleClose && <TouchableOpacity onPress={handleClose} style={{ backgroundColor: colors['gray-100'], padding: 8, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 4 }}>
          <Icon name="chevron-back" size={20} color={colors['gray-400']} />
          <Text>Fechar câmera</Text>
        </TouchableOpacity>}
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.content}
        />
        <TextInput style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: "#FFF", height: 48,fontSize: 18, borderWidth: 1, borderColor: "#ccc", textAlign: 'center' }} keyboardType='default' onChangeText={setScanned} onEndEditing={handleManualInput} placeholder='Digite manualmente...' placeholderTextColor='#ccc' />
      </>}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
})
