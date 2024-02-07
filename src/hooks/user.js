import { createContext, useContext, useState } from 'react'

const defaultUser = {
  access_token: '',
  username: '',
}

export const UserContext = createContext(defaultUser)

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [selectedPrinter, setSelectedPrinter] = useState(null)
  const APP_VERSION = '1.0.1'

  const value = {
    APP_VERSION,
    user,
    setUser,
    selectedPrinter,
    setSelectedPrinter,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

const useUser = () => {
  const context = useContext(UserContext)

  return context
}

export { UserProvider, useUser }
