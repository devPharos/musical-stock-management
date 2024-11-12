import { CameraView, useCameraPermissions } from 'expo-camera'
import { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { colors } from '../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { Audio } from 'expo-av';

export default function Scanner({ handleCodeScanned, loading, handleClose, buscaPorTexto = true, over = false }) {
  const [scanned, setScanned] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [lantern, setLantern] = useState(false)
  const [zoom, setZoom] = useState(0)
  const cameraRef = useRef(null)
  const [sound, setSound] = useState(null);

  useEffect(() => {
      if (permission && !permission.granted) {
        requestPermission()
      }
  }, [permission])

  const handleBarCodeScanned = (log) => {
    const { data } = log;
    if(loading) {
      return
    }
    if(log.boundingBox.origin.x >= 100 && log.boundingBox.origin.x <= 350 && log.boundingBox.origin.y >= 45 && log.boundingBox.origin.y <= 245) {
      playSound();
      handleCodeScanned(data)
      return
    }
  }

  function handleManualInput() {
    handleCodeScanned(scanned)
  }

  function handleZoom() {
    if(zoom === 0) {
      setZoom(.5)
    } else if(zoom == .5) {
      setZoom(1)
    } else {
      setZoom(0)
    }
  }

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync( require('../assets/scanner.mp3')
    );
    setSound(sound);

    await sound.playAsync();
  }

  useEffect(() => {
    return sound ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <SafeAreaView style={[styles.container]}>
      { loading || !permission ? <ActivityIndicator color={colors["green-300"]} />
      :
      <>
       {handleClose && <TouchableOpacity onPress={handleClose} style={{ backgroundColor: colors['gray-100'], padding: 8, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 4 }}>
          <Icon name="chevron-back" size={20} color={colors['gray-400']} />
          <Text>Fechar câmera</Text>
        </TouchableOpacity>}
        <CameraView
          ref={cameraRef}
          enableTorch={lantern}
          zoom={zoom}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.content}
          animateShutter={true}
        />
        <View style={{ position: 'absolute', bottom: '60%', left: 0, width: '100%', height: '33%', backgroundColor: 'rgba(0,0,0,.7)', fontSize: 18, borderColor: "#fff", textAlign: 'center' }}></View>
        <View style={{ position: 'absolute', bottom: '40%', left: 0, width: '10%', height: '20%', backgroundColor: 'rgba(0,0,0,.7)', fontSize: 18, borderColor: "#fff", textAlign: 'center' }}></View>
        <View style={{ position: 'absolute', bottom: '40%', left: '10%', width: '80%', height: '20%', fontSize: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: "#fff", textAlign: 'center' }}></View>
        <View style={{ position: 'absolute', bottom: '40%', left: '90%', width: '10%', height: '20%', backgroundColor: 'rgba(0,0,0,.7)', fontSize: 18, borderColor: "#fff", textAlign: 'center' }}></View>
        <View style={{ position: 'absolute', bottom: '0%', left: 0, width: '100%', height: '40%', backgroundColor: 'rgba(0,0,0,.7)', fontSize: 18, borderColor: "#fff", textAlign: 'center' }}></View>

        <TouchableOpacity onPress={handleZoom} style={{ position: 'absolute', bottom: 120, right: 0, backgroundColor: lantern ? '#111' : '#FFF', borderRadius: 26, width: 52, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          {zoom === 0 && <Icon name='aperture-outline' size={24} color={lantern ? '#fff' : '#111'} />}
          {zoom === .5 && <Icon name='aperture-outline' size={18} color={lantern ? '#fff' : '#111'} />}
          {zoom === 1 && <Icon name='aperture-outline' size={12} color={lantern ? '#fff' : '#111'} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLantern(!lantern)} style={{ position: 'absolute', bottom: 62, right: 0, backgroundColor: lantern ? '#111' : '#FFF', borderRadius: 26, width: 52, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Icon name='flashlight' size={24} color={lantern ? '#fff' : '#111'} />
        </TouchableOpacity>
        
        {buscaPorTexto && <TextInput style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', backgroundColor: "#FFF", height: 48,fontSize: 18, borderWidth: 1, borderColor: "#ccc", textAlign: 'center' }} keyboardType='default' onChangeText={setScanned} onEndEditing={handleManualInput} placeholder='Digite manualmente...' placeholderTextColor='#ccc' />}
      </>}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
})
