import { createContext, useContext, useState } from 'react'

export const DivisaoEtiquetasContext = createContext({
})

const DivisaoEtiquetasProvider = ({ children }) => {

  return (
    <DivisaoEtiquetasContext.Provider
      value={{
      }}
    >
      {children}
    </DivisaoEtiquetasContext.Provider>
  )
}

const useDivisaoEtiquetas = () => {
  const context = useContext(DivisaoEtiquetasContext)

  return context
}

export { DivisaoEtiquetasProvider, useDivisaoEtiquetas }
