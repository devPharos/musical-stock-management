import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Enderecamento from '.'
import { EnderecamentoProvider } from '../../../hooks/enderecamento'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function EnderecamentoRProvider({ navigation }) {
  const { ambiente, APP_VERSION } = useUser();
  return (
    <EnderecamentoProvider>
      <Stack.Navigator
        initialRouteName="wEnderecar"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
          headerRight: () => (
            <TouchableOpacity onPress={() => alert(`Versão ${APP_VERSION}`)}>
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
    </EnderecamentoProvider>
  )
}
