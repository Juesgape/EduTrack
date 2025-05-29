import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import {
  Container, Typography, Box, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton
} from '@mui/material';
import NavBar from '../components/navbar';
import ProjectList from '../components/projectList';
import { useProjectsWithMetadata } from '../hooks/useProjectsWithMetaData';

const CoordinatorDashboard = () => {
  const [institution, setInstitution] = useState('');
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    identification: '',
    email: '',
    grade: '',
    role: 'student'
  });

  const { projects, loading: loadingProjects } = useProjectsWithMetadata(institution);

  useEffect(() => {
    const fetchData = async () => {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userSnap.data();
      setInstitution(userData.institution);

      const userQuery = query(
        collection(db, 'users'),
        where('institution', '==', userData.institution),
        where('role', 'in', ['student', 'teacher'])
      );
      const userSnap2 = await getDocs(userQuery);
      setUsers(userSnap2.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchData();
  }, []);

  const handleStatusChange = async (projectId, { status, observation }) => {
    if (!status || !observation) return alert("❗Status and observation required");
    const now = new Date();

    await updateDoc(doc(db, 'projects', projectId), {
      currentStatus: status,
      currentStatusObservation: observation,
      updatedAt: now
    });

    await addDoc(collection(db, `projects/${projectId}/statusHistory`), {
      date: now,
      status,
      observation,
      changedBy: auth.currentUser.uid
    });

    alert("✅ Estado actualizado");
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    if (editingUser) {
      await updateDoc(doc(db, 'users', editingUser.id), {
        ...formData,
        institution
      });
      alert('✅ Usuario actualizado');
    } else {
      await addDoc(collection(db, 'users'), {
        ...formData,
        institution,
        createdAt: new Date()
      });
      alert('✅ Usuario creado');
    }

    setFormData({
      firstName: '',
      lastName: '',
      identification: '',
      email: '',
      grade: '',
      role: 'student'
    });
    setEditingUser(null);

    const userQuery = query(
      collection(db, 'users'),
      where('institution', '==', institution),
      where('role', 'in', ['student', 'teacher'])
    );
    const snap = await getDocs(userQuery);
    setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    await deleteDoc(doc(db, 'users', userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
    alert("🗑️ Usuario eliminado");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <NavBar />
      <Typography variant="h4" gutterBottom>Panel de Coordinador – {institution}</Typography>

      {/* Proyectos */}
      {loadingProjects ? (
        <Typography>Cargando proyectos...</Typography>
      ) : (
        <ProjectList projects={projects} role="coordinator" onStatusChange={handleStatusChange} />
      )}

      <Divider sx={{ my: 6 }} />

      {/* Crear o editar usuario */}
      <Box>
        <Typography variant="h5">
          {editingUser ? '✏️ Editar Usuario' : '➕ Crear Usuario'}
        </Typography>

        <Box component="form" onSubmit={handleUserSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nombre" value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Apellido" value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Identificación" value={formData.identification}
                onChange={(e) => setFormData({ ...formData, identification: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Correo" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </Grid>
            {formData.role === 'student' && (
              <Grid item xs={12}>
                <TextField fullWidth label="Grado" value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })} />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={formData.role} label="Rol"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <MenuItem value="student">Estudiante</MenuItem>
                  <MenuItem value="teacher">Docente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                {editingUser ? 'Actualizar' : 'Crear Usuario'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Tabla de usuarios */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>👥 Usuarios de tu Institución</Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Grado</TableCell>
                <TableCell>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.identification}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.grade || '-'}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => deleteUser(u.id)}>🗑️</IconButton>
                    <IconButton color="primary" onClick={() => {
                      setEditingUser(u);
                      setFormData({
                        firstName: u.firstName,
                        lastName: u.lastName,
                        identification: u.identification,
                        email: u.email,
                        grade: u.grade || '',
                        role: u.role
                      });
                    }}>✏️</IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default CoordinatorDashboard;
