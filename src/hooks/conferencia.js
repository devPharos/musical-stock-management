import { createContext, useContext, useState } from 'react'

export const ConferenciaContext = createContext({
})

const ConferenciaProvider = ({ children }) => {

  return (
    <ConferenciaContext.Provider
      value={{
      }}
    >
      {children}
    </ConferenciaContext.Provider>
  )
}

const useConferencia = () => {
  const context = useContext(ConferenciaContext)

  return context
}

export { ConferenciaProvider, useConferencia }
