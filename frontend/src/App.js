import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import VideoPlayer from "./pages/videoplayer.jsx";
import ProfilePage from "./pages/profilepage.jsx";
import VideoUploadForm from './components/videoUploadForm.jsx';

import { AuthProvider } from './components/authContext';


axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;
axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers.post["Access-Control-Allow-Headers "] = "*";

function App() {
  return (
    <><AuthProvider>      
     <Toaster position="top-left" toastOptions={{ duration: 3000 }} />

        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/upload" element={< VideoUploadForm/>}></Route>
          <Route path="/play/:video_id/:name/:title" element={< VideoPlayer/>}></Route>
          <Route path="/profile/:name" element={< ProfilePage/>}></Route>
          </Routes>
        </AuthProvider>

    </>
  );
}

export default App;
