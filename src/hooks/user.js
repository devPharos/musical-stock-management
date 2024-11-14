import { createContext, useContext, useEffect, useState } from 'react'
import { API_URL } from '../../config'
import axios from 'axios'

const defaultUser = {
  access_token: '',
  username: '',
}

export const UserContext = createContext(defaultUser)

const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ refresh_token: null })
  const [selectedPrinter, setSelectedPrinter] = useState(null)
  const APP_VERSION = '1.0.74'
  const [ambiente, setAmbiente] = useState('producao')
  const [baseURL, setBaseURL] = useState(API_URL)

  async function refreshAuthentication() {
    await axios
      .post(`${baseURL}/api/oauth2/v1/token`, null, {
        params: {
          grant_type: 'refresh_token',
          refresh_token: user.refresh_token
        },
      })
      .then(async (response) => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        setUser({...user, refresh_token: response.data.refresh_token});
      })
  }

  const value = {
    APP_VERSION,
    user,
    setUser,
    refreshAuthentication,
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
