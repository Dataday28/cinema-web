import { useEffect, useRef, useState } from 'react'
import { LogOut, Settings, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const links = [
	{ label: 'Inicio', href: '/inicio' },
	{ label: 'Películas', href: '/peliculas' },
	{ label: 'Series', href: '/series' },
	{ label: 'Mi lista', href: '/mi-lista' },
]

function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false)
	const [profileMenuOpen, setProfileMenuOpen] = useState(false)
	const profileMenuRef = useRef<HTMLDivElement>(null)
	const profileButtonRef = useRef<HTMLButtonElement>(null)
	const [isScrolled, setIsScrolled] = useState(false)
	const isHome = useLocation().pathname === '/'

	useEffect(() => {
		if (!profileMenuOpen) return

		const handlePointerDown = (event: PointerEvent) => {
			if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
				setProfileMenuOpen(false)
			}
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setProfileMenuOpen(false)
				profileButtonRef.current?.focus()
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [profileMenuOpen])

	useEffect(() => {
		const updateScrollState = () => setIsScrolled(window.scrollY > 0)

		updateScrollState()
		window.addEventListener('scroll', updateScrollState, { passive: true })

		return () => window.removeEventListener('scroll', updateScrollState)
	}, [])

	return (
		<header className={`fixed inset-x-0 top-0 z-50 px-8 py-2 ml-10 mr-10 rounded-b-3xl text-white transition-colors duration-500 ${isScrolled ? 'bg-linear-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm' : 'bg-transparent'}`}>
			<nav
				aria-label="Navegación principal"
				className="mx-auto flex min-h-18 max-w-[1800px] items-center gap-8 px-5 sm:px-8 lg:px-12"
			>
				<Link
					aria-label="Jellyfin, inicio"
					className="flex shrink-0 items-center gap-2.5"
					to="/"
				>
					<svg aria-hidden="true" className="h-9 w-9" viewBox="0 0 40 40" fill="none">
						<defs>
							<linearGradient id="jellyfin-mark" x1="8" y1="6" x2="32" y2="35" gradientUnits="userSpaceOnUse">
								<stop stopColor="#D45BDF" />
								<stop offset="1" stopColor="#39C9F2" />
							</linearGradient>
						</defs>
						<path d="M20 3.5c1.8 0 3.4.9 4.4 2.5l12 21.1c2 3.6-.5 8.1-4.6 8.1H8.2c-4.1 0-6.6-4.5-4.6-8.1l12-21.1c1-1.6 2.6-2.5 4.4-2.5Z" stroke="url(#jellyfin-mark)" strokeWidth="4.5" />
						<path d="m20 15.1 5.4 9.5H14.6l5.4-9.5Z" fill="url(#jellyfin-mark)" />
					</svg>
					<span className="text-[21px] font-semibold tracking-[-0.4px]">Jellyfin</span>
				</Link>

				<div className="hidden h-full items-center gap-8 md:flex">
					{links.map((link, index) => (
						<Link
							aria-current={index === 0 && isHome ? 'page' : undefined}
							className={`relative flex min-h-18 items-center text-[15px] font-medium transition-colors hover:text-white ${
								index === 0 && isHome
									? 'text-white after:absolute after:bottom-5.75 after:left-0 after:h-0.75 after:w-full after:rounded-full after:bg-cyan-400'
									: 'text-white/80'
							}`}
							to={link.href}
							key={link.label}
						>
							{link.label}
						</Link>
					))}
				</div>

				<div className="ml-auto flex items-center gap-4 sm:gap-6">
					<label className="hidden h-10 w-[min(24vw,280px)] items-center gap-2.5 rounded-full border border-white/10 bg-black/40 px-4 text-white/65 transition-colors focus-within:border-white/30 sm:flex">
						<svg aria-hidden="true" className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="none">
							<circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
							<path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
						<input
							aria-label="Buscar películas o series"
							className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/60"
							placeholder="Buscar películas, series..."
							type="search"
						/>
					</label>

					<button
						aria-label="Notificaciones"
						className="hidden h-10 w-8 items-center justify-center text-white transition-colors hover:text-cyan-300 sm:flex"
						type="button"
					>
						<svg aria-hidden="true" className="h-5.5 w-5.5" viewBox="0 0 24 24" fill="none">
							<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>

					<div
						className="relative"
						ref={profileMenuRef}
						onBlur={(event) => {
							if (!event.currentTarget.contains(event.relatedTarget)) setProfileMenuOpen(false)
						}}
					>
						<button
							aria-label="Perfil de usuario"
							aria-expanded={profileMenuOpen}
							aria-controls="profile-menu"
							className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-blue-500 text-sm font-semibold shadow-lg shadow-blue-950/30 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
							onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
							ref={profileButtonRef}
							type="button"
						>
							J
						</button>
						{profileMenuOpen && (
							<div id="profile-menu" className="absolute right-0 top-full mt-3 w-52 rounded-xl border border-white/10 bg-zinc-950/95 p-2 text-sm shadow-xl backdrop-blur-xl">
								<button type="button" className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-none">
									<User aria-hidden="true" className="h-4 w-4" />
									Mi perfil
								</button>
								<Link to="/settings" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-none">
									<Settings aria-hidden="true" className="h-4 w-4" />
									Configuración
								</Link>
								<button type="button" className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-none">
									<LogOut aria-hidden="true" className="h-4 w-4" />
									Cerrar sesión
								</button>
							</div>
						)}
					</div>

					<button
						aria-expanded={menuOpen}
						aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
						className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10 md:hidden"
						onClick={() => setMenuOpen((isOpen) => !isOpen)}
						type="button"
					>
						<svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
							{menuOpen ? (
								<path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
							) : (
								<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
							)}
						</svg>
					</button>
				</div>
			</nav>

			{menuOpen && (
				<div className="border-t border-white/10 bg-black/90 px-5 py-3 backdrop-blur-xl md:hidden">
					<div className="mx-auto flex max-w-[1800px] flex-col">
						{links.map((link, index) => (
							<Link
								aria-current={index === 0 && isHome ? 'page' : undefined}
								className={`border-b border-white/10 py-3 text-sm last:border-0 ${index === 0 && isHome ? 'text-cyan-300' : 'text-white/85'}`}
								to={link.href}
								key={link.label}
								onClick={() => setMenuOpen(false)}
							>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			)}
		</header>
	)
}

export default Navbar
