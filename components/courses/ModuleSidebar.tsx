import {
  LockClosedIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type Module = {
  moduleNumber?: number;
  moduleTitle?: string;
};

interface Props {
  modules: Module[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
}

export default function ModuleSidebar({
  modules,
  activeIndex,
  onSelect,
}: Props) {

  // 🔥 MAGIEN: vi regner ut hvilke moduler som EKSISTERER basert på outlines
  const highestAvailableModule = modules.length;

  return (
    <div className="border-r border-gray-200 bg-gray-50 px-2 py-3 w-fit min-w-[140px] max-w-[200px]">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Kursinnhold
      </h3>

      <div className="space-y-1">
        {[1, 2, 3].map((moduleNumber, idx) => {

          // 🔥 STATUSLOGIKK
          let status: "locked" | "generating" | "generated" = "locked";

          if (moduleNumber <= highestAvailableModule) {
            status = "generated";
          } else if (moduleNumber === highestAvailableModule + 1) {
            status = "generating";
          }

          const isActive = idx === activeIndex;
          const isClickable = status === "generated";

          return (
            <button
              key={idx}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelect(idx)}
              className={[
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition whitespace-nowrap",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700",
                !isClickable
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-indigo-100",
              ].join(" ")}
            >
              <span>
                Modul {moduleNumber}
              </span>

              {/* STATUS ICON */}
              {status === "locked" && (
                <LockClosedIcon className="h-4 w-4 text-gray-400" />
              )}

              {status === "generating" && (
                <ArrowPathIcon className="h-4 w-4 animate-spin text-indigo-400" />
              )}

              {status === "generated" && (
                <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
