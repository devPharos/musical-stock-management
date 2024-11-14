import { createContext, useContext, useState } from 'react'

export const EtiquetaNotaContext = createContext({
    etiquetaNota: {
    IMPRESSORA: '',
    DANFE: ''
  },
  setEtiquetaNota: () => {},
})

const EtiquetaNotaProvider = ({ children }) => {
  const [etiquetaNota, setEtiquetaNota] = useState({
    IMPRESSORA: '',
    DANFE: ''
  })

  return (
    <EtiquetaNotaContext.Provider
      value={{
        etiquetaNota, setEtiquetaNota
      }}
    >
      {children}
    </EtiquetaNotaContext.Provider>
  )
}

const useEtiquetaNota = () => {
  const context = useContext(EtiquetaNotaContext)

  return context
}

export { EtiquetaNotaProvider, useEtiquetaNota }
