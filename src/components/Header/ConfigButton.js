import { Alert, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from "../../styles/colors";
import { useUser } from "../../hooks/user";

export default function ConfigButton() {
    const { APP_VERSION, ambiente } = useUser()
    return (
    <TouchableOpacity style={{ marginRight: 8, padding: 8 }} onPress={() => Alert.alert('Informações',`Versão: ${APP_VERSION}\nAmbiente: ${ambiente}`)}>
        <Icon name="cog-outline" size={24} color={colors['gray-500']} />
    </TouchableOpacity>
    )
}