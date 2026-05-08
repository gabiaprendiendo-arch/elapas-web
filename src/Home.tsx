import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Home = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // URLs de las imágenes solicitadas
  const logoUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiu_CoWVLiecz8J-hTXqX84seXbiEMkqjIqw&s";
  const heroUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGlzawZugQbd-R-LyLvdS3LVBz1THcE0Yhwg&s";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Geist Variable', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,55,176,0.08)' : 'none',
          boxShadow: scrolled ? '0 2px 24px rgba(0,55,176,0.07)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO ELAPAS CAMBIADO POR IMAGEN */}
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #0037B0 0%, #0052CC 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <span className="font-bold text-blue-900 text-base tracking-tight leading-none block">ELAPAS</span>
              <span className="text-xs text-blue-400 leading-none">Agua Potable · Sucre</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            {[
              { label: 'Inicio', href: '#' },
              { label: 'Servicios', href: '#servicios' },
              { label: 'Pagos', href: '#pagos' },
              { label: 'Institucional', href: '#institucional' },
            ].map((item, i) => (
              <a key={item.label} href={item.href}
                style={{ color: i === 0 ? '#0037B0' : '#374151', textDecoration: 'none' }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login?tipo=admin')}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{ color: '#0037B0', border: '1.5px solid #0037B0', background: 'transparent' }}
            >
              Administración
            </button>
            <button
              onClick={() => navigate('/login?tipo=ciudadano')}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #0037B0 0%, #0052CC 100%)', color: 'white', boxShadow: '0 2px 12px rgba(0,55,176,0.3)' }}
            >
              Soy Ciudadano
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f0fe 40%, #f5faff 100%)' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(73,199,225,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,55,176,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-8 pt-36 pb-20 flex flex-col lg:flex-row items-center gap-14 relative z-10">
          <div className="flex-1 max-w-2xl">

            <h1 className="font-bold leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem,5vw,3.75rem)', color: '#0a1628', letterSpacing: '-0.02em' }}>
              Gestiona tu<br />servicio de agua<br />
              <span style={{ background: 'linear-gradient(90deg, #0037B0, #49C7E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                desde casa
              </span>
            </h1>

            <p className="text-lg mb-8 leading-relaxed" style={{ color: '#64748b', maxWidth: 480 }}>
              Consulta tu consumo mensual, descarga tus facturas digitales y realiza tus pagos de forma segura con QR Simple.
            </p>

            <div className="flex items-center gap-8 mb-9">
              {[
                { value: '+50K', label: 'Usuarios activos' },
                { value: '99.8%', label: 'Disponibilidad' },
                { value: '24/7', label: 'Soporte técnico' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold" style={{ color: '#0037B0' }}>{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login?tipo=ciudadano')}
                className="flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0037B0 0%, #0052CC 100%)', color: 'white', boxShadow: '0 4px 20px rgba(0,55,176,0.35)' }}
              >
                Acceder al Portal
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-xl"
                style={{ background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Guía de Usuario
              </button>
            </div>
          </div>

          <div className="flex-1 relative max-w-lg w-full">
            <div style={{ borderRadius: 24, overflow: 'hidden', height: 420, boxShadow: '0 30px 80px rgba(0,55,176,0.18), 0 8px 32px rgba(0,0,0,0.1)', position: 'relative' }}>
              {/* IMAGEN HERO CAMBIADA */}
              <img
                src={heroUrl}
                alt="Agua potable ELAPAS"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,10,40,0.3) 0%, transparent 50%)' }} />
            </div>

            <div style={{ position: 'absolute', bottom: 24, left: -24, background: 'white', borderRadius: 16, padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', gap: 12, alignItems: 'center', maxWidth: 260, border: '1px solid rgba(0,55,176,0.08)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #0037B0, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm8-1h7v7h-7V3zm1 1v5h5V4h-5zM3 11h7v7H3v-7zm1 1v5h5v-5H4zm11 0h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4-6h2v2h-2v-2zm0 4h2v2h-2v-2zM5 5h3v3H5V5zm8 0h3v3h-3V5zM5 13h3v3H5v-3z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Nuevo método</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Pago QR Simple</p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 2, margin: 0 }}>Paga desde tu app bancaria al instante</p>
              </div>
            </div>

            <div style={{ position: 'absolute', top: 24, right: -20, background: 'white', borderRadius: 12, padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', gap: 8, alignItems: 'center', border: '1px solid rgba(0,55,176,0.08)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)' }} />
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-3" style={{ color: '#0a1628', letterSpacing: '-0.02em' }}>Servicios en Línea</h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: '#64748b' }}>
              Digitalizamos nuestros procesos para brindarte una atención más rápida, eficiente y transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                iconBg: '#eff6ff', iconColor: '#0037B0',
                title: 'Consulta tu consumo',
                desc: 'Accede al histórico de tus lecturas y mantén un control detallado de tu consumo mensual de agua.',
                cta: 'Consultar ahora',
              },
              {
                icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                iconBg: '#eff6ff', iconColor: '#0037B0',
                title: 'Descarga tu factura',
                desc: 'Obtén tus facturas vigentes en formato PDF listas para imprimir o archivar digitalmente.',
                cta: 'Descargar PDF',
              },
              {
                icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3V3zm14 0h4v4h-4V3zm0 14h4v4h-4v-4zM3 14h7v7H3v-7zm4 3h-1v1h1v-1zm10-3h1v1h-1v-1zm1 1h1v1h-1v-1zm-1 1h1v1h-1v-1zm1 1h1v1h-1v-1zm-3-3h1v1h-1v-1zm0 4h1v1h-1v-1zM5 5h3v3H5V5zm14 0h2v2h-2V5zM5 15h3v3H5v-3zm14 2h2v2h-2v-2z" /></svg>,
                iconBg: '#fff7ed', iconColor: '#f97316',
                title: 'Paga con código QR',
                desc: 'Realiza tus pagos de forma inmediata sin filas ni demoras a través de cualquier banca móvil.',
                cta: 'Ir a pagar',
              },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-2xl p-7 cursor-pointer"
                style={{ background: 'white', border: '1.5px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.25s ease' }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.boxShadow = '0 12px 40px rgba(0,55,176,0.1)'
                  el.style.borderColor = '#dbeafe'
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
                  el.style.borderColor = '#f1f5f9'
                  el.style.transform = 'translateY(0)'
                }}
                onClick={() => navigate('/login?tipo=ciudadano')}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, marginBottom: 18 }}>
                  {s.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#0f172a' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>{s.desc}</p>
                <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: s.iconColor }}>
                  {s.cta}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-8" style={{ background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f0fe 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#0a1628', letterSpacing: '-0.01em' }}>
            Tu servicio de agua, siempre a la mano
          </h2>
          <p className="text-base mb-8" style={{ color: '#64748b' }}>
            Accede al portal ciudadano o al panel de administración de forma segura.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/login?tipo=ciudadano')}
              className="px-8 py-3.5 font-semibold rounded-xl text-sm"
              style={{ background: 'linear-gradient(135deg, #0037B0, #0052CC)', color: 'white', boxShadow: '0 4px 20px rgba(0,55,176,0.3)' }}
            >
              Portal Ciudadano
            </button>
            <button
              onClick={() => navigate('/login?tipo=admin')}
              className="px-8 py-3.5 font-semibold rounded-xl text-sm"
              style={{ background: 'white', color: '#0037B0', border: '1.5px solid #0037B0' }}
            >
              Panel Administración
            </button>
          </div>
        </div>
      </section>

      {/* ── EMERGENCIAS ── */}
      <section className="py-20 px-8 relative overflow-hidden" style={{ background: '#0a1e4a' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(73,199,225,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: '-0.01em' }}>
                ¿Necesitas asistencia inmediata?
              </h2>
              <p className="text-base leading-relaxed" style={{ color: '#94a3b8', maxWidth: 480 }}>
                Nuestro equipo técnico está disponible las 24 horas para atender emergencias, fugas o consultas sobre tu conexión.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                {
                  href: 'tel:116',
                  icon: <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
                  iconBg: 'linear-gradient(135deg, #0037B0, #0052CC)',
                  title: 'Central de Emergencias',
                  sub: '116 · Línea Gratuita',
                },
                {
                  href: 'https://wa.me/59146454500',
                  icon: <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
                  iconBg: '#25D366',
                  title: 'Chat WhatsApp',
                  sub: '+591 4 6454500',
                },
              ].map(contact => (
                <a
                  key={contact.title}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 no-underline"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget).style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => (e.currentTarget).style.background = 'rgba(255,255,255,0.07)'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: contact.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {contact.icon}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{contact.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#49C7E1' }}>{contact.sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* LOGO FOOTER CAMBIADO POR IMAGEN */}
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #0037B0, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: '#374151' }}>ELAPAS · Sucre, Bolivia</span>
          </div>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            © {new Date().getFullYear()} ELAPAS. Empresa Local de Agua Potable y Alcantarillado de Sucre.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home