import { useEffect } from "react";
import DrawerProfile from "../components/DrawerProfile";

export default function Rotina({ route, navigation }) {
  let { menuIndex: mainMenu, acessoRecebimento, acessoEstoque, acessoExpedicao } = route.params;
    

  if(mainMenu === 1 && !acessoRecebimento && acessoEstoque) {
    mainMenu = 0;
  }
  if(mainMenu === 2 && !acessoExpedicao && acessoEstoque) {
    mainMenu = 1;
  }

  return <>
  <DrawerProfile navigation={navigation} mainMenu={mainMenu} acessoEstoque={acessoEstoque} acessoExpedicao={acessoExpedicao} acessoRecebimento={acessoRecebimento} />
    
  </>
}
