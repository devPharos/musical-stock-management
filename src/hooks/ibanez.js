import { createContext, useContext } from 'react'

export const IbanezContext = createContext()

const IbanezProvider = ({ children }) => {

  return (
    <IbanezContext.Provider
      value={{ }}
    >
      {children}
    </IbanezContext.Provider>
  )
}

const useIbanez = () => {
  const context = useContext(IbanezContext)

  return context
}

export { IbanezProvider, useIbanez }
