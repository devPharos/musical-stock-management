import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
import EtiquetaNota from '.'
import { EtiquetaNotaProvider } from '../../../hooks/etiquetaNota'
const Stack = createNativeStackNavigator()

export default function EtiquetaNotaRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <EtiquetaNotaProvider>
      <Stack.Navigator
        initialRouteName="wEtiquetaNota"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="EmbarqueRaiz"
          component={EtiquetaNota}
          options={{
            title: 'Etiqueta de Nota',
            screenOrientation: 'all',
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
    </EtiquetaNotaProvider>
  )
}
