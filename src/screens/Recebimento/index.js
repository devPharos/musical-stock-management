import { useEffect, useRef, useState } from 'react'
import { StyleSheet, SafeAreaView, DrawerLayoutAndroid } from 'react-native'
import { colors } from '../../styles/colors'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TopTabs from '../../components/TopTabs/index'
import ConferenciaRootProvider from './Conferencia/Provider'
import IbanezRootProvider from './Ibanez/Provider'
import EmbarquesRootProvider from './Embarques/Provider'
import Profile from '../Profile'
import ProfileButton from '../../components/Header/ProfileButton'
import ConfigButton from '../../components/Header/ConfigButton'

const Stack = createNativeStackNavigator()

export default function Recebimento({ route }) {
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
              title: 'Recebimento',
            }}
            initialParams={{ mainMenu, bottomTab: 'Recebimento' }}
          />
          <Stack.Screen
            name="Conferencia"
            component={ConferenciaRootProvider}
            options={{
              headerShown: false,
              title: 'Conferência',
            }}
          />
          <Stack.Screen
            name="Ibanez"
            component={IbanezRootProvider}
            options={{
              headerShown: false,
              title: 'Inspeção Ibanez',
            }}
          />
          <Stack.Screen
            name="Embarques"
            component={EmbarquesRootProvider}
            options={{
              headerShown: false,
              title: 'Embarques Futuros',
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
  },
})
