import DrawerProfile from "../components/DrawerProfile";

export default function Rotina({ route, navigation }) {
  const { menuIndex: mainMenu } = route.params;

  return <DrawerProfile navigation={navigation} mainMenu={mainMenu} />
}
