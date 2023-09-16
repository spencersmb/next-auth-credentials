'use client'

import { signIn } from 'next-auth/react';
import React from 'react'

interface Props { }

function LoginForm(props: Props) {
  const { } = props

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')
    const password = formData.get('password')

    try {

      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/members",
      })
      // console.log('signInResult', signInResult)
      if (signInResult !== undefined) {
        console.log('signInResult', signInResult)
      }
    } catch (error) {
      console.error('error', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='mt-20 flex flex-col text-black'>
      <input type="email" name="email" className='mb-4' placeholder='email' />
      <input type="password" name="password" className='mb-4' placeholder='password' />
      <button type="submit">Sign In</button>
    </form>
  )
}

export default LoginForm
