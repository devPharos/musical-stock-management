import { StyleSheet, ImageBackground, ScrollView } from 'react-native'
import CustomButton from '../../components/button'
import { useUser } from '../../hooks/user';

export default function Atualizacoes({ navigation, route }) {
  const { user } = useUser()
  let { bottomTab } = route.params;
  const index100 = user.menus.findIndex(menu => menu.CODIGO === '100')
  const index200 = user.menus.findIndex(menu => menu.CODIGO === '200')
  const index300 = user.menus.findIndex(menu => menu.CODIGO === '300')
  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/bg.png')}
    >
      { bottomTab === 'Recebimento' &&
      <ScrollView style={{ height: '100%' }}>
          {user.menus[index100].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '10').map((menu) => {
            return <CustomButton
              key={menu.CODIGO}
              label={menu.TITULO}
              detail={menu.DESCRICAO || menu.TITULO}
              navigatePath={menu.ROTINA}
              navigation={navigation}
              type="secondary"
            />
      })}
        {/* {user.menus[index100].SUBMENU.findIndex(menu => menu.CODIGO === '104') > -1 &&
        <CustomButton
          label="Ajuste de Produto"
          detail="Altere EAN, peso, medidas e outros dados do produto."
          navigatePath="wAjusteProd"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index100].SUBMENU.findIndex(menu => menu.CODIGO === '101') > -1 &&
        <CustomButton
          label="Recebimento"
          detail="Processo de recebimento de notas fiscais de entrada."
          navigatePath="wConfereNF"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index100].SUBMENU.findIndex(menu => menu.CODIGO === '102') > -1 &&
        <CustomButton
          label="Inspeção Ibanez"
          detail="Processo de inspeção das guitarras e violões da marca Ibanez."
          navigatePath="wIbanez"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index100].SUBMENU.findIndex(menu => menu.CODIGO === '103') > -1 &&
        <CustomButton
          label="Lote x Núm. Série"
          detail="Processo de vínculo de Lote x Números de Séries múltiplos"
          navigatePath="wLoteNumseq"
          navigation={navigation}
          type="secondary"
        />} */}
      </ScrollView>}
      
      { bottomTab === 'Estoque' &&
      <ScrollView style={{ height: '100%' }}>
      {user.menus[index200].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '20').map((menu) => {
        return <CustomButton
          key={menu.CODIGO}
          label={menu.TITULO}
          detail={menu.DESCRICAO || menu.TITULO}
          navigatePath={menu.ROTINA}
          navigation={navigation}
          type="secondary"
        />
      })}
        {/* {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '201') > -1 &&
        <CustomButton
          label="Endereçamento Cx. Master"
          detail="Processo de endereçamento de produtos recém chegados."
          navigatePath="wEnderecar"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '202') > -1 &&
        <CustomButton
          label="Transferência EAN"
          detail="Ttransferência de produtos por EAN."
          navigatePath="wTransferir"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '204') > -1 &&
        <CustomButton
          label="Transferência de Lotes"
          detail="Transferência de produtos por etiqueta de lotes."
          navigatePath="wTransferirLote"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '203') > -1 &&
        <CustomButton
          label="Reimpressão de Etiquetas"
          detail="Rotina de reimpressão de etiquetas."
          navigatePath="wReimpressao"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '205') > -1 &&
        <CustomButton
          label="Divisão de Etiquetas"
          detail="Rotina de divisão de etiquetas."
          navigatePath="wDivisaoEtiq"
          navigation={navigation}
          type="secondary"
        />}
        {user.menus[index200].SUBMENU.findIndex(menu => menu.CODIGO === '206') > -1 &&
        <CustomButton
          label="Criar Endereço"
          detail="Rotina de criação de novos endereços."
          navigatePath="wCriaEnd"
          navigation={navigation}
          type="secondary"
        />} */}
      </ScrollView>}
      { bottomTab === 'Expedicao' &&
      <ScrollView style={{ height: '100%' }}>

{user.menus[index300].SUBMENU.filter(menu => menu.CODIGO.substring(0,2) === '30').map((menu) => {
            return <CustomButton
              key={menu.CODIGO}
              label={menu.TITULO}
              detail={menu.DESCRICAO || menu.TITULO}
              navigatePath={menu.ROTINA}
              navigation={navigation}
              type="secondary"
            />
      })}
        {/* {user.menus[index300].SUBMENU.findIndex(menu => menu.CODIGO === '301') > -1 &&
        <CustomButton
          label="Separação de Pedidos"
          detail="Processo de separação de pedidos de vendas."
          navigatePath="wSeparacao"
          navigation={navigation}
          type="secondary"
        />}

        {user.menus[index300].SUBMENU.findIndex(menu => menu.CODIGO === '302') > -1 &&
        <CustomButton
          label="Conferência de Pedidos"
          detail="Processo de conferência de pedidos de vendas."
          navigatePath="wConferencia"
          navigation={navigation}
          type="secondary"
        />}

        {user.menus[index300].SUBMENU.findIndex(menu => menu.CODIGO === '303') > -1 &&
        <CustomButton
          label="Pesagem"
          detail="Processo de pesagem / ajuste de pesagem de volumes."
          navigatePath="wPesagem"
          navigation={navigation}
          type="secondary"
        />} */}
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
