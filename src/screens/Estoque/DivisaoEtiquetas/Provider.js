import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { ReimpressaoProvider } from '../../../hooks/reimpressao'
import Reimpressao from '.'
import { useUser } from '../../../hooks/user'
import DivisaoEtiquetas from '.'
const Stack = createNativeStackNavigator()

export default function DivisaoEtiquetasRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <ReimpressaoProvider>
      <Stack.Navigator
        initialRouteName="DivisaoEtiquetas"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="DivisaoEtiquetasRaiz"
          component={DivisaoEtiquetas}
          options={{
            title: 'Divisão de Etiquetas',
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
