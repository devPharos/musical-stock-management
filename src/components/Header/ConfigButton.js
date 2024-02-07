import { TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from "../../styles/colors";
import { useUser } from "../../hooks/user";

export default function ConfigButton() {
    const { APP_VERSION } = useUser()
    return (
    <TouchableOpacity style={{ marginRight: 16 }} onPress={() => alert(`Versão ${APP_VERSION}`)}>
        <Icon name="cog-outline" size={24} color={colors['gray-500']} />
    </TouchableOpacity>
    )
}