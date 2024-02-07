import { createContext, useContext } from 'react'

export const EmbarquesContext = createContext()

const EmbarquesProvider = ({ children }) => {

  return (
    <EmbarquesContext.Provider
      value={{ }}
    >
      {children}
    </EmbarquesContext.Provider>
  )
}

const useEmbarques = () => {
  const context = useContext(EmbarquesContext)

  return context
}

export { EmbarquesProvider, useEmbarques }
