"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import SignInBtn from "./SignInButton";
import LoginForm from "./loginForm";

export default function UserInfo() {
  const { status, data: session } = useSession();
  console.log('session', session)
  console.log('status', status)



  if (status === "authenticated") {
    return (
      <div className="shadow-xl p-8 rounded-md flex flex-col gap-3 bg-yellow-200">
        {session?.user?.image && <Image
          alt="user image"
          className="rounded-full"
          src={session?.user?.image}
          width={60}
          height={60}
        />}
        <div>
          Name: <span className="font-bold">{session?.user?.name}</span>
        </div>
        <div>
          Email: <span className="font-bold">{session?.user?.email}</span>
        </div>
      </div>
    );
  } else if (status === "loading") {
    return <div>loading...</div>
  } else {
    return <>
      <SignInBtn />
      <LoginForm />
    </>;
  }
}