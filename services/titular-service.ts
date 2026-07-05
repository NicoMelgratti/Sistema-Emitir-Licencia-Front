// Interfaces para los tipos de datos
export interface Titular {
  id: number
  tipoDocumento: string
  numeroDocumento: string
  nombre: string
  apellido: string
  nombreApellido: string // Mantener para compatibilidad
  fechaNacimiento: string
  direccion: string
  grupoSanguineo: string
  factorRh: string
  donanteOrganos: string
  fechaAlta: string
}

export interface TitularesResponse {
  success: boolean
  message: string
  titulares: Titular[]
  total: number
}

export interface TitularResponse {
  success: boolean
  message: string
  titular: Titular
}

export interface TitularStats {
  total: number
  porGrupoSanguineo: {
    [key: string]: number
  }
  porFactorRh: {
    positivo: number
    negativo: number
  }
  porDonanteOrganos: {
    si: number
    no: number
  }
  nuevosUltimos30Dias: number
}

// Interfaz para los datos que vienen del formulario
interface DatosFormulario {
  nombre: string
  apellido: string
  fechaNacimiento: string
  tipoDocumento: string
  numeroDocumento: string
  grupoSanguineo: string
  factorRh: string
  direccion: string
  donanteOrganos: boolean
}

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Función para obtener los headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// Función para manejar errores de autenticación (SOLO 401, NO 403)
const handleAuthError = (status: number) => {
  // SOLO redirigir en caso de 401 (token inválido/expirado)
  // NO redirigir en caso de 403 (sin permisos pero token válido)
  if (status === 401) {
    console.log(`❌ Error 401: Token inválido o expirado`)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    window.location.href = "/"
    return true
  }
  return false
}

