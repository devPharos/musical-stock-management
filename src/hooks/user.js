import { createContext, useContext, useState } from 'react'
import { API_URL } from '../../config'

const defaultUser = {
  access_token: '',
  username: '',
}

export const UserContext = createContext(defaultUser)

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [selectedPrinter, setSelectedPrinter] = useState(null)
  const APP_VERSION = '1.0.4'
  const [ambiente, setAmbiente] = useState('producao')
  const [baseURL, setBaseURL] = useState(API_URL)

  const value = {
    APP_VERSION,
    user,
    setUser,
    selectedPrinter,
    setSelectedPrinter,
    ambiente,
    setAmbiente,
    baseURL,
    setBaseURL
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

const useUser = () => {
  const context = useContext(UserContext)

  return context
}

export { UserProvider, useUser }
