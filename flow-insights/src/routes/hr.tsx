import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isHrAuthed } from "@/lib/hr-auth";

export const Route = createFileRoute("/hr")({
  component: HrLayout,
});

function HrLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "ok" | "deny">("loading");

  useEffect(() => {
    if (isHrAuthed()) setState("ok");
    else {
      setState("deny");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  if (state !== "ok") {
    return <div className="p-8 text-sm text-muted-foreground">Lade HR Workspace …</div>;
  }
  return <Outlet />;
}
