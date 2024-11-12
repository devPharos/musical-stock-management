import React, { useEffect, useRef, useState } from 'react';
import { DrawerLayoutAndroid, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import StackNavigator from '../StackNavigator';
import Icon from 'react-native-vector-icons/Ionicons'
import ConsultaProduto from '../../screens/Estoque/ConsultaProduto';
import { colors } from "../../styles/colors";

export default function DrawerProfile({ navigation, mainMenu, mainRotina, acessoRecebimento, acessoEstoque, acessoExpedicao }) {
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
      <ConsultaProduto navigation={navigation} setOpenProfile={setOpenProfile} />
    );
  return <SafeAreaView style={styles.container}>
    <DrawerLayoutAndroid
  ref={profileRef}
  drawerWidth={300}
  drawerPosition='left'
  onDrawerClose={handleCloseDrawer}
  unmountOnBlur={true}
  renderNavigationView={navigationView}>
  <StackNavigator navigation={navigation} mainMenu={mainMenu} mainRotina={mainRotina} setOpenProfile={setOpenProfile} acessoEstoque={acessoEstoque} acessoExpedicao={acessoExpedicao} acessoRecebimento={acessoRecebimento} />
  <TouchableOpacity onPress={() => profileRef.current.openDrawer()} style={{ position: 'absolute', left: 0, bottom: 10, borderTopRightRadius: 25, borderBottomRightRadius: 25, width: 45, height: 45, backgroundColor: colors['gray-500'], justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="search" size={22} color='#FFF' />
    </TouchableOpacity>
</DrawerLayoutAndroid>
</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})