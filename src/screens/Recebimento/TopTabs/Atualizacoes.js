import { StyleSheet, ImageBackground } from 'react-native'
import CustomButton from '../../../components/button'
import { useUser } from '../../../hooks/user';

export default function Atualizacoes({ navigation, route }) {
  const { user } = useUser()
  const { mainMenu } = route.params;
  console.log({ mainMenu })
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../../assets/bg.png')}
    >
      {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '101') > -1 &&
      <CustomButton
        label="Conferência"
        detail="Processo de conferência de notas fiscais de entrada."
        navigatePath="Conferencia"
        navigation={navigation}
        type="secondary"
      /> }
      {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '102') > -1 &&
      <CustomButton
        label="Inspeção Ibanez"
        detail="Processo de inspeção das guitarras e violões da marca Ibanez."
        navigatePath="Ibanez"
        navigation={navigation}
        type="secondary"
      /> }
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
