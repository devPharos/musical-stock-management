import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoteNumseq from '.'
import { LoteNumseqProvider } from '../../../hooks/lotenumseq'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
const Stack = createNativeStackNavigator()

export default function LoteNumseqRootProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <LoteNumseqProvider>
      <Stack.Navigator
        initialRouteName="wLoteNumseq"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="LoteNumseqRaiz"
          component={LoteNumseq}
          options={{
            title: 'Lote x Núm. Seq.',
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
    </LoteNumseqProvider>
  )
}
