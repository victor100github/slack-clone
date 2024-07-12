import { createContext } from "react";
import { User } from "@supabase/supabase-js";

export interface UserContextType {
  userLoaded: boolean;
  user: User | null;
  userRoles: string[];
  showUser: boolean;
  toggleShowUser: () => void;
  signIn: () => void;
  signOut: () => void;
}

const UserContext = createContext<Partial<UserContextType>>({});

export default UserContext;
