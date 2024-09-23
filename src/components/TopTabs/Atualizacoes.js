import { StyleSheet, ImageBackground, ScrollView } from 'react-native'
import CustomButton from '../../components/button'
import { useUser } from '../../hooks/user';

export default function Atualizacoes({ navigation, route }) {
  const { user } = useUser()
  let { mainMenu, bottomTab } = route.params;
  if(user.menus.findIndex(menu => menu.CODIGO === '100') === -1) {
    mainMenu = 0;
  }
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/bg.png')}
    >
      { bottomTab === 'Recebimento' &&
      <ScrollView style={{ height: '100%' }}>
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '104') > -1 &&
        <CustomButton
          label="Ajuste de Produto"
          detail="Altere EAN, peso, medidas e outros dados do produto."
          navigatePath="AjusteProduto"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '101') > -1 &&
        <CustomButton
          label="Recebimento"
          detail="Processo de recebimento de notas fiscais de entrada."
          navigatePath="RecebimentoConferencia"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '102') > -1 &&
        <CustomButton
          label="Inspeção Ibanez"
          detail="Processo de inspeção das guitarras e violões da marca Ibanez."
          navigatePath="Ibanez"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '103') > -1 &&
        <CustomButton
          label="Lote x Núm. Série"
          detail="Processo de vínculo de Lote x Números de Séries múltiplos"
          navigatePath="LoteNumseq"
          navigation={navigation}
          type="secondary"
        />}
      </ScrollView>}
      
      { bottomTab === 'Estoque' &&
      <ScrollView style={{ height: '100%' }}>
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '201') > -1 &&
        <CustomButton
          label="Endereçamento Cx. Master"
          detail="Processo de endereçamento de produtos recém chegados."
          navigatePath="Enderecamento"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '202') > -1 &&
        <CustomButton
          label="Transferência EAN"
          detail="Ttransferência de produtos por EAN."
          navigatePath="Transferencia"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '204') > -1 &&
        <CustomButton
          label="Transferência de Lotes"
          detail="Transferência de produtos por etiqueta de lotes."
          navigatePath="TransferenciaLote"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '203') > -1 &&
        <CustomButton
          label="Reimpressão de Etiquetas"
          detail="Rotina de reimpressão de etiquetas."
          navigatePath="Reimpressao"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '205') > -1 &&
        <CustomButton
          label="Divisão de Etiquetas"
          detail="Rotina de divisão de etiquetas."
          navigatePath="DivisaoEtiquetas"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '206') > -1 &&
        <CustomButton
          label="Criar Endereço"
          detail="Rotina de criação de novos endereços."
          navigatePath="CriaEndereco"
          navigation={navigation}
          type="secondary"
        />}
      </ScrollView>}
      
      { bottomTab === 'Expedicao' &&
      <ScrollView style={{ height: '100%' }}>
        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '301') > -1 &&
        <CustomButton
          label="Separação de Pedidos"
          detail="Processo de separação de pedidos de vendas."
          navigatePath="Separacao"
          navigation={navigation}
          type="secondary"
        />}

        {user.menus[mainMenu].SUBMENU.findIndex(menu => menu.CODIGO === '302') > -1 &&
        <CustomButton
          label="Conferência de Pedidos"
          detail="Processo de conferência de pedidos de vendas."
          navigatePath="Conferencia"
          navigation={navigation}
          type="secondary"
        />}
        </ScrollView>}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
})
