import { View, Text, TouchableOpacity } from "react-native";
import { useUser } from "../../hooks/user";

export default function Profile({ navigation,setOpenProfile }) {
    const { user } = useUser()

    function handleLogout() {
      setOpenProfile(false)
      navigation.popToTop()
    }
    
    return <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 64, paddingHorizontal: 16 }}>
        <View>
          <Text style={{ color: "#111" }}><Text style={{ fontWeight: 'bold' }}>{user.nome}</Text> - {user.grupo[1]}</Text>
        </View>
        <TouchableOpacity onPress={() => handleLogout()} style={{ backgroundColor: "#efefef", borderWidth: 1, borderColor: '#ccc',borderRadius: 8, padding: 8, overflow: 'hidden' }}>
          <Text style={{ color: "#111", fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </View>
}