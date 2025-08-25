import type { RecentItem } from "@/types/recent";
import { writeRecentLS } from "@/lib/recent-local";

export default function VisitLink({
  href,
  item,
  className,
  children,
}: {
  href: string;
  item: RecentItem;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => writeRecentLS(item)}
    >
      {children}
    </a>
  );
}
