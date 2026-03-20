"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";

interface KrResponsibleAvatarsProps {
  responsibles?: { _id: string; name: string }[];
  maxVisible?: number;
  showEmptyOnHover?: boolean;
}

export function KrResponsibleAvatars({
  responsibles,
  maxVisible = 3,
  showEmptyOnHover = true,
}: KrResponsibleAvatarsProps) {
  if (responsibles && responsibles.length > 0) {
    return (
      <TooltipProvider>
        <AvatarGroup className="shrink-0">
          {responsibles.slice(0, maxVisible).map((member) => (
            <Tooltip key={member._id}>
              <TooltipTrigger asChild>
                <Avatar
                  size="sm"
                  className={`${getAvatarColor(member.name)} cursor-default`}
                >
                  <AvatarFallback className="text-white text-[9px] font-semibold bg-transparent">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {member.name}
              </TooltipContent>
            </Tooltip>
          ))}
          {responsibles.length > maxVisible && (
            <AvatarGroupCount className="size-6 text-[9px]">
              +{responsibles.length - maxVisible}
            </AvatarGroupCount>
          )}
        </AvatarGroup>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`size-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0 cursor-default ${
              showEmptyOnHover ? "opacity-0 group-hover:opacity-100 transition-opacity" : ""
            }`}
          >
            <User className="size-3 text-muted-foreground/40" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Sem responsável
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
