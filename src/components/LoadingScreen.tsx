import leafIcon from "@/assets/leaf-icon.png";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <img
          src={leafIcon}
          alt="Loading"
          className="w-20 h-20 animate-[spin_2s_ease-in-out_infinite] drop-shadow-lg"
        />
        <div className="flex flex-col items-center gap-3 w-64">
          <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading...</p>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[progress_1.5s_ease-in-out_infinite] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
