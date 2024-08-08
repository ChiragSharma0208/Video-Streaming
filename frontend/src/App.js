import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import LiveStreamPage from "./pages/LiveStreamPage.jsx";
import LiveStreamViewer from "./pages/LiveStreamViewer.jsx";
import VideoPlayer from "./pages/videoplayer.jsx";
import ProfilePage from "./pages/profilepage.jsx";
import VideoUploadForm from './components/videoUploadForm.jsx';
import Chat from './components/Chat.jsx';
import Pricing from "./pages/Pricing.jsx";

import { AuthProvider } from './components/authContext';
import Header from "./components/header.jsx";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;
axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
axios.defaults.headers.post["Access-Control-Allow-Headers "] = "*";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-left" toastOptions={{ duration: 3000 }} />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/upload" element={<VideoUploadForm />} />
        <Route path="/play/:video_id/:name/:title" element={<VideoPlayer />} />
        <Route path="/profile/:name" element={<ProfilePage />} />
        <Route path="/live/:user" element={<LiveStreamPage />} />
        <Route path="/view/:user" element={<LiveStreamViewer />} />
        <Route path="/chat/:name" element={<Chat />} />
        <Route path="/subscription" element={<Pricing />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
