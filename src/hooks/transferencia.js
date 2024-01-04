import { createContext, useContext, useState } from 'react'

export const TransferenciaContext = createContext({
  originAddress: {
    ARMAZEM: '',
    CODIGO: '',
    ENDERECO: '',
    PRODUTOS: [],
    QTDE: 0,
  },
  setOriginAddress: () => {},
  product: {
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
  setProduct: () => {},
  setDestinationAddress: () => {},
  destinationAddress: {
    ARMAZEM: '',
    CODIGO: '',
    ENDERECO: '',
    PRODUTOS: [],
    QTDE: 0,
  },
})

const TransferenciaProvider = ({ children }) => {
  const [originAddress, setOriginAddress] = useState({
    ARMAZEM: '',
    CODIGO: '',
    ENDERECO: '',
    PRODUTOS: [],
    QTDE: 0,
  })
  const [product, setProduct] = useState({
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
  const [destinationAddress, setDestinationAddress] = useState({
    ARMAZEM: '',
    CODIGO: '',
    ENDERECO: '',
    PRODUTOS: [],
    QTDE: 0,
  })

  return (
    <TransferenciaContext.Provider
      value={{
        originAddress,
        setOriginAddress,
        product,
        setProduct,
        destinationAddress,
        setDestinationAddress,
      }}
    >
      {children}
    </TransferenciaContext.Provider>
  )
}

const useTransferencia = () => {
  const context = useContext(TransferenciaContext)

  return context
}

export { TransferenciaProvider, useTransferencia }
