"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftIcon } from "lucide-react"


export const DashboardNavbar = () => {
  const {state , toggleSidebar, isMobile}= useSidebar();
  return (
    <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-backgorund ">
      <Button className=" size-9" variant="outline" onClick={toggleSidebar}>
        <PanelLeftIcon/>
      </Button>
    </nav>
  )
}

