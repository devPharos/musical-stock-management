import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import { colors } from '../../styles/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { Controller, useForm } from 'react-hook-form'
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { API_URL } from '../../../config'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useUser } from '../../hooks/user'

export default function Login({ navigation }) {
  const [credentialsError, setCredentialsError] = useState(false)
  const [passwordVisibility, setPasswordVisibility] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useUser()

  const APP_VERSION = '1.0.0'

  const logInFormSchema = Yup.object().shape({
      username: Yup.string().required('Digite seu usuário.'),
      password: Yup.string().required('Digite sua senha.')
  })

  const { control,handleSubmit,formState: { errors } } = useForm({ values: { username: 'pharos', password: 'Phr@2023'}, resolver: yupResolver(logInFormSchema) });

  const handleLogin = async ({ username, password }) => {
    axios
      .post(`${API_URL}/rest/api/oauth2/v1/token`, null, {
        params: {
          grant_type: 'password',
          username: username.toLowerCase(),
          password,
        },
      })
      .then((response) => {
        const newUser = {
          access_token: response.data.access_token,
          username: username.toLowerCase(),
        }

        axios
          .get(`${API_URL}/rest/wMenus`, {
            headers: {
              Authorization: `Bearer ${newUser.access_token}`,
            },
          })
          .then(({ data }) => {
            setLoading(false)
            setUser({
              ...user,
              access_token: newUser.access_token,
              username: newUser.username.toLowerCase(),
              grupo: data.GRUPO,
              menus: data.MENUS,
              nome: data.NOME
            })
            navigation.navigate('BottomTabs')
          })

      })
      .catch((error) => {
        if (error) {
          setLoading(false)
          setCredentialsError(true)
        }
      })
  }

  const onSubmit = (data) => {
    setLoading(true)
    handleLogin(data)
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.headerImageContainer}
        source={require('../../assets/background.png')}
      >
        <Image
          style={styles.image}
          source={require('../../assets/logo.png')}
          alt=""
        />
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[{ flex: 1, width: '100%' }, styles.loginContainer]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            <Text style={styles.text}>LOGIN</Text>

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                return (
                  <View style={styles.formContainer}>
                    <View
                      style={
                        error ? styles.inputContainerError : styles.inputContainer
                      }
                    >
                      <Icon
                        color={error ? colors['red-500'] : colors['gray-500']}
                        name="person"
                        size={20}
                      />
                      <TextInput
                        placeholder={'Usuário'}
                        autoCapitalize='none'
                        style={error ? styles.inputError : styles.input}
                        value={value}
                        onChangeText={onChange}
                        placeholderTextColor={
                          error ? colors['red-500'] : colors['gray-300']
                        }
                      />
                    </View>
                    {error && (
                      <Text style={styles.errorMessage}>{error.message}</Text>
                    )}
                  </View>
                )
              }}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                return (
                  <View style={styles.formContainer}>
                    <View
                      style={
                        error ? styles.inputContainerError : styles.inputContainer
                      }
                    >
                      <Icon
                        color={error ? colors['red-500'] : colors['gray-500']}
                        name="key"
                        size={20}
                      />
                      <TextInput
                        placeholder={'Senha'}
                        style={error ? styles.inputError : styles.input}
                        value={value}
                        autoCapitalize='none'
                        onChangeText={onChange}
                        placeholderTextColor={
                          error ? colors['red-500'] : colors['gray-300']
                        }
                        secureTextEntry={!passwordVisibility}
                      />
                      {passwordVisibility ? (
                        <Icon
                          name="eye"
                          color={error ? colors['red-500'] : colors['gray-300']}
                          size={20}
                          onPress={() => setPasswordVisibility(false)}
                        />
                      ) : (
                        <Icon
                          name="eye-off"
                          color={error ? colors['red-500'] : colors['gray-500']}
                          size={20}
                          onPress={() => setPasswordVisibility(true)}
                        />
                      )}
                    </View>
                    {error && (
                      <Text style={styles.errorMessage}>{error.message}</Text>
                    )}
                  </View>
                )
              }}
            />

            {credentialsError && (
              <Text style={styles.errorMessage}>
                Usuário e/ou senha incorreto(s)
              </Text>
            )}

            <Pressable
              disabled={loading}
              style={styles.buttonContainer}
              onPress={handleSubmit(onSubmit)}
            >
              {loading && <ActivityIndicator color={colors.white} />}
              <Text style={styles.buttonLabel}>ACESSAR</Text>
            </Pressable>
            <Text style={styles.versionText}>Versão {APP_VERSION}</Text>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 24,
  },
  headerImageContainer: {
    height: 300,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 190,
    resizeMode: 'contain',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
    gap: 24,
  },
  text: {
    color: colors['green-300'],
    fontSize: 24,
  },
  versionText: {
    color: colors['gray-500'],
  },
  input: {
    flex: 1,
    color: colors['gray-500'],
    height: 56,
  },
  inputError: {
    flex: 1,
    color: colors['red-500'],
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors['gray-50'],
    borderRadius: 30,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,.1)',
    gap: 8,
  },
  inputContainerError: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors['red-50'],
    borderRadius: 90,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors['green-300'],
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonLabel: {
    fontWeight: '700',
    color: colors.white,
  },
  errorMessage: {
    color: colors['red-500'],
    marginLeft: 16,
  },
  formContainer: {
    width: '100%',
    gap: 4,
  },
})
