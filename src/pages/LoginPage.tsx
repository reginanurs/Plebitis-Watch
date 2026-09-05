import { Eye, EyeOff, Lock, LogIn, UserRound } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface FormErrors {
  username?: string
  password?: string
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const formId = useId()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loginError, setLoginError] = useState<string | null>(null)

  function fieldId(name: string) {
    return `${formId}-${name}`
  }

  function inputClass(hasError: boolean) {
    return `w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 ${
      hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-200 focus:border-teal-700 focus:ring-teal-700'
    }`
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const validationErrors: FormErrors = {}
    if (!username.trim()) validationErrors.username = 'Identitas pengguna wajib diisi.'
    if (!password) validationErrors.password = 'Kata sandi wajib diisi.'

    setErrors(validationErrors)
    setLoginError(null)

    if (Object.keys(validationErrors).length > 0) return

    const success = login(username, password)
    if (!success) {
      setLoginError('Identitas pengguna atau kata sandi tidak sesuai.')
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4 py-10">
      <div className="animate-card-in w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-20 w-20 items-center justify-center">
            <img src="/logo.png" alt="Logo PLEBITIS WATCH" className="h-full w-full object-contain" />
          </span>
          <h1 className="text-xl font-bold text-teal-900">PLEBITIS WATCH</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor Flebitis, Cegah Komplikasi</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor={fieldId('username')} className="mb-1 block text-sm font-medium text-gray-700">
              Identitas Pengguna
            </label>
            <div className="relative">
              <UserRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id={fieldId('username')}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setErrors((prev) => ({ ...prev, username: undefined }))
                  setLoginError(null)
                }}
                aria-invalid={Boolean(errors.username)}
                className={inputClass(Boolean(errors.username))}
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor={fieldId('password')} className="mb-1 block text-sm font-medium text-gray-700">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id={fieldId('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrors((prev) => ({ ...prev, password: undefined }))
                  setLoginError(null)
                }}
                aria-invalid={Boolean(errors.password)}
                className={`${inputClass(Boolean(errors.password))} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          {loginError && (
            <div role="alert" className="animate-fade-in-up rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-900 active:scale-[0.98]"
          >
            <LogIn size={18} />
            Masuk
          </button>
        </form>

        <div className="mt-5 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-600">Demo akun prototype:</p>
          <p>Identitas: perawat1 • Kata sandi: perawat123</p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">Prototype — autentikasi simulasi</p>
      </div>
    </div>
  )
}

export default LoginPage
