import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import TopTabs from '../TopTabs';
import ConferenciaRootProvider from '../../screens/Recebimento/Conferencia/Provider';
import IbanezRootProvider from '../../screens/Recebimento/Ibanez/Provider';
import EmbarquesRootProvider from '../../screens/Recebimento/Embarques/Provider';
import { useUser } from '../../hooks/user';
import { colors } from '../../styles/colors';
import ProfileButton from '../Header/ProfileButton';
import ConfigButton from '../Header/ConfigButton';
import EnderecamentoRProvider from '../../screens/Estoque/Enderecamento/Provider';
import TransferenciaRProvider from '../../screens/Estoque/Transferencia/Provider';
import ConsultaProdutoProvider from '../../screens/Estoque/ConsultaProduto/Provider';
import ConsultaEnderecoProvider from '../../screens/Estoque/ConsultaEndereco/Provider';
import LoteNumseqRootProvider from '../../screens/Recebimento/LoteNumseq/Provider';

const Stack = createNativeStackNavigator()

const StackNavigator = ({ mainMenu, setOpenProfile }) => {
    const { ambiente } = useUser();
  return <Stack.Navigator
  initialRouteName="TopTabs"
  screenOptions={{
    headerBackTitleVisible: false,
    headerTintColor: colors['gray-500'],
    headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
    headerRight: () => (
      <>
        <ProfileButton setOpenProfile={setOpenProfile} />
        <ConfigButton />
      </>
    ),
  }}
>
    { mainMenu == 0 && <Stack.Group>
        <Stack.Screen
        name="TopTabs"
        component={TopTabs}
        options={{
        title: 'Recebimento',
        }}
        initialParams={{ mainMenu, bottomTab: 'Recebimento' }}
    />
    <Stack.Screen
        name="Conferencia"
        component={ConferenciaRootProvider}
        options={{
        headerShown: false,
        title: 'Conferência',
        }}
    />
    <Stack.Screen
        name="Ibanez"
        component={IbanezRootProvider}
        options={{
        headerShown: false,
        title: 'Inspeção Ibanez',
        }}
    />
    <Stack.Screen
        name="LoteNumseq"
        component={LoteNumseqRootProvider}
        options={{
        headerShown: false,
        title: 'Lote x Núm. Seq.',
        }}
    />
    <Stack.Screen
        name="Embarques"
        component={EmbarquesRootProvider}
        options={{
        headerShown: false,
        title: 'Embarques Futuros',
        }}
    />
    </Stack.Group>}
    { mainMenu === 1 && <Stack.Group>
        <Stack.Screen
            name="TopTabs"
            component={TopTabs}
            options={{
                title: 'Estoque',
            }}
            initialParams={{ mainMenu, bottomTab: 'Estoque' }}
            />

            <Stack.Screen
            name="Enderecamento"
            component={EnderecamentoRProvider}
            options={{
                headerShown: false,
                title: 'Endereçamento',
            }}
            />

            <Stack.Screen
            name="Transferencia"
            component={TransferenciaRProvider}
            options={{
                headerShown: false,
                title: 'Transferência',
            }}
            />

            <Stack.Screen
            name="ConsultaProdutoProvider"
            component={ConsultaProdutoProvider}
            options={{
                headerShown: false,
                title: 'Consultra de Produto',
            }}
            />

            <Stack.Screen
            name="ConsultaEnderecoProvider"
            component={ConsultaEnderecoProvider}
            options={{
                headerShown: false,
                title: 'Consultra de Endereço',
            }}
            />
    </Stack.Group>}
  
</Stack.Navigator>;
}

export default StackNavigator;