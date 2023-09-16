import UserInfo from '@/components/UserInfo'
import React from 'react'

interface Props { }

function Memebers(props: Props) {
  const { } = props

  return (
    <div className="flex flex-col place-items-center mt-24">
      <h1>MEMBERS AREA</h1>
      <UserInfo />
    </div>
  )
}

export default Memebers
