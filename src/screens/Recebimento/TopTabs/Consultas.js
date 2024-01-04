import CustomButton from '../../../components/button'
import { ImageBackground, StyleSheet } from 'react-native'
import { useUser } from '../../../hooks/user';

export default function Consultas({ navigation, route }) {
  const { user } = useUser()
  const { mainMenu } = route.params;
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../../assets/bg.png')}
    >
    {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '111') > -1 ?
    <CustomButton
      label="Embarques Futuros"
      detail="Pedidos de compras da marca Ibanez ainda com data futura."
      navigatePath="Embarques"
      navigation={navigation}
      type="secondary"
    />
    : null }
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