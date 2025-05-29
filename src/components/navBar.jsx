import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirige al login
    } catch (err) {
      console.error('❌ Error al cerrar sesión:', err.message);
      alert('Error al cerrar sesión');
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        color: 'inherit',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
        <Button color="inherit" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;