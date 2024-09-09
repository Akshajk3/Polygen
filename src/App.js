import logo from './logo.svg';
import './App.css';

import Upload from "./Upload";
import Login from "./components/login";
import Home from "./components/home"
import Register from "./components/register"

import { AuthProvider } from './context/AuthContext';
import { useRoutes } from 'react-router-dom';


function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <div className="App">
      <AuthProvider>
        <div className="w-full h-screen flex flex-col">{routesElement}</div>
      </AuthProvider>
    </div>
  );
}

export default App;
