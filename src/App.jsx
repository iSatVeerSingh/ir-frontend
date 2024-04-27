import { RouterProvider } from "react-router-dom";
import Dashboard from "./layouts/Dashboard";
import router from "./router";
import "./app.css"

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App;