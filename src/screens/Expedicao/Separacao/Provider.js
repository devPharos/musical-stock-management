import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { SeparacaoProvider } from '../../../hooks/separacao'
import { useUser } from '../../../hooks/user'
import Separacao from '.'
const Stack = createNativeStackNavigator()

export default function SeparacaoRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <SeparacaoProvider>
      <Stack.Navigator
        initialRouteName="Separacao"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="SeparacaoRaiz"
          component={Separacao}
          options={{
            title: 'Separacao',
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
    </SeparacaoProvider>
  )
}
