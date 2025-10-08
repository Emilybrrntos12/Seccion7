import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {FirebaseAppProvider} from "reactfire";
import { firebaseConfig} from "./config/firebase.ts"
import FirebaseService from "./config/firebase-service.tsx";
import { BrowserRouter } from "react-router";
import RedirectHandler from "./components/redirect-handler";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirebaseService>
        <BrowserRouter>
          <App />
          <RedirectHandler />
        </BrowserRouter>
      </FirebaseService>
    </FirebaseAppProvider>
  </StrictMode>,
)
