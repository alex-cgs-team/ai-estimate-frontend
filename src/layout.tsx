import { onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Footer, Header } from "./components";
import { auth, rtdb } from "./firebase";
import { useAuth } from "./hooks";

export default function AppLayout() {
  const { setUser, setProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && u?.emailVerified) {
        const snap = await get(ref(rtdb, `profiles/${u.uid}`));
        const profile = snap.val();
        if (u && profile) {
          setUser(u);
          setProfile(profile);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, [setUser, setProfile]);

  if (loading) return null;
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFBFF]">
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
