import { createContext, useContext } from 'react'

export const LoteNumseqContext = createContext()

const LoteNumseqProvider = ({ children }) => {

  return (
    <LoteNumseqContext.Provider
      value={{ }}
    >
      {children}
    </LoteNumseqContext.Provider>
  )
}

const useLoteNumseq = () => {
  const context = useContext(LoteNumseqContext)

  return context
}

export { LoteNumseqProvider, useLoteNumseq }
