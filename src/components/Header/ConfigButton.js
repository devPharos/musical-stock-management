import { Alert, Linking, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { colors } from "../../styles/colors";
import { useUser } from "../../hooks/user";

export default function ConfigButton({ navigation }) {
    const { APP_VERSION, ambiente } = useUser()
    return (
        <>
    <TouchableOpacity style={{ marginRight: 8, padding: 8 }} onPress={() => Alert.alert('Informações',`Versão: ${APP_VERSION}\nAmbiente: ${ambiente}`)}>
        <Icon name="cog-outline" size={24} color={colors['gray-500']} />
    </TouchableOpacity>
    <TouchableOpacity style={{ marginRight: 8, padding: 8 }} onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.musicalexpress.stockmanagement&hl=en-US&ah=UahlGVl7utWRyNVC5UElKjKp8wI')}>
        <Icon name="sync-sharp" size={24} color={colors['gray-500']} />
    </TouchableOpacity>
    {/* <TouchableOpacity onPress={() => navigation.push('wBuscaEnd')} style={{ borderRadius: 16, width: 32, height: 32, backgroundColor: colors['gray-500'], justifyContent: 'center', alignItems: 'center' }}>
         <Icon name="search" size={16} color='#FFF' />
    </TouchableOpacity> */}
    </>
    )
}