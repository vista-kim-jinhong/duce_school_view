"use client";

import { createStore, Provider } from "jotai";
import { useMemo } from "react";
import type { SessionPayload } from "@/lib/cookie/types";
import { userInfoAtom } from "@/app/store/globalAtoms";

interface ProvidersProps {
  children: React.ReactNode;
  initialSession: SessionPayload | null;
}

export default function JotaiProviders({
  children,
  initialSession,
}: ProvidersProps) {
  const store = useMemo(() => {
    const s = createStore();
    s.set(userInfoAtom, initialSession);
    return s;
  }, [initialSession]);

  return <Provider store={store}>{children}</Provider>;
}
