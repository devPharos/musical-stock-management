import { createContext, useContext, useState } from 'react'

export const ReimpressaoContext = createContext({
})

const ReimpressaoProvider = ({ children }) => {

  return (
    <ReimpressaoContext.Provider
      value={{
      }}
    >
      {children}
    </ReimpressaoContext.Provider>
  )
}

const useReimpressao = () => {
  const context = useContext(ReimpressaoContext)

  return context
}

export { ReimpressaoProvider, useReimpressao }
