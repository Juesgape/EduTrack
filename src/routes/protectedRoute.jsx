import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { auth, db } from '../config/firebase'
import { doc, getDoc } from 'firebase/firestore'

const ProtectedRoute = ({ children, role }) => {
  const [allowed, setAllowed] = useState(null)

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser
      if (!user) {
        setAllowed(false)
        return
      }

      const docRef = doc(db, 'users', user.uid)
      const snap = await getDoc(docRef)
      const data = snap.data()

      setAllowed(data?.role === role)
    }

    checkRole()
  }, [role])

  if (allowed === null) return <div>cargando...</div>
  if (!allowed) return <Navigate to="/" />

  return children
}

export default ProtectedRoute