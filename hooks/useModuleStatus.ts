import { useEffect, useState } from "react";
import { getModule } from "@/lib/course";

export function useModuleStatus(
  courseId: string | null,
  moduleNumber: number | null,
  userId: string
) {
  const [status, setStatus] = useState<"loading" | "generated">("loading");

  useEffect(() => {
    if (!courseId || !moduleNumber) return;

    let timer: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await getModule(userId, courseId, moduleNumber);

        if (res.source === "generated") {
          setStatus("generated");
          clearInterval(timer);
        }
      } catch {}
    };

    poll();
    timer = setInterval(poll, 4000);

    return () => clearInterval(timer);
  }, [courseId, moduleNumber, userId]);

  return status;
}
