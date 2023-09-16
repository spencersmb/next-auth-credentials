import UserInfo from '@/components/UserInfo'
import prisma from '../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { cookies, headers } from 'next/headers';

export const revalidate = 3600
export default async function Home() {
  const session = await getServerSession(
    authOptions(
      {
        //@ts-ignore
        cookies: cookies(),
        //@ts-ignore
        headers: headers(),
      },
      { params: { nextauth: ["session"] } }
    )[2]
  );
  const feed = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  console.log('session index page', session)

  return (
    <div className="grid place-items-center h-screen -mt-24">
      <UserInfo />
    </div>
  )
}
