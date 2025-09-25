'use client';

import { authClient } from "@/lib/auth-clients"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"


export const HomeView = () => {
   const router = useRouter();
   const {data:session } = authClient.useSession();
   
   if(!session){
      return (
         <div>
            <p>Loading Boss</p>
         </div>
      )
   }
  return (
     <div>
         <p> Logged in as {session.user.name}</p>
         <Button onClick={() => authClient.signOut({
            fetchOptions:{onSuccess:()=> router.push("/sign-in")
            }
         })}>Sign Out</Button>
      </div>
  )
}

