"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  UserCircle,
  BadgeIcon as IdCard,
  Printer,
  AlertTriangle,
  Users,
  ArrowRight,
  Copy,
  RefreshCw,
  Filter,
  UserCog,
  UserCheck,
  Activity
} from "lucide-react"
import Navigation from "@/components/navigation"
import gsap from "gsap"
import { useStats } from "@/contexts/stats-context"
import { useAuth } from "@/hooks/use-auth"

export default function Dashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  const { stats, isLoading } = useStats()
  const { logout } = useAuth()
  const { licenciasEmitidas, licenciasVencidas, titularesRegistrados } = stats

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const userRole = searchParams.get("role")
    if (!userRole) {
      router.push("/")
      return
    }
    setRole(userRole)

    // Premium GSAP Animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo(
        statsRef.current?.children || [],
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      )
      .fromTo(
        cardsRef.current?.children || [],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      )

    return () => {
      gsap.killTweensOf("*")
    }
  }, [searchParams, router, isClient])

  const navigateTo = (path: string) => {
    if (role) router.push(`${path}?role=${role}`)
  }

  if (!isClient || !role) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          <p className="text-cyan-400 font-medium tracking-widest uppercase text-sm">Iniciando Sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
      </div>

      <Navigation role={role} onLogout={logout} />

      <main ref={containerRef} className="container mx-auto py-10 px-6 lg:px-12 max-w-7xl relative z-10">
        <div ref={headerRef} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">
              Panel de Control
            </h1>
            <p className="text-slate-400 text-lg">Sistema Integral de Gestión de Licencias de Conducir</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-full shadow-lg">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Sistema en línea</span>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat Card 1 */}
          <div className="relative group rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-[1px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-between transition-all duration-300">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Licencias Emitidas</p>
                <h3 className="text-4xl font-bold text-white">{isLoading ? "-" : licenciasEmitidas}</h3>
              </div>
              <div className="h-14 w-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:scale-110 transition-transform duration-300">
                <IdCard className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="relative group rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-[1px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-between transition-all duration-300">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Titulares Activos</p>
                <h3 className="text-4xl font-bold text-white">{isLoading ? "-" : titularesRegistrados}</h3>
              </div>
              <div className="h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div 
            onClick={() => navigateTo("/dashboard/licencias/vencidas")}
            className="relative group rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-[1px] overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-between transition-all duration-300">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Por Vencer</p>
                <h3 className="text-4xl font-bold text-white">{isLoading ? "-" : licenciasVencidas}</h3>
              </div>
              <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Modules */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px bg-gradient-to-r from-slate-700 to-transparent flex-grow"></div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Módulos Operativos</h2>
          <div className="h-px bg-gradient-to-l from-slate-700 to-transparent flex-grow"></div>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Module 1: Titulares */}
          <div className="group rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm p-2 transition-all hover:bg-slate-800/50 hover:border-slate-700/80 shadow-xl">
            <div className="p-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-cyan-500/30">
                <UserCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gestión de Titulares</h3>
              <p className="text-slate-400 text-sm mb-8">Registra nuevos conductores en el sistema o actualiza sus datos personales y médicos.</p>
              
              <div className="space-y-3">
                <button onClick={() => navigateTo("/dashboard/titulares")} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all group/btn">
                  <span className="font-medium">Alta de Titular</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
                <button onClick={() => navigateTo("/dashboard/titulares/modificar")} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all group/btn">
                  <span className="font-medium">Modificar Datos</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Module 2: Licencias */}
          <div className="group rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm p-2 transition-all hover:bg-slate-800/50 hover:border-slate-700/80 shadow-xl">
            <div className="p-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/30">
                <IdCard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Centro de Emisión</h3>
              <p className="text-slate-400 text-sm mb-8">Administra el ciclo de vida completo de las licencias: emisión, renovación y copias.</p>
              
              <div className="space-y-3">
                <button onClick={() => navigateTo("/dashboard/licencias/emitir")} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all group/btn">
                  <span className="font-medium">Emitir Licencia</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
                <button onClick={() => navigateTo("/dashboard/licencias/renovar")} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all group/btn">
                  <span className="font-medium">Renovar Licencia</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
                <button onClick={() => navigateTo("/dashboard/licencias/copia")} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all group/btn">
                  <span className="font-medium">Emitir Copia</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Module 3: Reportes & Admin */}
          <div className="group rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm p-2 transition-all hover:bg-slate-800/50 hover:border-slate-700/80 shadow-xl">
            <div className="p-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/30">
                <Printer className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reportes e Impresión</h3>
              <p className="text-slate-400 text-sm mb-8">Genera documentos físicos, visualiza métricas y aplica filtros avanzados de búsqueda.</p>
              
              <div className="space-y-3">
                <button onClick={() => navigateTo("/dashboard/licencias/imprimir")} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all group/btn">
                  <span className="font-medium">Imprimir Licencia</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
                <button onClick={() => navigateTo("/dashboard/licencias/filtros")} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all group/btn">
                  <span className="font-medium">Búsqueda Avanzada</span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
                
                {role === "ADMIN" && (
                  <button onClick={() => navigateTo("/dashboard/operadores")} className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all group/btn mt-4">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      <span className="font-medium">Gestión de Operadores</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
