import { useState } from 'react'
import { auth, db } from '../config/firebase'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Only for register
  const [role, setRole] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [identification, setIdentification] = useState("")
  const [grade, setGrade] = useState("")
  const [institution, setInstitution] = useState("")

  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      await signOut(auth);
      let user;

      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          role,
          firstName,
          lastName,
          email,
          identification,
          grade: role === 'student' ? grade : null,
          institution,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      }

      // Fetch role to redirect
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.data();

      await auth.currentUser.reload();

      if (userData.role === 'student') navigate('/student-dashboard')
      else if (userData.role === 'teacher') navigate('/teacher-dashboard')
      else if (userData.role === 'coordinator') navigate('/coordinator-dashboard')

    } catch (err) {
      console.error("❌ Auth error:", err.message);
      alert("Error: " + err.message);
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
      alert("👋 Logged out");
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("https://i.postimg.cc/fy7vQYp1/image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom align="center">
            {isRegistering ? 'Registro' : 'Inicio de sesión'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correo electrónico"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>

            {isRegistering && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="role-label">Rol</InputLabel>
                    <Select
                      labelId="role-label"
                      value={role}
                      label="Rol"
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <MenuItem value="student">Estudiante</MenuItem>
                      <MenuItem value="teacher">Profesor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Número de identificación"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Institución"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </Grid>

                {role === 'student' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Grado (Ej. 10°)"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                {isRegistering ? 'Registrarse' : 'Iniciar sesión'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  )
}
