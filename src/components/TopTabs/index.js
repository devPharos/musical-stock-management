import { colors } from '../../styles/colors'
import Atualizacoes from './Atualizacoes'
import Consultas from './Consultas'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import Relatorios from './Relatorios'
const Tab = createMaterialTopTabNavigator()

export default function TopTabs({ route }) {
  const routParams = route.params;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.white,
        tabBarIndicatorStyle: {
          backgroundColor: colors['green-300'],
        },
        tabBarStyle: {
          backgroundColor: colors['gray-500'],
        },
      }}
    >
      <Tab.Screen name="Atualizações" initialParams={routParams} component={Atualizacoes} />
      <Tab.Screen name="Consultas" initialParams={routParams} component={Consultas} />
      <Tab.Screen name="Relatórios" initialParams={routParams} component={Relatorios} />
    </Tab.Navigator>
  )
}
