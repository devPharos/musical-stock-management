import React, { useEffect, useRef, useState } from 'react';
import { DrawerLayoutAndroid, SafeAreaView, StyleSheet } from 'react-native';
import StackNavigator from '../StackNavigator';
import Profile from '../../screens/Profile';

export default function DrawerProfile({ navigation, mainMenu, acessoRecebimento, acessoEstoque, acessoExpedicao }) {
    const profileRef = useRef(null);
    const [openProfile, setOpenProfile] = useState(false);
  
    useEffect(() => {
      if(openProfile) {
        profileRef.current.openDrawer();
      }
    },[openProfile])
  
    function handleCloseDrawer() {
      profileRef.current.closeDrawer()
      setOpenProfile(false)
    }
  
    const navigationView = () => (
      <Profile navigation={navigation} setOpenProfile={setOpenProfile} />
    );
  return <SafeAreaView style={styles.container}><DrawerLayoutAndroid
  ref={profileRef}
  drawerWidth={300}
  drawerPosition='left'
  onDrawerClose={handleCloseDrawer}
  unmountOnBlur={true}
  renderNavigationView={navigationView}>
  <StackNavigator navigation={navigation} mainMenu={mainMenu} setOpenProfile={setOpenProfile} acessoEstoque={acessoEstoque} acessoExpedicao={acessoExpedicao} acessoRecebimento={acessoRecebimento} />
</DrawerLayoutAndroid></SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})