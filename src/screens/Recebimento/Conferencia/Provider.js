import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Conferencia from '.'
import { ConferenceProvider } from '../../../hooks/conference'
import { Items } from './Items'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
const Stack = createNativeStackNavigator()

export default function ConferenciaRootProvider({ navigation }) {
  return (
    <ConferenceProvider>
      <Stack.Navigator
        initialRouteName="Conferencia"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: colors['green-300'] },
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
                  name="md-chevron-back-sharp"
                  size={30}
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
            title: 'Conferência de Itens',
          }}
        />
      </Stack.Navigator>
    </ConferenceProvider>
  )
}
