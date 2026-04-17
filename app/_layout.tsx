import "../global.css";
import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      sessionRef.current = session;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        sessionRef.current = session;
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1c1917" },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}
