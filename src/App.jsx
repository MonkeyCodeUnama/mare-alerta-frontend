import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Checklist, History, Occurrences, Establishment } from './pages/Operations';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/checklist" element={<Checklist />} />
      <Route path="/historico" element={<History />} />
      <Route path="/ocorrencias" element={<Occurrences />} />
      <Route path="/estabelecimento" element={<Establishment />} />
    </Routes>
  );
}

export default App;
