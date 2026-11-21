import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { store } from "./store/store";
import { restoreSession, sessionExpired } from "./store/slices/authSlice";
import { setSessionExpiredHandler } from "./services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";

setSessionExpiredHandler(() => {store.dispatch(sessionExpired())});
void store.dispatch(restoreSession());

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
createRoot(root).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </Provider>
);
