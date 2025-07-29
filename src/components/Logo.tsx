interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'text'
}

export default function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  }

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} aspect-square flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M50 10 A40 40 0 0 1 85.36 35 L75 42.5 A25 25 0 0 0 50 25 Z"
          fill="#344968"
          className="opacity-90"
        />
        <path
          d="M85.36 35 A40 40 0 0 1 85.36 65 L75 57.5 A25 25 0 0 0 75 42.5 Z"
          fill="#c1a679"
          className="opacity-90"
        />
        <path
          d="M85.36 65 A40 40 0 0 1 50 90 L50 75 A25 25 0 0 0 75 57.5 Z"
          fill="#344968"
          className="opacity-70"
        />
        <path
          d="M50 90 A40 40 0 0 1 14.64 65 L25 57.5 A25 25 0 0 0 50 75 Z"
          fill="#c1a679"
          className="opacity-70"
        />
        <path
          d="M14.64 65 A40 40 0 0 1 14.64 35 L25 42.5 A25 25 0 0 0 25 57.5 Z"
          fill="#344968"
          className="opacity-50"
        />
        <path
          d="M14.64 35 A40 40 0 0 1 50 10 L50 25 A25 25 0 0 0 25 42.5 Z"
          fill="#c1a679"
          className="opacity-50"
        />
        <path
          d="M45 35 L55 35 L55 45 L65 45 L50 60 L35 45 L45 45 Z"
          fill="#344968"
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  )

  const LogoText = () => (
    <div className="flex flex-col">
      <span className="font-bold text-primary-800 text-lg leading-tight">SEBASTIAN</span>
      <span className="font-bold text-primary-800 text-lg leading-tight">BUNDE</span>
      <span className="text-secondary-600 text-xs font-medium tracking-wider uppercase">VERTRIEBSTRAINING</span>
    </div>
  )

  if (variant === 'icon') {
    return <LogoIcon />
  }

  if (variant === 'text') {
    return <LogoText />
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  )
}