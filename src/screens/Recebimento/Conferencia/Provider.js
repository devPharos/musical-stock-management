import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Recebimento from '.'
import { RecebimentoProvider } from '../../../hooks/recebimento'
import { Items } from './Items'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function RecebimentoRootProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <RecebimentoProvider>
      <Stack.Navigator
        initialRouteName="wConfereNF"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="RecebimentoConferenciaRaiz"
          component={Recebimento}
          options={{
            title: 'Recebimento',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon
                  name="arrow-back"
                  size={22}
                  style={{ marginRight: 34 }}
                  color={colors['gray-500']}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="Items"
          component={Items}
          options={{
            title: 'Recebimento de Itens',
          }}
        />
      </Stack.Navigator>
    </RecebimentoProvider>
  )
}
