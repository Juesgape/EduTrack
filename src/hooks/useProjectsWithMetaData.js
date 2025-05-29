import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const useProjectsWithMetadata = (institution) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution) return;

    const fetchData = async () => {
      setLoading(true);

      // 1. Obtener todos los usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userMap = {};
      usersSnapshot.docs.forEach(doc => {
        userMap[doc.id] = doc.data();
      });

      // 2. Obtener todos los proyectos de la institución
      const projectQuery = query(collection(db, 'projects'), where('institution', '==', institution));
      const projectSnapshot = await getDocs(projectQuery);

      // 3. Obtener miembros del equipo para cada proyecto
      const enrichedProjects = await Promise.all(
        projectSnapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          const projectId = docSnap.id;

          const teamSnap = await getDocs(collection(db, `projects/${projectId}/teamMembers`));
          const students = teamSnap.docs.map(t => {
            const d = t.data();
            return `${d.firstName} ${d.lastName}`;
          });

          const teacherName = userMap[data.teacherId]
            ? `${userMap[data.teacherId].firstName} ${userMap[data.teacherId].lastName}`
            : 'Desconocido';

          return {
            id: projectId,
            ...data,
            students,
            teacherName
          };
        })
      );

      setProjects(enrichedProjects);
      setLoading(false);
    };

    fetchData();
  }, [institution]);

  return { projects, loading };
};
