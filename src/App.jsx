import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Walk from "./Walk";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/walk" element={<Walk />} />
      </Routes>
    </BrowserRouter>
  );
}
