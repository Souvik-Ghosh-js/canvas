// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/admin/Login";
import AdminPanel from "./components/admin/Home";
import Canvas from "./Canvas";
// import FrontendView from "./pages/FrontendView";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<Canvas />} />
      </Routes>
    </Router>
  );
}
