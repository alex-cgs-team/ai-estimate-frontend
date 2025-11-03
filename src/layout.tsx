import { Outlet } from "react-router-dom";
import { Footer, Header } from "./components";
import { ToastContainer } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth, rtdb } from "./firebase";
import { useAuth } from "./hooks";
import { get, ref } from "firebase/database";

export default function AppLayout() {
  const { setUser, setProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      setLoading(false);
      if (u) {
        const snap = await get(ref(rtdb, `profiles/${u.uid}`));
        console.log(snap.val());
        const profile = snap.val();
        setProfile(profile);
      }
    });
    return unsub;
  }, [setUser, setProfile]);

  if (loading) return null;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </main>
      <Footer />
    </div>
  );
}
