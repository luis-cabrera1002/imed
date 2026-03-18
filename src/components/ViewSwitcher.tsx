import { User, Stethoscope, Store } from "lucide-react";
import { useView, ViewMode } from "@/contexts/ViewContext";
import { cn } from "@/lib/utils";

const views: { mode: ViewMode; label: string; icon: typeof User; color: string }[] = [
  { mode: 'patient', label: 'Paciente', icon: User, color: 'bg-primary' },
  { mode: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'bg-secondary' },
  { mode: 'pharmacy', label: 'Farmacia', icon: Store, color: 'bg-accent' },
];

const ViewSwitcher = () => {
  const { viewMode, setViewMode } = useView();

  return (
    <div className="flex items-center bg-muted rounded-full p-1 gap-0.5">
      {views.map(({ mode, label, icon: Icon, color }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
            viewMode === mode
              ? `${color} text-primary-foreground shadow-md`
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
