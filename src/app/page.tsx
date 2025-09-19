/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-clients";
import { useState } from "react";



export default function Home() {

   const {
      data: session
   } = authClient.useSession()

   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");



   const onSubmit = () => {
      authClient.signUp.email({
         email,
         name,
         password,

      }, {
         onError: () => {
            window.alert("error in signup")
            console.log(Error);

         },
         onSuccess: () => {
            window.alert("successfully signed up")
         },
      }
      )
   }
   const onlogin = () => {
      authClient.signIn.email({
         email,
         password,

      }, {
         onError: () => {
            window.alert("error in signup")
            console.log(Error);

         },
         onSuccess: () => {
            window.alert("successfully signed up")
         },
      }
      )
   }

   if (session) {
      return(
      <div>
         <p> Logged in as {session.user.name}</p>
         <Button onClick={() => authClient.signOut()}>Sign Out litte nigga</Button>
      </div>
      )
   }



   return (
      <div>
         <div className="p-4 flex flex-col gap-y-4">
            <Input
               placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
               placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
               placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button onClick={onSubmit}>
               Register Yourself
            </Button>

         </div>

         <div className="p-4 flex flex-col gap-y-4">
            <Input
               placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
               placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button onClick={onlogin}>
               Login
            </Button>


         </div>
      </div>
   )
}
