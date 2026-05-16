import React from "react";

interface InputIconWrapperProps {
    children: React.ReactNode
    icon?: React.ReactNode
}

const InputIconWrapper = ({ icon, children }: InputIconWrapperProps) => {
  return (
    <div className='relative w-full group'>
      {icon && <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors">{icon}</div>}
      {children}
    </div>
  )
}

export default InputIconWrapper