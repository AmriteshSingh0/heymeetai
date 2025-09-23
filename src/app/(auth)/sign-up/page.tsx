import { SignUpView } from "@/modules/auth/ui/views/sign-up-view"
import { auth } from "@/lib/auth"
//import { HomeView } from "@/modules/home/ui/views/home-view"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!!session) {
        redirect("/")
    }


    return (
        <SignUpView />
    )
}

export default page