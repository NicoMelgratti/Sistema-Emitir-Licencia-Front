"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Image from "next/image"

interface NavigationProps {
  role: string
  onLogout?: () => void
}

export default function Navigation({ role, onLogout }: NavigationProps) {

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
      return
    }

    // Fallback if no onLogout provided
    console.log("🔄 Iniciando logout...")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("authToken")
    localStorage.removeItem("user_data")
    localStorage.removeItem("userData")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("currentUser")
    sessionStorage.clear()
    console.log("✅ LocalStorage limpiado")
    window.location.href = "/"
  }

  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/60 text-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link
              href={`/dashboard?role=${role}`}
              className="text-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                <Image
                  src="/images/logo-licencias-nuevo.png"
                  alt="Logo Sistema de Licencias"
                  width={32}
                  height={32}
                  className="object-contain p-0.5"
                />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-cyan-400 transition-all">
                Sistema de Licencias
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 rounded-full transition-all duration-300"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="font-medium">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
