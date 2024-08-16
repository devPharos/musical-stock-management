import CustomButton from '../../components/button'
import { ImageBackground, ScrollView, StyleSheet } from 'react-native'
import { useUser } from '../../hooks/user';

export default function Consultas({ navigation, route }) {
  const { user } = useUser()
  const { mainMenu, bottomTab } = route.params;
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/bg.png')}
    >
    { bottomTab === 'Recebimento' &&
    <ScrollView style={{ height: '100%' }}>
      {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '111') > -1 &&
      <CustomButton
        label="Embarques Futuros"
        detail="Pedidos de compras da marca Ibanez ainda com data futura."
        navigatePath="Embarques"
        navigation={navigation}
        type="secondary"
      />}
    </ScrollView>}

    
    { bottomTab === 'Estoque' &&
    <ScrollView style={{ height: '100%' }}>
      {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '211') > -1 &&
      <CustomButton
        label="Buscar por Produto"
        detail="Pesquisa de produto pelos dados do mesmo."
        navigatePath="ConsultaProdutoProvider"
        navigation={navigation}
        type="secondary"
      />}
      {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '213') > -1 &&
      <CustomButton
        label="Buscar por Endereço"
        detail="Pesquisa de endereço."
        navigatePath="ConsultaEnderecoProvider"
        navigation={navigation}
        type="secondary"
      />}
    </ScrollView>}
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