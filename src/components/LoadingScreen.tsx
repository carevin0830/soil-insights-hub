import leafIcon from "@/assets/leaf-icon.png";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src={leafIcon}
          alt="Loading"
          className="w-16 h-16 animate-[spin_2s_ease-in-out_infinite]"
        />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
};
