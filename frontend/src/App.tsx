import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Receiver } from "./components/Receiver";
import { Sender } from "./components/Sender";

function App() {
  return (
    <>
      <div>WEbrtc one sided video call</div>
      <BrowserRouter>
        <Routes>
          <Route path="/sender" element={<Sender />} />
          <Route path="receiver" element={<Receiver />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
