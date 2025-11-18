export const EmptyState = ({ title }: { title: string }) => {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-lg">You don't have any {title} yet</p>
      </div>
    );
  };