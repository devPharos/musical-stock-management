import DrawerProfile from "../components/DrawerProfile";

export default function Rotina({ route, navigation }) {
  let { menuIndex: mainMenu, acessoRecebimento, acessoEstoque, acessoExpedicao } = route.params;
  let mainRotina = 'Recebimento';
  if(mainMenu === 0 && !acessoRecebimento && acessoEstoque) {
    mainRotina = 'Estoque';
  } else if(mainMenu === 0 && !acessoRecebimento && !acessoEstoque && acessoExpedicao) {
    mainRotina = 'Expedicao';
  } else if(mainMenu === 1 && acessoRecebimento && acessoEstoque) {
    mainRotina = 'Estoque';
  } else if(mainMenu === 1 && !acessoRecebimento && acessoEstoque && acessoExpedicao) {
    mainRotina = 'Expedicao';
  } else if(mainMenu === 1 && acessoRecebimento && !acessoEstoque && acessoExpedicao) {
    mainRotina = 'Expedicao';
  } else if(mainMenu === 2 && acessoRecebimento && acessoEstoque && acessoExpedicao) {
    mainRotina = 'Expedicao';
  }
  
  if(mainMenu === 1 && !acessoRecebimento && acessoEstoque && !acessoExpedicao) {
    mainMenu = 0;
  }
  if(mainMenu === 2 && !acessoExpedicao && acessoEstoque) {
    mainMenu = 1;
  }


  return <>
  <DrawerProfile navigation={navigation} mainRotina={mainRotina} mainMenu={mainMenu} acessoEstoque={acessoEstoque} acessoExpedicao={acessoExpedicao} acessoRecebimento={acessoRecebimento} />
    
  </>
}
