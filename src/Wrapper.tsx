// styles
import { ThemeProvider } from 'styled-components'
import { darkTheme } from './styles/themes/dark'
import { lightTheme } from './styles/themes/light'
import { GlobalStyle } from './styles/global'

// routes
import { BrowserRouter } from 'react-router-dom'
import { Router } from './Router'

// contexts
import { UsersContextProvider } from './contexts/UsersContext'
import { ChecklistsContextProvider } from './contexts/ChecklistsContext'
import { AllDataContextProvider } from './contexts/AllDataContext'
import { ToastContextProvider } from './contexts/ToastContext'

import { useState } from 'react'
import { ThemeContextProvider, ThemeType } from './contexts/ThemeContext'
import 'react-toastify/dist/ReactToastify.css'
import ScrollToTop from './utils/ScrollToTop'

export function Wrapper() {
  const [theme, setTheme] = useState<ThemeType>('light')
  const changeTheme = (theme: ThemeType) => {
    setTheme(theme)
  }

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <BrowserRouter>
        <ThemeContextProvider setThemeInput={changeTheme} themeInput={theme}>
          <ToastContextProvider>
            <UsersContextProvider>
              <ChecklistsContextProvider>
                <AllDataContextProvider>
                  <ScrollToTop />
                  <Router />
                </AllDataContextProvider>
              </ChecklistsContextProvider>
            </UsersContextProvider>
          </ToastContextProvider>
        </ThemeContextProvider>
        <GlobalStyle />
      </BrowserRouter>
    </ThemeProvider>
  )
}
