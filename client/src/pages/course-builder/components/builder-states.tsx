import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type BuilderMessageProps = {
  title: string;
  description: string;
  retry?: () => void;
};

export function BuilderMessage({
  title,
  description,
  retry,
}: BuilderMessageProps) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="space-y-3 text-center">
        <h1 className="font-medium">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {retry && <Button onClick={retry}>Try again</Button>}
      </div>
    </main>
  );
}

export function BuilderSkeleton() {
  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-[620px] w-full" />
      </div>
    </main>
  );
}

export function TreeSkeleton() {
  return (
    <div className="space-y-2 p-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-4/5" />
      <Skeleton className="h-8 w-3/5" />
    </div>
  );
}
