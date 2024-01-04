import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Enderecamento from '.'
import Confirmacao from './Confirmacao'
import { EnderecamentoProvider } from '../../../hooks/enderecamento'
const Stack = createNativeStackNavigator()

export default function EnderecamentoRProvider({ navigation }) {
  return (
    <EnderecamentoProvider>
      <Stack.Navigator
        initialRouteName="Enderecamento"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: colors['green-300'] },
          headerRight: () => (
            <TouchableOpacity onPress={() => alert(`Versão 1.0.0`)}>
              <Icon name="cog-outline" size={24} color={colors['gray-500']} />
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen
          name="EnderecamentoRaiz"
          component={Enderecamento}
          options={{
            title: 'Endereçamento',
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
          name="Confirmacao"
          component={Confirmacao}
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
    </EnderecamentoProvider>
  )
}
