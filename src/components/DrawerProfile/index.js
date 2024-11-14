import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import StackNavigator from '../StackNavigator';

export default function DrawerProfile({ navigation, mainMenu, mainRotina, acessoRecebimento, acessoEstoque, acessoExpedicao }) {

  return <SafeAreaView style={styles.container}>
      <StackNavigator navigation={navigation} mainMenu={mainMenu} mainRotina={mainRotina} acessoEstoque={acessoEstoque} acessoExpedicao={acessoExpedicao} acessoRecebimento={acessoRecebimento} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})