import React, { useState, useEffect } from "react";
import Router from "next/router";
import UserContext from "@/lib/UserContext";
import { supabase, fetchUserRoles, updateUserStatus } from "@/lib/Store";
import { AppProps } from "next/app";
import { Session, User } from "@supabase/supabase-js";
import "../styles/globals.css";

export default function SupabaseSlackClone({ Component, pageProps }: AppProps) {
  const [userLoaded, setUserLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<Array<string>>([]);
  const [showUser, setShowUser] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);
    setUserLoaded(session ? true : false);

    if (user) {
      signIn();
      Router.replace("/channels/[id]", "/channels/1");
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        setUserLoaded(!!currentUser);
        setSession(session);

        if (currentUser) {
          signIn();
          Router.replace("/channels/[id]", "/channels/1");
        }

        if (event === "SIGNED_IN") {
          updateUserStatus(currentUser?.id ?? "", true);
        }
      },
    );

    return () => {
      authListener?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const signIn = async () => {
    await fetchUserRoles((userRoles) => {
      if (!userRoles) return;
      const roles = userRoles.map((userRole) => userRole.role);
      setUserRoles(roles);
    });
  };

  const signOut = async () => {
    await updateUserStatus(session?.user?.id ?? "", false);
    await supabase.auth.signOut();
    Router.replace("/", "/");
  };

  const toggleShowUser = () => {
    setShowUser((s) => !s);
  };

  return (
    <UserContext.Provider
      value={{
        userLoaded,
        user,
        userRoles,
        showUser,
        toggleShowUser,
        signIn,
        signOut,
      }}
    >
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}
