import { createContext, useContext, useState } from 'react'

export const SeparacaoContext = createContext({
})

const SeparacaoProvider = ({ children }) => {

  return (
    <SeparacaoContext.Provider
      value={{
      }}
    >
      {children}
    </SeparacaoContext.Provider>
  )
}

const useSeparacao = () => {
  const context = useContext(SeparacaoContext)

  return context
}

export { SeparacaoProvider, useSeparacao }
