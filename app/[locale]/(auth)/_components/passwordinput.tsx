"use client"

import { useState, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import InputIconWrapper from "./inputiconwrapper"

export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <InputIconWrapper
      icon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
    >
      <Input
        {...props}
        ref={ref}
        type={showPassword ? "text" : "password"}
        className="w-full pr-12 h-14 border-slate-200"
      />
    </InputIconWrapper>
  )
})

PasswordInput.displayName = "PasswordInput"