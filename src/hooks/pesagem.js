import { createContext, useContext, useState } from 'react'

export const PesagemContext = createContext({
})

const PesagemProvider = ({ children }) => {

  return (
    <PesagemContext.Provider
      value={{
      }}
    >
      {children}
    </PesagemContext.Provider>
  )
}

const usePesagem = () => {
  const context = useContext(PesagemContext)

  return context
}

export { PesagemProvider, usePesagem }
