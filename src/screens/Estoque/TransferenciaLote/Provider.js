import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { TransferenciaProvider } from '../../../hooks/transferencia'
import Transferencia from '.'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function TransferenciaLoteRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <TransferenciaProvider>
      <Stack.Navigator
        initialRouteName="wTransferirLote"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="TransferenciaLoteRaiz"
          component={Transferencia}
          options={{
            title: 'Transferência de Lotes',
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
      </Stack.Navigator>
    </TransferenciaProvider>
  )
}
