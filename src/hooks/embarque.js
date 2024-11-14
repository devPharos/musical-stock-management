import { createContext, useContext, useState } from 'react'

export const EmbarqueContext = createContext({
    embarque: {
    VOLUMES: [],
    DANFE: ''
  },
  setEmbarque: () => {},
})

const EmbarqueProvider = ({ children }) => {
  const [embarque, setEmbarque] = useState({
    VOLUMES: [],
    DANFE: ''
  })

  return (
    <EmbarqueContext.Provider
      value={{
        embarque, setEmbarque
      }}
    >
      {children}
    </EmbarqueContext.Provider>
  )
}

const useEmbarque = () => {
  const context = useContext(EmbarqueContext)

  return context
}

export { EmbarqueProvider, useEmbarque }
