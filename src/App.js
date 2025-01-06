import logo from './logo.svg';
import './App.css';
import "./style.scss"

import Upload from "./components/upload";
import Login from "./components/login";
import Home from "./components/home"
import Register from "./components/register"
import Navbar from "./components/header"
import SF3DUpload from './components/generator';
import Contact from './components/contact';
import About from './components/about';

import { AuthProvider } from './context/AuthContext';
import { useRoutes } from 'react-router-dom';
import { element } from 'three/webgpu';
import { SDK_VERSION } from 'firebase/app';



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
      path: "/contact",
      element: <Contact />,
    },
    {
      path: "/about",
      element: <About />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/upload",
      element: <Upload/>,
    },
    {
      path: "/header",
      element: <Navbar />,
    },
    {
      path: "/generate",
      element: <SF3DUpload />
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <div className="App">
      <AuthProvider>
        <Navbar />
        <div>{routesElement}</div>
      </AuthProvider>
    </div>
  );
  
}

export default App;

        {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header
  > */}