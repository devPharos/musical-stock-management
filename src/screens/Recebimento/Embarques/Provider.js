import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Embarques from '.'
import { EmbarquesProvider } from '../../../hooks/embarques'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
const Stack = createNativeStackNavigator()

export default function EmbarquesRootProvider({ navigation }) {
  return (
    <EmbarquesProvider>
      <Stack.Navigator
        initialRouteName="Embarques"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: colors['green-300'] },
        }}
      >
        <Stack.Screen
          name="EmbarquesRaiz"
          component={Embarques}
          options={{
            title: 'Embarques Futuros',
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
    </EmbarquesProvider>
  )
}
