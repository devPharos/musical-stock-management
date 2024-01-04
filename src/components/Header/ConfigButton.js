import { TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from "../../styles/colors";

export default function ConfigButton() {
    return (
    <TouchableOpacity style={{ marginRight: 16 }} onPress={() => alert(`Versão 1.0.0`)}>
        <Icon name="cog-outline" size={24} color={colors['gray-500']} />
    </TouchableOpacity>
    )
}