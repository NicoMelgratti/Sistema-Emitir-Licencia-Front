"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Eye, EyeOff, Info, CheckCircle, Lock, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import gsap from "gsap"
import { useIsMobile } from "@/hooks/use-mobile"
import { authService } from "@/services/auth-service"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false)

  const formRef = useRef(null)
  const titleRef = useRef(null)
  const inputsRef = useRef<(HTMLDivElement | HTMLInputElement | null)[]>([])
  const buttonRef = useRef(null)
  const passwordToggleRef = useRef<HTMLButtonElement>(null)
  const recoveryInfoRef = useRef<HTMLDivElement>(null)
  const errorMessageRef = useRef<HTMLDivElement>(null)
  
  const isMobile = useIsMobile()

  useEffect(() => {
    if (email.length === 0) {
      setEmailValid(null)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setEmailValid(emailRegex.test(email))
  }, [email])

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.fromTo(formRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
    tl.fromTo(titleRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4")
    inputsRef.current.forEach((input) => {
      tl.fromTo(input, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, "-=0.2")
    })
    tl.fromTo(buttonRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, "-=0.2")

    gsap.to(buttonRef.current, {
      boxShadow: "0 0 15px rgba(6, 182, 212, 0.4)",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
    })

    return () => gsap.killTweensOf("*")
  }, [])

  useEffect(() => {
    const toggleButton = passwordToggleRef.current
    if (!toggleButton) return

    const showPasswordHandler = () => {
      setShowPassword(true)
      gsap.to(toggleButton, { scale: 0.9, duration: 0.1 })
      if (isMobile && "vibrate" in navigator) {
        try { navigator.vibrate(10) } catch (e) {}
      }
    }
    const hidePasswordHandler = () => {
      setShowPassword(false)
      gsap.to(toggleButton, { scale: 1, duration: 0.1 })
    }

    toggleButton.addEventListener("mousedown", showPasswordHandler)
    toggleButton.addEventListener("mouseup", hidePasswordHandler)
    toggleButton.addEventListener("mouseleave", hidePasswordHandler)
    toggleButton.addEventListener("touchstart", showPasswordHandler)
    toggleButton.addEventListener("touchend", hidePasswordHandler)
    toggleButton.addEventListener("touchcancel", hidePasswordHandler)

    return () => {
      toggleButton.removeEventListener("mousedown", showPasswordHandler)
      toggleButton.removeEventListener("mouseup", hidePasswordHandler)
      toggleButton.removeEventListener("mouseleave", hidePasswordHandler)
      toggleButton.removeEventListener("touchstart", showPasswordHandler)
      toggleButton.removeEventListener("touchend", hidePasswordHandler)
      toggleButton.removeEventListener("touchcancel", hidePasswordHandler)
    }
  }, [isMobile])

  useEffect(() => {
    if (!recoveryInfoRef.current) return
    if (showRecoveryInfo) {
      gsap.fromTo(
        recoveryInfoRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      )
    } else {
      gsap.to(recoveryInfoRef.current, { height: 0, opacity: 0, y: -10, duration: 0.3, ease: "power2.in" })
    }
  }, [showRecoveryInfo])

  const handleRecoveryClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (errorMessageRef.current) {
      gsap.to(errorMessageRef.current, {
        opacity: 0, y: -10, scale: 0.95, duration: 0.3, ease: "power2.in",
        onComplete: () => {
          setError("")
          setShowRecoveryInfo(true)
        },
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    gsap.to(buttonRef.current, {
      scale: 0.95, duration: 0.1,
      onComplete: () => gsap.to(buttonRef.current, { scale: 1, duration: 0.1 }),
    })

    try {
      const response = await authService.login({ mail: email, password: password })

      if (response.success && response.token) {
        const userRole = authService.getUserRole()
        let frontendRole = "OPERADOR"
        if (userRole === "SUPER_USER" || email.includes("admin")) frontendRole = "ADMIN"
        else if (userRole === "OPERADOR") frontendRole = "OPERADOR"

        gsap.to(formRef.current, {
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
          borderColor: "rgba(16, 185, 129, 0.5)",
          duration: 0.3, yoyo: true, repeat: 1,
          onComplete: () => {
            gsap.to(formRef.current, {
              y: -30, opacity: 0, duration: 0.5,
              onComplete: () => {
                toast({ title: "Inicio de sesión exitoso", description: "Bienvenido al sistema" })
                router.push(`/dashboard?role=${frontendRole}`)
              },
            })
          },
        })
      } else {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        const errorMessage = response.message || "Credenciales inválidas. Por favor, intente nuevamente."

        if (newAttempts >= 3) setError("Múltiples intentos fallidos. ¿Olvidaste tu contraseña?")
        else setError(errorMessage)
        
        setShowRecoveryInfo(false)
        gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true })
        if (isMobile && "vibrate" in navigator) try { navigator.vibrate([30, 50, 30]) } catch (e) {}
        
        toast({ title: "Error de autenticación", description: errorMessage, variant: "destructive" })
      }
    } catch (err) {
      setError("Error al conectar con el servidor.")
      toast({ title: "Error de conexión", description: "No se pudo conectar con el servidor", variant: "destructive" })
      gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full bg-transparent border-none shadow-none" ref={formRef}>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div ref={errorMessageRef} className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-rose-400 text-sm font-medium">{error}</p>
                {loginAttempts >= 3 && (
                  <Button variant="link" className="p-0 h-auto text-xs text-rose-300 underline mt-1 hover:text-rose-200" onClick={handleRecoveryClick}>
                    Recuperar acceso
                  </Button>
                )}
              </div>
            </div>
          )}

          <div ref={recoveryInfoRef} className="overflow-hidden h-0 opacity-0">
            <Alert className="bg-indigo-500/10 border-indigo-500/30 rounded-xl">
              <Info className="h-4 w-4 text-indigo-400" />
              <AlertDescription className="text-indigo-300 text-sm">
                Para recuperar tu contraseña, contacta al administrador del sistema al correo soporte@municipio.gob
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-2" ref={(el) => { inputsRef.current[0] = el }}>
            <Label htmlFor="email" className="flex items-center gap-2 text-slate-300 font-medium">
              <Mail className="h-4 w-4 text-cyan-400" />
              Correo Electrónico
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="correo@municipio.gob"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500/50 transition-all pr-10 ${
                  emailValid === true ? "border-emerald-500/50 focus-visible:ring-emerald-500/50" : 
                  emailValid === false ? "border-rose-500/50 focus-visible:ring-rose-500/50" : ""
                }`}
              />
              {emailValid !== null && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {emailValid ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-rose-400" />}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2" ref={(el) => { inputsRef.current[1] = el }}>
            <Label htmlFor="password" className="flex items-center gap-2 text-slate-300 font-medium">
              <Lock className="h-4 w-4 text-cyan-400" />
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-900/50 border-slate-700 text-white focus-visible:ring-cyan-500/50 transition-all pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                ref={passwordToggleRef}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 focus:outline-none transition-colors"
                onContextMenu={(e) => e.preventDefault()}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 transition-all relative overflow-hidden group border-0"
            disabled={loading}
            ref={buttonRef}
          >
            <span className="relative z-10 font-bold tracking-wide">{loading ? "Validando..." : "Ingresar al Sistema"}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
