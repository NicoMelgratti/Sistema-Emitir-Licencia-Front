import LoginForm from "@/components/login-form"
import Image from "next/image"
import AuthGuard from "@/components/auth-guard"

export default function Home() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-200 font-sans relative overflow-hidden">
        
        {/* Background gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        </div>

        {/* Governmental Header */}
        <header className="w-full bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/60 py-4 px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 p-2 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center">
              <Image
                src="/images/logo-licencias-nuevo.png"
                alt="Logo Gobierno SF"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Gobierno de Santa Fe
              </h1>
              <p className="text-sm text-cyan-400/80">Ministerio de Transporte</p>
            </div>
          </div>
          <div className="hidden md:flex text-sm font-medium opacity-90 text-slate-400">
            <span>Portal Oficial del Estado</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row z-10">
          
          {/* Information Section */}
          <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 lg:p-16 relative">
            <div className="max-w-xl">
              <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                Servicios Digitales
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                Sistema Integral de Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Licencias</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Plataforma oficial para la emisión, renovación y administración de licencias de conducir. 
                Acceso restringido únicamente a personal autorizado del gobierno.
              </p>
            </div>
          </div>

          {/* Login Form Section */}
          <div className="w-full md:w-1/2 lg:w-5/12 flex items-center justify-center p-8 lg:p-12 relative">
            <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none"></div>
            
            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-cyan-900/10 border border-slate-800/80 relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Ingreso de Operadores</h3>
                <p className="text-sm text-slate-400">Ingrese sus credenciales gubernamentales</p>
              </div>
              <LoginForm />
              <div className="mt-8 text-center text-xs text-slate-500">
                <p>El acceso no autorizado será penalizado por la ley.</p>
                <p className="mt-1">© {new Date().getFullYear()} Gobierno Municipal. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
