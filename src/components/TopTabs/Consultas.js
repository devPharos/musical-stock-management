import CustomButton from '../../components/button'
import { ImageBackground, ScrollView, StyleSheet } from 'react-native'
import { useUser } from '../../hooks/user';

export default function Consultas({ navigation, route }) {
  const { user } = useUser()
  const { mainMenu, bottomTab } = route.params;
  const index100 = user.menus.findIndex(menu => menu.CODIGO === '100')
  const index200 = user.menus.findIndex(menu => menu.CODIGO === '200')
  const index300 = user.menus.findIndex(menu => menu.CODIGO === '300')
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/bg.png')}
    >
    { bottomTab === 'Recebimento' &&
    <ScrollView style={{ height: '100%' }}>
    {user.menus[index100].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '11').map((menu) => {
      return <CustomButton
        key={menu.CODIGO}
        label={menu.TITULO}
        detail={menu.DESCRICAO || menu.TITULO}
        navigatePath={menu.ROTINA}
        navigation={navigation}
        type="secondary"
      />
    })}
      {/* {user.menus[index100].SUBMENU.findIndex(menu => menu.CODIGO === '111') > -1 &&
      <CustomButton
        label="Embarques Futuros"
        detail="Pedidos de compras da marca Ibanez ainda com data futura."
        navigatePath="wEmbarques"
        navigation={navigation}
        type="secondary"
      />} */}
    </ScrollView>}

    
    { bottomTab === 'Estoque' &&
    <ScrollView style={{ height: '100%' }}>
    {user.menus[index200].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '21').map((menu) => {
      return <CustomButton
        key={menu.CODIGO}
        label={menu.TITULO}
        detail={menu.DESCRICAO || menu.TITULO}
        navigatePath={menu.ROTINA}
        navigation={navigation}
        type="secondary"
      />
    })}
      {/* {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '211') > -1 &&
      <CustomButton
        label="Buscar por Produto"
        detail="Pesquisa de produto pelos dados do mesmo."
        navigatePath="wBuscaProd"
        navigation={navigation}
        type="secondary"
      />}
      {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '213') > -1 &&
      <CustomButton
        label="Buscar por Endereço"
        detail="Pesquisa de endereço."
        navigatePath="wBuscaEnd"
        navigation={navigation}
        type="secondary"
      />} */}
    </ScrollView>}

      { bottomTab === 'Expedicao' &&
        <ScrollView style={{ height: '100%' }}>
          {user.menus[index300].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '31').map((menu) => {
            return <CustomButton
              key={menu.CODIGO}
              label={menu.TITULO}
              detail={menu.DESCRICAO || menu.TITULO}
              navigatePath={menu.ROTINA}
              navigation={navigation}
              type="secondary"
            />
          })}
          {/* {user.menus[index300].SUBMENU.findIndex(menu => menu.CODIGO === '311') > -1 &&
          <CustomButton
            label="Buscar por Produto"
            detail="Pesquisa de produto pelos dados do mesmo."
            navigatePath="wBuscaProd"
            navigation={navigation}
            type="secondary"
          />}
          {user.menus[index300].SUBMENU.findIndex(menu => menu.CODIGO === '313') > -1 &&
          <CustomButton
            label="Buscar por Endereço"
            detail="Pesquisa de endereço."
            navigatePath="wBuscaEnd"
            navigation={navigation}
            type="secondary"
          />} */}
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