import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Login from './src/screens/Login'
import BottomTabs from './src/components/bottomTabs'
import { UserProvider } from './src/hooks/user'
import PrinterSelection from './src/screens/Printer'
import { View, StyleSheet, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { colors } from './src/styles/colors'
import ConsultaProdutoProvider from './src/screens/Estoque/ConsultaProduto/Provider'
import ConsultaEnderecoProvider from './src/screens/Estoque/ConsultaEndereco/Provider'

const Stack = createNativeStackNavigator()
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : 0
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56

export default function App() {
  return (
    <UserProvider>
      <View
        style={[styles.statusBar, { backgroundColor: colors['green-300'] }]}
      >
        <SafeAreaView>
          <StatusBar translucent backgroundColor={colors['green-300']} />
        </SafeAreaView>
      </View>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BottomTabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Printer"
            component={PrinterSelection}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="wBuscaProd"
            component={ConsultaProdutoProvider}
            options={{
                headerShown: false,
                title: 'Consultra de Produto',
            }}
          />
          <Stack.Screen
            name="wBuscaEnd"
            component={ConsultaEnderecoProvider}
            options={{
                headerShown: false,
                title: 'Consultra de Endereço',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    backgroundColor: colors['green-300'],
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
})
