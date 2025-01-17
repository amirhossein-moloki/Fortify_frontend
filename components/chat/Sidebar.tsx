import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { label: 'New Group', href: '#' },
    { label: 'New Channel', href: '#' },
    { label: 'Contacts', href: '#' },
    { label: 'Calls', href: '#' },
    { label: 'Saved Messages', href: '#' },
    { label: 'Settings', href: '#' },
  ]

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-[#1F1D2B] border-r border-gray-800 z-50`}
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Menu</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="md:hidden text-gray-400"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2D2A3D] rounded-lg transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

