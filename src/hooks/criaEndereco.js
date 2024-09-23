import { createContext, useContext, useState } from 'react'

export const CriaEnderecoContext = createContext({
})

const CriaEnderecoProvider = ({ children }) => {

  return (
    <CriaEnderecoContext.Provider
      value={{
      }}
    >
      {children}
    </CriaEnderecoContext.Provider>
  )
}

const useCriaEndereco = () => {
  const context = useContext(CriaEnderecoContext)

  return context
}

export { CriaEnderecoProvider, useCriaEndereco }
