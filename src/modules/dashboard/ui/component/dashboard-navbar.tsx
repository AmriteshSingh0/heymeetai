"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"
import  {DashboardCommand}  from "./dashboardcommand"



export const DashboardNavbar = () => {
  const {state , toggleSidebar, isMobile}= useSidebar();
  const [commmandOpen, setCommandOpen] = useState(false);

  useEffect(()=>{
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down)

    return ()=> document.removeEventListener("keydown", down);

  },[]);

   
  return (
    <>
    <DashboardCommand commandOpen={commmandOpen} setCommandOpen={setCommandOpen} />

    <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-backgorund ">
      <Button className=" size-9" variant="outline" onClick={toggleSidebar}>
        {(state === "collapsed" || isMobile)?
        <PanelLeftIcon/> :
        <PanelLeftCloseIcon/>}
      </Button>
      <Button
      className="h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground"
      variant={"outline"}
      size="sm"
      onClick={() => {
        setCommandOpen((prev)=>!prev)
      }}
       >
       <SearchIcon />
        Search
        <kbd className="ml-auto pointer-events-none inline-flex       h-5 select-none items-center gap-1 rounded border       bg-muted px-1.5 font-mono text-[10px] font-medium       text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
       </Button>
    </nav>
    </>
  )
}

