import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import PageZahlenFakten from './Pages/PageHome.tsx';
import PageRueckblick5Jahres from './Pages/PageRueckblick5Jahres.tsx';
import PageInternational from './Pages/PageInternationalStudierende.tsx';
import PageDeepDive from './Pages/PageDeepDive.tsx';

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <PageZahlenFakten /> },
  { path: "/ZahlenFakten", element: <PageZahlenFakten /> },
  { path: "/Rueckblick5Jahres", element: <PageRueckblick5Jahres /> },
  { path: "/InternationalStudierende", element: <PageInternational /> },
  { path: "/DeepDive", element: <PageDeepDive /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
