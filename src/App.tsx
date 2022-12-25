import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./lib/api";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";
import ChatPages from "./pages/ChatPages";
import Navbar from "./components/layouts/Navbar";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then((res) => setUser(res.data.session?.user ?? null));

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="App bg-gray-100">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthMiddleware user={user} />} />
          <Route path="/room/:room_id" element={<ChatPages user={user} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

const AuthMiddleware = ({ user }: { user: User | null }) => {
  return (
    <>
      <div className="min-w-full min-h-screen flex items-center justify-center bg-gray-200">
        {!user ? <Auth /> : <Home user={user} />}
      </div>
    </>
  );
};
