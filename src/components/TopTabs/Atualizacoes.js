import { StyleSheet, ImageBackground, ScrollView } from 'react-native'
import CustomButton from '../../components/button'
import { useUser } from '../../hooks/user';

export default function Atualizacoes({ navigation, route }) {
  const { user } = useUser()
  let { bottomTab } = route.params;
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
          {user.menus[index100].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '10').sort((a,b) => a.TITULO < b.TITULO ? -1 : 1).map((menu) => {
            return <CustomButton
              key={menu.CODIGO}
              label={menu.TITULO}
              detail={menu.DESCRICAO || menu.TITULO}
              navigatePath={menu.ROTINA}
              navigation={navigation}
              type="secondary"
            />
      })}
      </ScrollView>}
      
      { bottomTab === 'Estoque' &&
      <ScrollView style={{ height: '100%' }}>
      {user.menus[index200].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '20').sort((a,b) => a.TITULO < b.TITULO ? -1 : 1).map((menu) => {
        return <CustomButton
          key={menu.CODIGO}
          label={menu.TITULO}
          detail={menu.DESCRICAO || menu.TITULO}
          navigatePath={menu.ROTINA}
          navigation={navigation}
          type="secondary"
        />
      })}
      </ScrollView>}
      { bottomTab === 'Expedicao' &&
      <ScrollView style={{ height: '100%' }}>

{user.menus[index300].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '30').sort((a,b) => a.TITULO < b.TITULO ? -1 : 1).map((menu) => {
            return <CustomButton
              key={menu.CODIGO}
              label={menu.TITULO}
              detail={menu.DESCRICAO || menu.TITULO}
              navigatePath={menu.ROTINA}
              navigation={navigation}
              type="secondary"
            />
      })}
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
