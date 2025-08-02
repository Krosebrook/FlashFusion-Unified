// Simple toast hook for now
export function useToast() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    console.log(`Toast: ${title}${description ? ` - ${description}` : ''}`);
    // For now just log, could implement proper toast later
  };

  return { toast };
}