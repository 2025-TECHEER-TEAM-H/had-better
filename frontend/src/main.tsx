/* 원래코드
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
); */
//testmode -> 주석처리하면 원래대로
import { createRoot } from 'react-dom/client';
import { RaceTestPage } from './pages/RaceTestPage';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<RaceTestPage />);
