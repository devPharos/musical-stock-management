import { createContext, useContext, useState } from 'react'

export const EnderecamentoContext = createContext({
  endereco: {
    CAPACIDADE: 0,
    DESCRICAO: '',
    ENDERECO: '',
    PRIORIDADE: '',
    PRODUTOS: [],
  },
  addressing: {
    ARMAZEM: '',
    CODIGO: '',
    ENDERECO: '',
    PRODUTOS: {
      DESCRICAO: '',
      IMAGEM: '',
      PARTNUMBER: '',
    },
    QTDE: 0,
  },
  setAddressing: () => {},
  setEndereco: () => {},
})

const EnderecamentoProvider = ({ children }) => {
  const [addressing, setAddressing] = useState({
    ARMAZEM: '',
    CODIGO: '',
    ENDERECO: '',
    PRODUTOS: {
      DESCRICAO: '',
      IMAGEM: '',
      PARTNUMBER: '',
    },
    QTDE: 0,
  })
  const [endereco, setEndereco] = useState({
    CAPACIDADE: 0,
    DESCRICAO: '',
    ENDERECO: '',
    PRIORIDADE: '',
    PRODUTOS: [],
  })

  return (
    <EnderecamentoContext.Provider
      value={{ addressing, endereco, setAddressing, setEndereco }}
    >
      {children}
    </EnderecamentoContext.Provider>
  )
}

const useEnderecamento = () => {
  const context = useContext(EnderecamentoContext)

  return context
}

export { EnderecamentoProvider, useEnderecamento }
