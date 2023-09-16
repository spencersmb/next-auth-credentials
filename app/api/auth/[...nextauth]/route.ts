import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from '../../../../lib/prisma';
import { AdapterUser } from "next-auth/adapters";
// @ts-ignore
import bcrypt from 'bcrypt'
import { cookies } from "next/headers";
import { randomUUID } from 'crypto'
import { encode, decode } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";

function generateHash(password: string): string {
    const saltRounds = 10
    return bcrypt.hashSync(password, saltRounds)
  }
  function compareHash(password: string): boolean {
    return bcrypt.compareSync(password, generateHash(password))
 }

 const maxAge = 30 * 24 * 60 * 60; // 30 days
interface Context {
  params: { nextauth: string[] };
}
export const authOptions = (
  req: NextApiRequest,
  context: Context
): [NextApiRequest, Context, NextAuthOptions] => {
const { params } = context;
const isCredentialsCallback =
    params?.nextauth?.includes("callback") &&
    params.nextauth.includes("credentials") &&
    req.method === "POST"
    
  console.log("isCredentialsCallback", isCredentialsCallback)
  return [
    req,
    context,
    {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
     strategy: "database", 
      maxAge,
      updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID as string,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string
    // }),

    //https://www.youtube.com/watch?v=b3pbgBmEGcU
    CredentialsProvider({
      name: "Credentials",
      credentials:{
        email: { label: "Email", type: "email", placeholder: "Enter your email" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" },
      },
      async authorize(credentials, req) {
          const { email, password } = credentials as { email: string, password: string };
          
          let user;
          try {
            // if (!isEmail(email)) {
            //   throw new Error("Email should be a valid email address");
            // }
            user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
              throw new Error("No User found, please sign up");
              // user = await client.createUser({
              //   email,
              //   password: bcrypt.hashSync(password, 10),
              // });
            } 

            // const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
            // if (!passwordsMatch) {
            //   throw new Error("Password is not correct");
            // }
              
            // const sessionToken = randomUUID()
            // const sessionExpiry = new Date(Date.now() + maxAge * 1000)
            // await prisma.session.create({
            //   data: {
            //     sessionToken: sessionToken,
            //     userId: user.id,
            //     expires: sessionExpiry,
            //   },
            // })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              // sessionToken,
            };
          } catch (error:any) {
            console.error(error.message);
            throw error;
          }
      }
    })
  ],
  callbacks: {
    async signIn({ user }:any) {
      console.log("signIn callbacks", user);
      if (isCredentialsCallback) {
            if (user) {
              const sessionToken = randomUUID();
              const sessionExpiry = new Date(
                Date.now() + 60 * 60 * 24 * 30 * 1000
              );

              await prisma.session.create({
                data: {
                  sessionToken,
                  userId: user.id,
                  expires: sessionExpiry,
                },
              });

              cookies().set("next-auth.session-token", sessionToken, {
              expires: sessionExpiry,
            });
            }
          }
          return true;
    },
    
    // async jwt({ token, user }:any) {
    //   if (user) {
    //     token.userId = user.id;
    //     token.sessionToken = user.sessionToken;
    //   }
    //   console.log("jwt callbacks", token, user);
    //   if (token?.sessionToken) {
    //     const session = await prisma.session.findUnique({
    //       where: { sessionToken: token.sessionToken } 
    //     });
    //     console.log("jwt callbacks found session?", session)
    //     if (!session) {
    //       return null;
    //     }
    //   }
    //   return token;
    // },
    // async signIn({ user, account, email }: any) {
      // console.log("signIn callbacks",email);
    //    if (nextAuthInclude('callback') && nextAuthInclude('credentials')) {
    //       if (!user) return true

    //       const sessionToken = randomUUID()
    //       const sessionMaxAge = 60 * 60 * 24 * 30
    //       const sessionExpiry = new Date(Date.now() + sessionMaxAge * 1000)

    //       await prisma.session.create({
    //         data: {
    //           sessionToken: sessionToken,
    //           userId: user.id,
    //           expires: sessionExpiry,
    //         },
    //       })

    //       setCookie(`next-auth.session-token`, sessionToken, {
    //         expires: sessionExpiry,
    //         req: req,
    //         res: res,
    //       })

    //       return true
    //     }
      // return true;
    // },
    session({ session, user }:any) {
        console.log("SESSION", session, user)
        if (session.user) {
          session.user.id = user.id
          // session.user.role = user.role as string
        }
        return session
    },
    // jwt: {
    //   // @ts-ignore
    //   encode(params:any) {
    //     if (
    //       req.query.nextauth?.includes("callback") &&
    //       req.query.nextauth?.includes("credentials") &&
    //       req.method === "POST"
    //     ) {
    //       const cookies = new Cookies(req, res)
    //       const cookie = cookies.get("next-auth.session-token")

    //       if (cookie) return cookie
    //       else return ""
    //     }
    //     // Revert to default behaviour when not in the credentials provider callback flow
    //     return encode(params)
    //   },
    //   async decode(params:any) {
    //     if (
    //       req.query.nextauth?.includes("callback") &&
    //       req.query.nextauth?.includes("credentials") &&
    //       req.method === "POST"
    //     ) {
    //       return null
    //     }
    //     // Revert to default behaviour when not in the credentials provider callback flow
    //     return decode(params)
    //   },
    // },
  },
  jwt: {
    maxAge,
    encode: async (arg:any) => {
      if (isCredentialsCallback) {
        const cookie = cookies().get("next-auth.session-token");

        if (cookie) return cookie.value;
        return "";
      }

      return encode(arg);
    },
    decode: async (arg:any) => {
      if (isCredentialsCallback) {
        return null;
      }
      return decode(arg);
    },
  },
  debug: process.env.NODE_ENV === "development",
  events: {
    async signOut({ session }:any) {
      const { sessionToken = "" } = session as unknown as {
        sessionToken?: string;
      };

      if (sessionToken) {
        await prisma.session.deleteMany({
          where: {
            sessionToken,
          },
        });
      }
    },
  },
  }
  ]
}

async function handler(request: NextApiRequest, context: Context) {
  //@ts-ignore
  return NextAuth(...authOptions(request, context));
}

export { handler as GET, handler as POST };
