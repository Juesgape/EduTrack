import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Stack
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import NavBar from '../components/navbar';

const StudentDashboard = () => {
    return (
        <Container maxWidth="sm">
        <NavBar />
        <Paper
            elevation={3}
            sx={{
            mt: 8,
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
            }}
        >
            <Stack spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                <SchoolIcon fontSize="large" />
            </Avatar>

            <Typography variant="h4" gutterBottom>
                🎓 ¡Bienvenido, Estudiante!
            </Typography>

            <Typography variant="body1" color="text.secondary">
                Este es tu espacio personal donde podrás ver tus proyectos, avances y más.
            </Typography>
            </Stack>
        </Paper>
        </Container>
    );
};

export default StudentDashboard;