import { View, Text } from "react-native";
import { useUser } from "../../hooks/user";

export default function Profile() {
    const { user } = useUser()
    
    return <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 64, paddingHorizontal: 16 }}>
        <View>
          <Text style={{ color: "#111" }}><Text style={{ fontWeight: 'bold' }}>{user.nome}</Text> - {user.grupo[1]}</Text>
        </View>
      </View>
}