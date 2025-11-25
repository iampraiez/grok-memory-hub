export const LoadingSpinner = ({ size = 20 }: { size?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="animate-spin rounded-full border-2 border-text-tertiary border-t-accent-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
};
