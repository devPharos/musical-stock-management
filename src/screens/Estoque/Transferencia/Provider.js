import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { TransferenciaProvider } from '../../../hooks/transferencia'
import Transferencia from '.'
import ConfirmacaoTransf from './Confirmacao'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function TransferenciaRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <TransferenciaProvider>
      <Stack.Navigator
        initialRouteName="Transferencia"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="TransferenciaRaiz"
          component={Transferencia}
          options={{
            title: 'Transferência',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon
                  name="md-chevron-back-sharp"
                  size={30}
                  color={colors['gray-500']}
                />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="ConfirmacaoTransf"
          component={ConfirmacaoTransf}
          options={{
            title: 'Confirmação',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon
                  name="md-chevron-back-sharp"
                  size={30}
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
