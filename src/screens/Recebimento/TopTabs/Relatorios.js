import CustomButton from '../../../components/button'
import { ImageBackground, StyleSheet } from 'react-native'

export default function Relatorios({ navigation }) {
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../../assets/bg.png')}
    >
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
})