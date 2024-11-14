import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors } from '../../../styles/colors'
import { TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { useUser } from '../../../hooks/user'
import { EmbarqueProvider } from '../../../hooks/embarque'
import Embarque from '.'
import { useEffect, useState } from 'react';
const Stack = createNativeStackNavigator()

export default function EmbarqueRProvider({ navigation }) {
  const { ambiente } = useUser();
  return (
    <EmbarqueProvider>
      <Stack.Navigator
        initialRouteName="wEmbarque"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: colors['gray-500'],
          headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
        }}
      >
        <Stack.Screen
          name="EmbarqueRaiz"
          component={Embarque}
          options={{
            title: 'Embarque de Pedidos',
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
    </EmbarqueProvider>
  )
}
