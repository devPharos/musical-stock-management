import { createContext, useContext, useState } from 'react'

export const FilaExpedicaoContext = createContext({
  fila: {
    VOLUMES: [],
    CODIGO: ''
  },
  setFila: () => {},
})

const FilaExpedicaoProvider = ({ children }) => {
  const [fila, setFila] = useState({
    VOLUMES: [],
    CODIGO: ''
  })

  return (
    <FilaExpedicaoContext.Provider
      value={{
        fila, setFila
      }}
    >
      {children}
    </FilaExpedicaoContext.Provider>
  )
}

const useFilaExpedicao = () => {
  const context = useContext(FilaExpedicaoContext)

  return context
}

export { FilaExpedicaoProvider, useFilaExpedicao }
