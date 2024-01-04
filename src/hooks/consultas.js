import { createContext, useContext, useState } from 'react'

export const ConsultasContext = createContext({
  label: {
    ARMAZEM: '',
    CODIGO: '',
    DATANASC: '',
    FORNECEDOR: '',
    LOJAFOR: '',
    NOTAENT: '',
    NUMSEQ: '',
    QTDE: 0,
    SERIEENT: '',
    PRODUTOS: [],
  },
  product: {
    ARMAZEM: '',
    CODIGO: '',
    DATANASC: '',
    FORNECEDOR: '',
    LOJAFOR: '',
    NOTAENT: '',
    NUMSEQ: '',
    QTDE: 0,
    SERIEENT: '',
    PRODUTOS: [],
  },
  setProduct: () => {},
  setLabel: () => {},
  address: {
    CAPACIDADE: 0,
    DESCRICAO: '',
    ENDERECO: '',
    PRIORIDADE: '',
  },
  setAddress: () => {},
})

const ConsultasProvider = ({ children }) => {
  const [label, setLabel] = useState({
    ARMAZEM: '',
    CODIGO: '',
    DATANASC: '',
    FORNECEDOR: '',
    LOJAFOR: '',
    NOTAENT: '',
    NUMSEQ: '',
    QTDE: 0,
    SERIEENT: '',
    PRODUTOS: [],
  })
  const [address, setAddress] = useState({
    CAPACIDADE: 0,
    DESCRICAO: '',
    ENDERECO: '',
    PRIORIDADE: '',
  })
  const [product, setProduct] = useState({
    ARMAZEM: '',
    CODIGO: '',
    DATANASC: '',
    FORNECEDOR: '',
    LOJAFOR: '',
    NOTAENT: '',
    NUMSEQ: '',
    QTDE: 0,
    SERIEENT: '',
    PRODUTOS: [],
  })

  return (
    <ConsultasContext.Provider
      value={{ label, setLabel, address, setAddress, product, setProduct }}
    >
      {children}
    </ConsultasContext.Provider>
  )
}

const useConsultas = () => {
  const context = useContext(ConsultasContext)

  return context
}

export { ConsultasProvider, useConsultas }
