import React from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'

const ProfilePages = () => {
  const {handleEditPost} = useOutletContext()
  
  return <Outlet context={{handleEditPost}} />; // This will render the correct nested route
}

export default ProfilePages;