// Servicio para la gestión de titulares
export const titularService = {
  // Listar todos los titulares
  listarTitulares: async (filtros?: any): Promise<TitularesResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) queryParams.append(key, value as string)
        })
      }

      const response = await fetch(`${API_URL}/titulares?${queryParams.toString()}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titulares: [],
          total: 0,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al listar titulares:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al listar titulares",
        titulares: [],
        total: 0,
      }
    }
  },

  // Obtener un titular por ID
  obtenerTitular: async (id: number): Promise<TitularResponse> => {
    try {
      const response = await fetch(`${API_URL}/titulares/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al obtener titular con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al obtener titular",
        titular: {} as Titular,
      }
    }
  },

  // Obtener un titular por tipo y número de documento
  obtenerTitularPorDocumento: async (tipoDocumento: string, numeroDocumento: string): Promise<TitularResponse> => {
    try {
      // Convertir el tipo de documento a mayúsculas para la API
      const tipoDocumentoAPI = tipoDocumento.toUpperCase()

      console.log(`🔍 Verificando si existe titular: ${tipoDocumentoAPI} ${numeroDocumento}`)

      const response = await fetch(
        `${API_URL}/titulares?tipoDocumento=${tipoDocumentoAPI}&numeroDocumento=${numeroDocumento}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      )

      // Manejar errores de autenticación (SOLO 401)
      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      // Capturar el texto de la respuesta primero
      const responseText = await response.text()

      // Si es 404, significa que el titular no existe (esto es normal al verificar antes de crear)
      if (response.status === 404) {
        console.log(`✅ Titular no existe (404) - se puede proceder a crear`)
        return {
          success: false,
          message: "Titular no encontrado",
          titular: {} as Titular,
        }
      }

      // Si es 403, OPERADOR no tiene permisos para buscar, pero puede crear
      if (response.status === 403) {
        console.log(`⚠️ OPERADOR sin permisos para buscar (403) - asumiendo que no existe y se puede crear`)
        return {
          success: false,
          message: "Sin permisos para verificar titular existente - se procederá a crear",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        // Para otros errores, intentar parsear el mensaje
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        try {
          if (responseText) {
            const errorJson = JSON.parse(responseText)
            errorMessage = errorJson.message || errorJson.error || errorMessage
          }
        } catch (parseError) {
          console.error("No se pudo parsear el error como JSON:", parseError)
        }

        // No lanzar error para 403, solo para otros códigos
        console.log(`⚠️ Error ${response.status} al verificar titular: ${errorMessage}`)
        return {
          success: false,
          message: errorMessage,
          titular: {} as Titular,
        }
      }

      // Parsear la respuesta JSON solo si hay contenido
      let titularData
      try {
        if (responseText) {
          titularData = JSON.parse(responseText)
        } else {
          throw new Error("La respuesta del servidor está vacía")
        }
      } catch (parseError) {
        console.error("Error al parsear la respuesta JSON:", parseError)
        return {
          success: false,
          message: "La respuesta del servidor no es un JSON válido",
          titular: {} as Titular,
        }
      }

      // Verificar si los datos del titular están presentes
      if (!titularData || !titularData.id) {
        console.log(`✅ No se encontró titular con los datos proporcionados - se puede crear`)
        return {
          success: false,
          message: "No se encontró el titular con los datos proporcionados",
          titular: {} as Titular,
        }
      }

      // Transformar la respuesta del backend al formato esperado por el frontend
      const titular: Titular = {
        id: titularData.id,
        tipoDocumento: titularData.tipoDocumento,
        numeroDocumento: titularData.numeroDocumento,
        nombre: titularData.nombre,
        apellido: titularData.apellido,
        nombreApellido: `${titularData.nombre} ${titularData.apellido}`,
        fechaNacimiento: titularData.fechaNacimiento,
        direccion: titularData.direccion,
        grupoSanguineo: titularData.grupoSanguineo,
        factorRh: titularData.factorRh === "POSITIVO" ? "+" : "-",
        donanteOrganos: titularData.donanteOrganos ? "Si" : "No",
        fechaAlta: titularData.fechaAlta || new Date().toISOString().split("T")[0],
      }

      console.log(`✅ Titular encontrado:`, titular)
      return {
        success: true,
        message: "Titular encontrado",
        titular: titular,
      }
    } catch (error) {
      console.error(`❌ Error al verificar titular con documento ${tipoDocumento} ${numeroDocumento}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al buscar titular",
        titular: {} as Titular,
      }
    }
  },

  // Crear un nuevo titular
  crearTitular: async (datos: DatosFormulario): Promise<TitularResponse> => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      return {
        success: false,
        message: "Debe iniciar sesión para crear un titular",
        titular: {} as Titular,
      }
    }

    try {
      console.log("=== CREAR TITULAR ===")
      console.log("📤 Enviando al backend:", JSON.stringify(datos, null, 2))

      const response = await fetch(`${API_URL}/titulares`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      })

      console.log("📥 Status de respuesta:", response.status)

      // IMPORTANTE: Solo manejar 401, NO 403
      if (handleAuthError(response.status)) {
        console.log("❌ Error 401: Token inválido, redirigiendo al login...")
        return {
          success: false,
          message: "Sesión expirada. Por favor, inicie sesión nuevamente.",
          titular: {} as Titular,
        }
      }

      // Capturar la respuesta como texto primero
      const responseText = await response.text()

      // Si es 403, NO redirigir, solo mostrar error
      if (response.status === 403) {
        console.log("⚠️ Error 403: Sin permisos para crear titular")
        return {
          success: false,
          message: "No tiene permisos para crear titulares. Contacte al administrador.",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        // Intentar parsear el error del backend
        let errorMessage = `Error ${response.status}: ${response.statusText}`

        try {
          if (responseText) {
            const errorJson = JSON.parse(responseText)
            errorMessage = errorJson.message || errorJson.error || errorMessage
          }
        } catch (parseError) {
          console.error("No se pudo parsear el error como JSON:", parseError)
          errorMessage = responseText || errorMessage
        }

        console.error("❌ Error del backend:", errorMessage)

        return {
          success: false,
          message: errorMessage,
          titular: {} as Titular,
        }
      }

      // Parsear la respuesta exitosa
      let responseData
      try {
        if (responseText) {
          responseData = JSON.parse(responseText)
        } else {
          throw new Error("La respuesta del servidor está vacía")
        }
      } catch (parseError) {
        console.error("Error al parsear la respuesta JSON:", parseError)
        return {
          success: false,
          message: "Error al procesar la respuesta del servidor",
          titular: {} as Titular,
        }
      }

      console.log("✅ Titular creado exitosamente:", responseData)

      // Transformar la respuesta del backend al formato esperado por el frontend
      const titularCreado: Titular = {
        id: responseData.id,
        tipoDocumento: responseData.tipoDocumento,
        numeroDocumento: responseData.numeroDocumento,
        nombre: responseData.nombre,
        apellido: responseData.apellido,
        nombreApellido: `${responseData.nombre} ${responseData.apellido}`,
        fechaNacimiento: responseData.fechaNacimiento,
        direccion: responseData.direccion,
        grupoSanguineo: responseData.grupoSanguineo,
        factorRh: responseData.factorRh === "POSITIVO" ? "+" : "-",
        donanteOrganos: responseData.donanteOrganos ? "Si" : "No",
        fechaAlta: new Date().toISOString().split("T")[0],
      }

      return {
        success: true,
        message: "Titular creado correctamente",
        titular: titularCreado,
      }
    } catch (error) {
      console.error("❌ Error al crear titular:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al crear titular",
        titular: {} as Titular,
      }
    }
  },

  // Actualizar un titular existente
  actualizarTitular: async (
    id: number,
    datos: Partial<Omit<Titular, "id" | "fechaAlta">>,
  ): Promise<TitularResponse> => {
    try {
      const response = await fetch(`${API_URL}/titulares/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al actualizar titular con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al actualizar titular",
        titular: {} as Titular,
      }
    }
  },

  // Actualizar un titular por tipo y número de documento
  actualizarTitularPorDocumento: async (
    tipoDocumento: string,
    numeroDocumento: string,
    datos: Partial<Omit<Titular, "id" | "tipoDocumento" | "numeroDocumento" | "fechaAlta">>,
  ): Promise<TitularResponse> => {
    try {
      const response = await fetch(`${API_URL}/titulares/documento?tipo=${tipoDocumento}&numero=${numeroDocumento}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(datos),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
          titular: {} as Titular,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al actualizar titular con documento ${tipoDocumento} ${numeroDocumento}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al actualizar titular",
        titular: {} as Titular,
      }
    }
  },

  // Eliminar un titular
  eliminarTitular: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_URL}/titulares/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          success: false,
          message: "Sesión expirada",
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error al eliminar titular con ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al eliminar titular",
      }
    }
  },

  // Obtener estadísticas de titulares
  obtenerEstadisticas: async (): Promise<TitularStats> => {
    try {
      const response = await fetch(`${API_URL}/titulares/estadisticas`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (handleAuthError(response.status)) {
        return {
          total: 0,
          porGrupoSanguineo: { "0": 0, A: 0, B: 0, AB: 0 },
          porFactorRh: { positivo: 0, negativo: 0 },
          porDonanteOrganos: { si: 0, no: 0 },
          nuevosUltimos30Dias: 0,
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${response.statusText || errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al obtener estadísticas de titulares:", error)
      return {
        total: 0,
        porGrupoSanguineo: { "0": 0, A: 0, B: 0, AB: 0 },
        porFactorRh: { positivo: 0, negativo: 0 },
        porDonanteOrganos: { si: 0, no: 0 },
        nuevosUltimos30Dias: 0,
      }
    }
  },
}
