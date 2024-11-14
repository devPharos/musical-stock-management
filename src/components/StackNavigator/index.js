import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import TopTabs from '../TopTabs';
import IbanezRootProvider from '../../screens/Recebimento/Ibanez/Provider';
import EmbarquesRootProvider from '../../screens/Recebimento/Embarques/Provider';
import { useUser } from '../../hooks/user';
import { colors } from '../../styles/colors';
import ConfigButton from '../Header/ConfigButton';
import EnderecamentoRProvider from '../../screens/Estoque/Enderecamento/Provider';
import TransferenciaRProvider from '../../screens/Estoque/TransferenciaEAN/Provider';
import LoteNumseqRootProvider from '../../screens/Recebimento/LoteNumseq/Provider';
import { TouchableOpacity } from 'react-native';
import ReimpressaoRProvider from '../../screens/Estoque/Reimpressao/Provider';
import SeparacaoRProvider from '../../screens/Expedicao/Separacao/Provider';
import TransferenciaLoteRProvider from '../../screens/Estoque/TransferenciaLote/Provider';
import RecebimentoRootProvider from '../../screens/Recebimento/Conferencia/Provider';
import DivisaoEtiquetasRProvider from '../../screens/Estoque/DivisaoEtiquetas/Provider';
import AjusteProdutoRProvider from '../../screens/Recebimento/AjusteProduto/Provider';
import CriaEnderecoRProvider from '../../screens/Estoque/CriaEndereco/Provider';
import ConferenciaRProvider from '../../screens/Expedicao/Conferencia/Provider';
import PesagemRProvider from '../../screens/Expedicao/Pesagem/Provider';
import FilaExpedicaoRProvider from '../../screens/Expedicao/Expedicao/Provider';
import EmbarqueRProvider from '../../screens/Expedicao/Embarque/Provider';
import EtiquetaNotaRProvider from '../../screens/Expedicao/EtiquetaNota/Provider';

const Stack = createNativeStackNavigator()

const StackNavigator = ({ navigation, mainMenu, mainRotina }) => {
    const { ambiente } = useUser();
    
  return <Stack.Navigator
  initialRouteName="TopTabs"
  screenOptions={{
    headerBackTitleVisible: false,
    headerTintColor: colors['gray-500'],
    headerStyle: { backgroundColor: ambiente === 'producao' ? colors['green-300'] : colors['blue-300'] },
    headerRight: () => (
      <>
        <ConfigButton navigation={navigation} />
        <TouchableOpacity onPress={() => navigation.push('Login')} style={{margin: 8, padding: 8 }}>
            <Icon name="exit-outline" size={24} color={colors['gray-500']} />
        </TouchableOpacity>
      </>
    ),
  }}
>   
    {mainRotina === 'Recebimento' && <Stack.Group>
        <Stack.Screen
        name="TopTabs"
        component={TopTabs}
        options={{
        title: 'Recebimento',
        }}
        initialParams={{ mainMenu, bottomTab: 'Recebimento' }}
        />
        <Stack.Screen
        name="wAjusteProd"
        component={AjusteProdutoRProvider}
        options={{
        headerShown: false,
        title: 'Ajuste de Produto',
        }}
        />
        <Stack.Screen
        name="wConfereNF"
        component={RecebimentoRootProvider}
        options={{
        headerShown: false,
        title: 'Recebimento',
        }}
        />
        <Stack.Screen
        name="wIbanez"
        component={IbanezRootProvider}
        options={{
        headerShown: false,
        title: 'Inspeção Ibanez',
        }}
        />
        <Stack.Screen
        name="wLoteNumseq"
        component={LoteNumseqRootProvider}
        options={{
        headerShown: false,
        title: 'Lote x Núm. Seq.',
        }}
        />
        <Stack.Screen
        name="wEmbarques"
        component={EmbarquesRootProvider}
        options={{
        headerShown: false,
        title: 'Embarques Futuros',
        }}
        />
    </Stack.Group>}
    {mainRotina === 'Estoque' && <Stack.Group>
        <Stack.Screen
            name="TopTabsEstoque"
            component={TopTabs}
            options={{
                title: 'Estoque',
            }}
            initialParams={{ mainMenu, bottomTab: 'Estoque' }}
            />

            <Stack.Screen
            name="wEnderecar"
            component={EnderecamentoRProvider}
            options={{
                headerShown: false,
                title: 'Endereçamento',
            }}
            />

            <Stack.Screen
            name="wTransferir"
            component={TransferenciaRProvider}
            options={{
                headerShown: false,
                title: 'Transferência EAN',
            }}
            />

            <Stack.Screen
            name="wTransferirLote"
            component={TransferenciaLoteRProvider}
            options={{
                headerShown: false,
                title: 'Transferência de Lote',
            }}
            />

            <Stack.Screen
            name="wReimpressao"
            component={ReimpressaoRProvider}
            options={{
                headerShown: false,
                title: 'Reimpressão',
            }}
            />

            <Stack.Screen
            name="wDivisaoEtiq"
            component={DivisaoEtiquetasRProvider}
            options={{
                headerShown: false,
                title: 'Divisão de Etiquetas',
            }}
            />
            <Stack.Screen
            name="wCriaEnd"
            component={CriaEnderecoRProvider}
            options={{
                headerShown: false,
                title: 'Criação de Endereço',
            }}
            />
            </Stack.Group>}
            {mainRotina === 'Expedicao' && <Stack.Group>
                <Stack.Screen
                    name="TopTabsExpedicao"
                    component={TopTabs}
                    options={{
                        title: 'Expedição',
                    }}
                    initialParams={{ mainMenu, bottomTab: 'Expedicao' }}
                    />
                    <Stack.Screen
                    name="wSeparacao"
                    component={SeparacaoRProvider}
                    options={{
                        headerShown: false,
                        title: 'Separação',
                    }}
                    />
                    <Stack.Screen
                    name="wConferencia"
                    component={ConferenciaRProvider}
                    options={{
                        headerShown: false,
                        title: 'Conferência',
                    }}
                    />
                    <Stack.Screen
                    name="wPesagem"
                    component={PesagemRProvider}
                    options={{
                        headerShown: false,
                        title: 'Pesagem',
                    }}
                    />
                    <Stack.Screen
                    name="wFilaExpedicao"
                    component={FilaExpedicaoRProvider}
                    options={{
                        headerShown: false,
                        title: 'Fila de Expedição',
                    }}
                    />
                    <Stack.Screen
                    name="wEmbarque"
                    component={EmbarqueRProvider}
                    options={{
                        headerShown: false,
                        title: 'Embarque de Pedidos',
                    }}
                    />
                    <Stack.Screen
                    name="wEtiquetaNota"
                    component={EtiquetaNotaRProvider}
                    options={{
                        headerShown: false,
                        title: 'Etiqueta de Nota',
                    }}
                    />
            </Stack.Group>}
  
</Stack.Navigator>;
}

export default StackNavigator;