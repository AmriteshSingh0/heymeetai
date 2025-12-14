import React from "react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ChevronRight, PencilIcon, TrashIcon } from "lucide-react";

interface Props {
  meetingId: string;
  meetingName: string;
  onEdit: () => void;
  onRemove: () => void;
}

const MeetingIdViewHeader = ({ meetingId, meetingName, onEdit, onRemove }: Props) => {
  return (
    <div className="flex items-center justify-between p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="font-medium ">
              <Link
                href="/agents"
                className="text-sm sm:text-base md:text-lg lg:text-xl"
              >
                My Meetings
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="font-medium text-foreground">
              <Link
                className="max-w-[120px] sm:max-w-[180px] md:max-w-[250px] lg:max-w-[320px] 
               truncate text-sm sm:text-base md:text-lg lg:text-xl"
                href={`/meetings/${meetingId}`}
              >
                {meetingName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="size-4" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={onEdit}>
                  {" "}
                  <PencilIcon className="size-3" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove}>
                  {" "}
                  <TrashIcon className="size-3" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default MeetingIdViewHeader;