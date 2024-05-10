import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from '../styles/colors'
import { Platform, StyleSheet } from 'react-native'
import { useUser } from '../hooks/user'
import Rotina from '../screens/Rotina'

const Tab = createBottomTabNavigator()
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : 15
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56

export default function BottomTabs() {
  const { user } = useUser()

  return (
    <>
    <Tab.Navigator
      initialRouteName="Recebimento"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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
            case 'Expedições':
              iconName = focused ? 'bus' : 'bus-outline'
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
        initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '100')}}
        options={{ headerShown: false }}
      />
      : null }
      { user.menus.findIndex(menu => menu.CODIGO === '200') > -1 ?
      <Tab.Screen
        name="Estoque"
        component={Rotina}
        options={{ headerShown: false }}
        initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '200')}}
      />
      : null }
      {/* { user.menus.findIndex(menu => menu.CODIGO === '300') > -1 ?
      <Tab.Screen
        name="Expedições"
        component={Expedicao}
        options={{ headerShown: false }}
        initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '300') }}
      />
      : null }
      { user.menus.findIndex(menu => menu.CODIGO === '400') > -1 ?
      <Tab.Screen
        name="Inventário"
        component={Inventario}
        options={{ headerShown: false }}
        initialParams={{menuIndex: user.menus.findIndex(menu => menu.CODIGO === '400') }}
      />
      : null } */}
    </Tab.Navigator>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    backgroundColor: colors['green-300'],
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
})
