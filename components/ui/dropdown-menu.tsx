import React, { useState, useEffect, useRef } from 'react'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onOpenChange])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    onOpenChange(!isOpen)
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={handleToggle}>{trigger}</div>
      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white rounded-md shadow-lg">
          {children}
        </div>
      )}
    </div>
  )
}

export const DropdownMenuItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <button
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      {...props}
    >
      {children}
    </button>
  )
}
