interface AvatarProps {
  user?: {
    name: string
    avatarUrl?: string
    role?: string
  }
  name?: string
  avatarUrl?: string
  role?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Avatar({ 
  user, 
  name = user?.name || 'U', 
  avatarUrl = user?.avatarUrl, 
  role = user?.role || 'user',
  size = 'md',
  className = '' 
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-6 h-6 text-xs', 
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  }

  const roleColors = {
    admin: 'bg-primary-600',
    trainer: 'bg-secondary-600', 
    user: 'bg-primary-600'
  }

  const displayName = name || 'U'
  const initials = displayName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
  const colorClass = roleColors[role as keyof typeof roleColors] || roleColors.user

  // If we have a valid avatar URL, try to use it
  if (avatarUrl && avatarUrl.startsWith('http')) {
    return (
      <img 
        src={avatarUrl}
        alt={displayName}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // Fallback to initials on error
          const target = e.target as HTMLImageElement
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `
              <div class="${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-medium ${className}">
                ${initials}
              </div>
            `
          }
        }}
      />
    )
  }

  // Default to initials in colored circle
  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-medium ${className}`}>
      {initials}
    </div>
  )
}