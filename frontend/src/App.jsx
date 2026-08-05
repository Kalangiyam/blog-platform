import { RouterProvider } from 'react-router/dom'

import AuthProvider from './features/auth/context/AuthProvider.jsx'
import { router } from './routes/router.jsx'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
