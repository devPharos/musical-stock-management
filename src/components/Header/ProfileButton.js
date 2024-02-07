import { TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from "../../styles/colors";

export default function ProfileButton({ setOpenProfile }) {
    return (
    <TouchableOpacity style={{ marginRight: 16 }} onPress={() => setOpenProfile(true)}>
        <Icon name="person-circle-outline" size={24} color={colors['gray-500']} />
    </TouchableOpacity>
    )
}