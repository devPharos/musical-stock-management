import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { ReimpressaoProvider } from '../../../hooks/reimpressao'
import { useUser } from '../../../hooks/user'
import AjusteProduto from '.'
const Stack = createNativeStackNavigator()

export default function AjusteProdutoRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <ReimpressaoProvider>
      <Stack.Navigator
        initialRouteName="AjusteProduto"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="AjusteProdutoRaiz"
          component={AjusteProduto}
          options={{
            title: 'Ajuste de Produto',
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
    </ReimpressaoProvider>
  )
}
