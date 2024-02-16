import { colors } from '../../styles/colors'
import Atualizacoes from './Atualizacoes'
import Consultas from './Consultas'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useUser } from '../../hooks/user'
const Tab = createMaterialTopTabNavigator()

export default function TopTabs({ route }) {
  const routParams = route.params;
  const { ambiente } = useUser();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.white,
        tabBarIndicatorStyle: {
          backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'],
        },
        tabBarStyle: {
          backgroundColor: colors['gray-500'],
        },
      }}
    >
      <Tab.Screen name="Atualizações" initialParams={routParams} component={Atualizacoes} />
      <Tab.Screen name="Consultas" initialParams={routParams} component={Consultas} />
    </Tab.Navigator>
  )
}
