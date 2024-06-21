import { CameraView, useCameraPermissions } from 'expo-camera'
import { useState, useEffect } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, TextInput } from 'react-native'
export default function Scanner({ handleCodeScanned, loading }) {
  const [scanned, setScanned] = useState(false)
  const [hasPermission, setHasPermission] = useCameraPermissions();

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
      { loading || !hasPermission ? <ActivityIndicator />
      :
      <>
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
