import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { getInitials } from "~/lib/format";

export function PageHeader({
  icon: Icon,
  title,
  user,
  children,
}: {
  icon: LucideIcon;
  title: string;
  user: { name: string; email: string };
  children?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-2 px-4 pt-3">
      <div className="flex flex-1 items-center gap-2">
        <Icon className="text-muted-foreground size-5" />
        <h1 className="font-heading text-xl font-semibold">{title}</h1>
      </div>
      {children ? (
        <div className="flex shrink-0 justify-center">{children}</div>
      ) : null}
      <div className="flex flex-1 justify-end">
        <Avatar>
          <AvatarFallback>
            {getInitials(user.name) || getInitials(user.email)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
