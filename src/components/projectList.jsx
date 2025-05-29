import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Grid, Select,
  MenuItem, FormControl, InputLabel, Button, Checkbox, ListItemText,
  OutlinedInput, Accordion, AccordionDetails, AccordionSummary
} from '@mui/material';
import {ExpandMore} from '@mui/icons-material'
import { auth, db } from '../config/firebase';
import {
  collection, doc, addDoc, getDocs, query, where, getDoc
} from 'firebase/firestore';

const ProjectList = ({ projects, role, onStatusChange }) => {
  const [filters, setFilters] = useState({
    name: '',
    student: '',
    teacher: '',
    status: ''
  });

  const [statusUpdate, setStatusUpdate] = useState({});
  const [students, setStudents] = useState([]);
  const [institution, setInstitution] = useState('');

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    area: '',
    objectives: '',
    schedule: '',
    budget: '',
    additionalObservations: ''
  });

  useEffect(() => {
    const loadStudents = async () => {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const user = userSnap.data();
      if (!user) return;

      setInstitution(user.institution);

      const studentQuery = query(
        collection(db, 'users'),
        where('institution', '==', user.institution),
        where('role', '==', 'student')
      );
      const snap = await getDocs(studentQuery);
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    if (role === 'teacher') loadStudents();
  }, [role]);

  const [statusHistories, setStatusHistories] = useState({});

  const loadStatusHistory = async (projectId) => {
    if (statusHistories[projectId]) return;

  const snap = await getDocs(collection(db, `projects/${projectId}/statusHistory`));
  const history = snap.docs.map(doc => doc.data()).sort((a, b) => b.date.toMillis() - a.date.toMillis());

  setStatusHistories(prev => ({ ...prev, [projectId]: history }));
 };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      return (
        p.title?.toLowerCase().includes(filters.name.toLowerCase()) &&
        p.students?.some(s => s.toLowerCase().includes(filters.student.toLowerCase())) &&
        p.teacherName?.toLowerCase().includes(filters.teacher.toLowerCase()) &&
        (filters.status === '' || p.currentStatus === filters.status)
      );
    });
  }, [projects, filters]);

  const handleCreateProject = async () => {
    const { title, area, objectives, schedule, budget, additionalObservations } = formData;
    if (!title || !area || !objectives || !budget) {
      return alert('❗ Completa todos los campos obligatorios');
    }

    const now = new Date();

    try {
      const newProjectRef = await addDoc(collection(db, 'projects'), {
        title,
        area,
        objectives,
        schedule,
        budget: parseFloat(budget),
        additionalObservations,
        institution,
        teacherId: auth.currentUser.uid,
        currentStatus: 'Formulation',
        currentStatusObservation: 'Proyecto en etapa inicial',
        createdAt: now,
        updatedAt: now
      });

      for (let studentId of selectedStudents) {
        const s = students.find(st => st.id === studentId);
        if (s) {
          await addDoc(collection(db, `projects/${newProjectRef.id}/teamMembers`), {
            firstName: s.firstName,
            lastName: s.lastName,
            identification: s.identification,
            grade: s.grade
          });
        }
      }

      alert('✅ Proyecto creado con éxito');
      setFormData({
        title: '',
        area: '',
        objectives: '',
        schedule: '',
        budget: '',
        additionalObservations: ''
      });
      setSelectedStudents([]);
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar el proyecto');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>📁 Proyectos</Typography>

      {/* Filtros */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField label="Nombre del Proyecto" fullWidth onChange={e => handleFilterChange('name', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField label="Estudiante" fullWidth onChange={e => handleFilterChange('student', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField label="Profesor" fullWidth onChange={e => handleFilterChange('teacher', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filters.status}
              label="Estado"
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Formulation">Formulación</MenuItem>
              <MenuItem value="Evaluation">Evaluación</MenuItem>
              <MenuItem value="Active">Activo</MenuItem>
              <MenuItem value="Inactive">Inactivo</MenuItem>
              <MenuItem value="Completed">Completado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Lista de Proyectos */}
      {filteredProjects.map(proj => (
        <Card key={proj.id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">{proj.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Estado: {proj.currentStatus}
            </Typography>
            <Typography sx={{ mt: 1 }}>{proj.currentStatusObservation}</Typography>
            <Typography variant="caption" display="block">👨‍🏫 {proj.teacherName}</Typography>
            <Typography variant="caption" display="block">👩‍🎓 {proj.students.join(', ')}</Typography>

            {role === 'coordinator' && (
              <>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Cambiar estado</InputLabel>
                      <Select
                        defaultValue=""
                        label="Cambiar estado"
                        onChange={e =>
                          setStatusUpdate(prev => ({
                            ...prev,
                            [proj.id]: { ...prev[proj.id], status: e.target.value }
                          }))
                        }
                      >
                        <MenuItem value="Formulation">Formulación</MenuItem>
                        <MenuItem value="Evaluation">Evaluación</MenuItem>
                        <MenuItem value="Active">Activo</MenuItem>
                        <MenuItem value="Inactive">Inactivo</MenuItem>
                        <MenuItem value="Completed">Completado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Observación"
                      onChange={e =>
                        setStatusUpdate(prev => ({
                          ...prev,
                          [proj.id]: { ...prev[proj.id], observation: e.target.value }
                        }))
                      }
                    />
                  </Grid>
                </Grid>
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  disabled={!statusUpdate[proj.id]?.status || !statusUpdate[proj.id]?.observation}
                  onClick={() => onStatusChange(proj.id, statusUpdate[proj.id])}
                >
                  ✔️ Actualizar Estado
                </Button>

                {/* Ver historial */}
                <Box sx={{ mt: 2 }}>
                    <Accordion onChange={() => loadStatusHistory(proj.id)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>📜 Historial de Estado</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        {statusHistories[proj.id]?.length > 0 ? (
                            statusHistories[proj.id].map((entry, idx) => (
                            <Box key={idx} sx={{ mb: 1 }}>
                                <Typography variant="body2"><strong>Estado:</strong> {entry.status}</Typography>
                                <Typography variant="body2"><strong>Observación:</strong> {entry.observation}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                Fecha: {new Date(entry.date.seconds * 1000).toLocaleString()}
                                </Typography>
                                <hr />
                            </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">Sin historial disponible.</Typography>
                        )}
                        </AccordionDetails>
                    </Accordion>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Formulario para docentes */}
      {role === 'teacher' && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>➕ Crear nuevo proyecto</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Título" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Área" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Objetivos" value={formData.objectives} onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Cronograma" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth type="number" label="Presupuesto" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Observaciones adicionales" value={formData.additionalObservations} onChange={(e) => setFormData({ ...formData, additionalObservations: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Seleccionar estudiantes</InputLabel>
                <Select
                  multiple
                  value={selectedStudents}
                  onChange={(e) => setSelectedStudents(e.target.value)}
                  input={<OutlinedInput label="Seleccionar estudiantes" />}
                  renderValue={(selected) =>
                    selected.map(id => {
                      const s = students.find(stu => stu.id === id);
                      return s ? `${s.firstName} ${s.lastName}` : '';
                    }).join(', ')
                  }
                >
                  {students.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      <Checkbox checked={selectedStudents.indexOf(s.id) > -1} />
                      <ListItemText primary={`${s.firstName} ${s.lastName}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleCreateProject} fullWidth>
                Guardar Proyecto
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProjectList;
