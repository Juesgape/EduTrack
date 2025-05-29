// Reusable component to fetch status history
export const StatusHistory = ({ projectId }) => {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const fetchHistory = async () => {
      const snap = await getDocs(collection(db, `projects/${projectId}/statusHistory`))
      setHistory(snap.docs.map(d => d.data()))
    }
    fetchHistory()
  }, [projectId])

  return (
    <ul>
      {history.map((h, i) => (
        <li key={i}>
          <strong>{h.status}</strong> – {h.observation} <br />
          <small>{new Date(h.date.toDate()).toLocaleString()}</small>
        </li>
      ))}
    </ul>
  )
}