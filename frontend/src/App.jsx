
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SobrePage } from "./pages/SobrePage";
import { NoPage } from "./pages/NoPage";
import { GraficoPage } from "./pages/GraficoPage";
import { Nav } from "./components/Nav";

import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'

const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Nav />
        <Routes>
            <Route index path="/" element={<GraficoPage />}/>
            <Route path="about" element={<SobrePage />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
