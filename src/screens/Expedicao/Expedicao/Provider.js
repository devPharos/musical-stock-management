import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
import { FilaExpedicaoProvider } from '../../../hooks/filaExpedicao'
import FilaExpedicao from '.'
const Stack = createNativeStackNavigator()

export default function FilaExpedicaoRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <FilaExpedicaoProvider>
      <Stack.Navigator
        initialRouteName="wFilaExpedicao"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="FilaExpedicaoRaiz"
          component={FilaExpedicao}
          options={{
            title: 'Fila de Expedição',
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
    </FilaExpedicaoProvider>
  )
}
