import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { ConferenciaProvider } from '../../../hooks/conferencia'
import { useUser } from '../../../hooks/user'
import Conferencia from '.'
const Stack = createNativeStackNavigator()

export default function ConferenciaRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <ConferenciaProvider>
      <Stack.Navigator
        initialRouteName="wConferencia"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="ConferenciaRaiz"
          component={Conferencia}
          options={{
            title: 'Conferência',
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
    </ConferenciaProvider>
  )
}
