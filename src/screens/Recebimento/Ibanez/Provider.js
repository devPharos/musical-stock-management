import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Ibanez from '.'
import { IbanezProvider } from '../../../hooks/ibanez'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function IbanezRootProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <IbanezProvider>
      <Stack.Navigator
        initialRouteName="Ibanez"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="IbanezRaiz"
          component={Ibanez}
          options={{
            title: 'Inspeção Ibanez',
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
    </IbanezProvider>
  )
}
