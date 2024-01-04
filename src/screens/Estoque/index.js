import { StyleSheet, SafeAreaView, DrawerLayoutAndroid } from 'react-native'
import { colors } from '../../styles/colors'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TransferenciaRProvider from './Transferencia/Provider'
import EnderecamentoRProvider from './Enderecamento/Provider'
import TopTabs from '../../components/TopTabs'
import Profile from '../Profile'
import ProfileButton from '../../components/Header/ProfileButton'
import ConfigButton from '../../components/Header/ConfigButton'
import { useEffect, useRef, useState } from 'react'
import ConsultaProdutoProvider from './ConsultaProduto/Provider'
import ConsultaEnderecoProvider from './ConsultaEndereco/Provider'

const Stack = createNativeStackNavigator()

export default function Estoque({ route }) {
  const { menuIndex: mainMenu } = route.params;
  const profileRef = useRef(null);
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    if(openProfile) {
      profileRef.current.openDrawer();
    }
  },[openProfile])

  const navigationView = () => (
    <Profile />
  );

  return (
    <SafeAreaView style={styles.container}>
      <DrawerLayoutAndroid
          ref={profileRef}
          drawerWidth={300}
          drawerPosition='left'
          drawerLockMode="locked-closed"
          onDrawerClose={() => profileRef.current.closeDrawer()}
          renderNavigationView={navigationView}>
        <Stack.Navigator
          initialRouteName="TopTabs"
          screenOptions={{
            headerBackTitleVisible: false,
            headerTintColor: colors['gray-500'],
            headerStyle: { backgroundColor: colors['green-300'] },
            headerRight: () => (
              <>
                <ProfileButton setOpenProfile={setOpenProfile} />
                <ConfigButton />
              </>
            ),
          }}
        >
          <Stack.Screen
            name="TopTabs"
            component={TopTabs}
            options={{
              title: 'Estoque',
            }}
            initialParams={{ mainMenu, bottomTab: 'Estoque' }}
          />

          <Stack.Screen
            name="Enderecamento"
            component={EnderecamentoRProvider}
            options={{
              headerShown: false,
              title: 'Endereçamento',
            }}
          />

          <Stack.Screen
            name="Transferencia"
            component={TransferenciaRProvider}
            options={{
              headerShown: false,
              title: 'Transferência',
            }}
          />

          <Stack.Screen
            name="ConsultaProdutoProvider"
            component={ConsultaProdutoProvider}
            options={{
              headerShown: false,
              title: 'Consultra de Produto',
            }}
          />

          <Stack.Screen
            name="ConsultaEnderecoProvider"
            component={ConsultaEnderecoProvider}
            options={{
              headerShown: false,
              title: 'Consultra de Endereço',
            }}
          />
        </Stack.Navigator>
      </DrawerLayoutAndroid>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['gray-50'],
  },
})
