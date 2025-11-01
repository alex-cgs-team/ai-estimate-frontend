import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/hooks";

export const Main = () => {
  const signOutTest = async () => {
    await signOut(auth);
  };

  const { profile } = useAuth();

  return (
    <div>
      <div>main</div>
      <p>{profile?.name}</p>
      <button onClick={signOutTest}>sign out</button>
    </div>
  );
};
