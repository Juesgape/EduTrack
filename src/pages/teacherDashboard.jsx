import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { Container, Typography, CircularProgress } from '@mui/material';
import NavBar from '../components/navbar';
import ProjectList from '../components/projectList';
import { useProjectsWithMetadata } from '../hooks/useProjectsWithMetaData';

const TeacherDashboard = () => {
  const [institution, setInstitution] = useState('');
  const [loadingInstitution, setLoadingInstitution] = useState(true);

  useEffect(() => {
    const fetchInstitution = async () => {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userSnap.data();
      setInstitution(userData.institution);
      setLoadingInstitution(false);
    };

    fetchInstitution();
  }, []);

  const { projects, loading: loadingProjects } = useProjectsWithMetadata(institution);

  const filteredByTeacher = projects.filter(p => p.teacherId === auth.currentUser.uid);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <NavBar />
      <Typography variant="h4" gutterBottom>
        Panel del Docente – {institution}
      </Typography>

      {loadingInstitution || loadingProjects ? (
        <CircularProgress />
      ) : (
        <ProjectList projects={filteredByTeacher} role="teacher" />
      )}
    </Container>
  );
};

export default TeacherDashboard;
