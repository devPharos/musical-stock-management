import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../styles/colors'
import { useUser } from '../hooks/user'
import Rotina from '../screens/Rotina'
import { useEffect, useRef, useState } from 'react'
import { Alert, DrawerLayoutAndroid } from 'react-native'
import ConsultaProduto from '../screens/Estoque/ConsultaProduto'
import { TouchableOpacity } from 'react-native'

const Tab = createBottomTabNavigator()

export default function BottomTabs({ navigation }) {
  const { user } = useUser()
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);
  const acessoRecebimento = user.menus.findIndex(menu => menu.CODIGO === '100') > -1
  const acessoEstoque = user.menus.findIndex(menu => menu.CODIGO === '200') > -1
  const acessoExpedicao = user.menus.findIndex(menu => menu.CODIGO === '300') > -1
  let initialRoute = '';
  if(acessoRecebimento) {
    initialRoute = 'Recebimento'
  } else if(acessoEstoque) {
    initialRoute = 'Estoque'
  } else if(acessoExpedicao) {
    initialRoute = 'Expedicao'
  }

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          'Deseja realmente sair?',
          'Você tem certeza que deseja voltar para a tela de login?',
          [
            { text: "Não sair", style: 'cancel', onPress: () => {} },
            {
              text: 'Sair',
              style: 'destructive',
              // If the user confirmed, then we dispatch the action we blocked earlier
              // This will continue the action that had triggered the removal of the screen
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }),
    [navigation]
  );
  
    function handleCloseDrawer() {
      profileRef.current.closeDrawer()
      setOpenProfile(false)
    }
    const openDrawer = () => {
      profileRef.current?.openDrawer()
      setOpenProfile(true)
    }

    const consultaProduto = () => (
      <ConsultaProduto navigation={navigation} setOpenProfile={setOpenProfile} openProfile={openProfile} />
    )

    function handleDrawerSlide(drawer) {
      if(!openProfile) {
        setOpenProfile(true)
      }
    }

  return (
    <>
    <DrawerLayoutAndroid
      ref={profileRef}
      drawerWidth={300}
      drawerPosition='left'
      onDrawerClose={handleCloseDrawer}
      onDrawerSlide={handleDrawerSlide}
      unmountOnBlur={true}
      renderNavigationView={consultaProduto}>
      
      <Tab.Navigator
        initialRouteName={initialRoute}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName = ''

            switch (route.name) {
              case 'Dashboard':
                iconName = focused ? 'bar-chart' : 'bar-chart-outline'
                break
              case 'Recebimento':
                iconName = focused ? 'receipt' : 'receipt-outline'
                break
              case 'Estoque':
                iconName = focused ? 'business' : 'business-outline'
                break
              case 'Expedicao':
                iconName = focused ? 'trail-sign' : 'trail-sign-outline'
                break
              case 'Inventário':
                iconName = focused ? 'archive' : 'archive-outline'
                break
            }

            return (
              <Icon
                name={iconName}
                size={20}
                color={focused ? colors['gray-500'] : colors['gray-300']}
              />
            )
          },
          tabBarActiveTintColor: colors['gray-500'],
          tabBarInactiveTintColor: colors['gray-300'],
          tabBarStyle: {
            gap: 6,
          },
        })}
      >
        { user.menus.findIndex(menu => menu.CODIGO === '100') > -1 ?
        <Tab.Screen
          name="Recebimento"
          component={Rotina}
          initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '100'), acessoRecebimento, acessoEstoque, acessoExpedicao}}
          options={{ headerShown: false }}
        />
        : null }
        { user.menus.findIndex(menu => menu.CODIGO === '200') > -1 ?
        <Tab.Screen
          name="Estoque"
          component={Rotina}
          options={{ headerShown: false }}
          initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '200'), acessoRecebimento, acessoEstoque, acessoExpedicao}}
        />
        : null }
        { user.menus.findIndex(menu => menu.CODIGO === '300') > -1 ?
        <Tab.Screen
          name="Expedicao"
          component={Rotina}
          options={{ headerShown: false }}
          initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '300'), acessoRecebimento, acessoEstoque, acessoExpedicao }}
        />
        : null }
        {/* { user.menus.findIndex(menu => menu.CODIGO === '400') > -1 ?
        <Tab.Screen
          name="Inventário"
          component={Inventario}
          options={{ headerShown: false }}
          initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '400') }}
        />
        : null } */}
      </Tab.Navigator>
      <TouchableOpacity onPress={openDrawer} style={{ position: 'absolute', left: 0, bottom: 60, borderTopRightRadius: 25, borderBottomRightRadius: 25, width: 45, height: 45, backgroundColor: colors['gray-500'], justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="search" size={22} color='#FFF' />
      </TouchableOpacity>
    </DrawerLayoutAndroid>
    
    </>
  )
}

