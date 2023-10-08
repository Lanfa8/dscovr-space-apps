
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SobrePage } from "./pages/SobrePage";
import { NoPage } from "./pages/NoPage";
import { GraficoPage } from "./pages/GraficoPage";
import { Nav } from "./components/Nav";

function App() {
  return (
    <>
      <Nav />
      <BrowserRouter>
        <Routes>
            <Route index path="/" element={<GraficoPage />}/>
            <Route path="sobre" element={<SobrePage />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
