import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import ConsultaEndereco from '.'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function ConsultaEnderecoProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
      <Stack.Navigator
        initialRouteName="ConsultaEndereco"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="ConsultaEndereco"
          component={ConsultaEndereco}
          options={{
            title: 'Consulta de Endereço',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon
                  name="chevron-back-sharp"
                  size={30}
                  color={colors['gray-500']}
                />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack.Navigator>
  )
}
