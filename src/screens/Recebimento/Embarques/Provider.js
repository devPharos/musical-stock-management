import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Embarques from '.'
import { EmbarquesProvider } from '../../../hooks/embarques'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function EmbarquesRootProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <EmbarquesProvider>
      <Stack.Navigator
        initialRouteName="Embarques"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
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
                  name="chevron-back-sharp"
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
