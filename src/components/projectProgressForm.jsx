import { useState } from 'react'
import { db, auth } from '../config/firebase'
import {
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore'


const ProjectProgressForm = ({ projectId }) => {
  const [description, setDescription] = useState('')
  const [documents, setDocuments] = useState([])
  const [photos, setPhotos] = useState([])

  const handleSubmit = async () => {
    if (!description) return alert('Please enter a description')

    try {
      await addDoc(collection(db, `projects/${projectId}/progressUpdates`), {
        date: serverTimestamp(),
        description,
        documents: [],
        photos: [],
        createdBy: auth.currentUser.uid
      })

      alert('✅ Progress saved successfully!')
      setDescription('')
      setDocuments([])
      setPhotos([])
    } catch (err) {
      console.error('Error saving progress:', err.message)
    }
  }

  return (
    <div style={{ padding: 20, border: '1px solid #ccc', marginTop: 20 }}>
      <h3>Add Project Progress</h3>
      <textarea
        placeholder="Describe the progress"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        style={{ width: '100%' }}
      />
      <br />

      <label>Upload Documents (PDFs, Word, etc):</label>
      <input type="file" multiple />

      <label>Upload Photos (JPG, PNG):</label>
      <input type="file" accept="image/*" multiple />

      <br /><br />
      <button onClick={handleSubmit}>💾 Save Progress</button>
    </div>
  )
}

export default ProjectProgressForm
