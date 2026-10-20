"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_ROLE, ROLES, type RoleKey } from "@/data/profile";

interface RoleContextValue {
  role: RoleKey;
  setRole: (r: RoleKey) => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: DEFAULT_ROLE,
  setRole: () => {},
});

function readRoleFromUrl(): RoleKey {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const param = new URLSearchParams(window.location.search).get("role") as RoleKey | null;
  return param && ROLES.includes(param) ? param : DEFAULT_ROLE;
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleKey>(DEFAULT_ROLE);

  useEffect(() => {
    // Reading from window.location after hydration — intentional, not a cascade risk
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoleState(readRoleFromUrl());
    const onPop = () => setRoleState(readRoleFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setRole = useCallback((r: RoleKey) => {
    setRoleState(r);
    const params = new URLSearchParams(window.location.search);
    if (r === DEFAULT_ROLE) {
      params.delete("role");
    } else {
      params.set("role", r);
    }
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
