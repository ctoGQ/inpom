"use client"

import { useEffect, useRef } from "react"

const cards = [
  { image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-black-0aBd3LaMBBrIShqWZtY2IMJDaubFWn.png", label: "Black", code: "INPOM / BLACK" },
  { image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-gold-vHG68mRIsgnDlRj8J1tHxKS6QprtDK.png", label: "Gold", code: "INPOM / GOLD" },
  { image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-business-LSbBGlxtQ42dQC1ZITco7TuzkE9BMw.png", label: "Business Plus", code: "INPOM / BUSINESS" },
]

const codeLines = [
  "// compiled preview / scanner demo",
  "const SCAN_WIDTH = 8;",
  "const FADE_ZONE = 35;",
  "function clamp(n, a, b) {",
  "  return Math.max(a, Math.min(b, n));",
  "}",
  "const particle = { x, y, vx, vy };",
  "particle.step(deltaTime);",
  "render(card, scanner);",
  "const transition = 0.05;",
]

function CodeOverlay({ offset }: { offset: number }) {
  const lines = Array.from({ length: 17 }, (_, index) => codeLines[(index + offset) % codeLines.length])
  return <pre className="about-card-ascii-content">{lines.join("\n")}</pre>
}

function CardSet({ set }: { set: number }) {
  return <div className="about-card-line" aria-hidden="true">
    {cards.map((card, index) => <article key={`${set}-${card.code}`} className="about-card-item">
      <div className="about-card-normal">
        <img src={card.image} alt="" className="about-card-image" draggable="false" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-5 text-white">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">{card.code}</span>
          <div><p className="text-lg font-medium tracking-tight">{card.label}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">Захищена операція</p></div>
        </div>
      </div>
      <div className="about-card-ascii"><CodeOverlay offset={index} /></div>
    </article>)}
  </div>
}

export function AboutCard() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const line = lineRef.current
    const particleCanvas = particleCanvasRef.current
    const scannerCanvas = scannerCanvasRef.current
    if (!section || !line || !particleCanvas || !scannerCanvas) return

    const particleContext = particleCanvas.getContext("2d")
    const scannerContext = scannerCanvas.getContext("2d")
    if (!particleContext || !scannerContext) return

    const particles = Array.from({ length: 420 }, () => ({
      x: 0,
      y: Math.random() * 260,
      vx: 0.25 + Math.random() * 0.75,
      vy: (Math.random() - 0.5) * 0.2,
      radius: 0.5 + Math.random() * 1.5,
      alpha: 0.4 + Math.random() * 0.6,
      life: 0.4 + Math.random() * 0.6,
    }))

    let width = 0
    let position = 0
    let lineWidth = 0
    let animationFrame = 0
    let lastTime = performance.now()
    let dragging = false
    let lastPointerX = 0
    let pointerVelocity = 0
    let velocity = 120
    let direction = -1

    const resizeCanvas = (canvas: HTMLCanvasElement, height: number) => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const context = canvas.getContext("2d")
      context?.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const resize = () => {
      width = section.clientWidth
      lineWidth = line.scrollWidth
      resizeCanvas(particleCanvas, 260)
      resizeCanvas(scannerCanvas, 300)
      particles.forEach((particle) => { particle.x = width / 2 + (Math.random() - 0.5) * 8 })
    }

    const resetParticle = (particle: typeof particles[number]) => {
      particle.x = width / 2 + (Math.random() - 0.5) * 8
      particle.y = Math.random() * 260
      particle.vx = 0.25 + Math.random() * 0.75
      particle.vy = (Math.random() - 0.5) * 0.2
      particle.life = 1
    }

    const drawCanvases = () => {
      particleContext.clearRect(0, 0, width, 260)
      scannerContext.clearRect(0, 0, width, 300)
      particleContext.globalCompositeOperation = "lighter"
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.004
        if (particle.x > width + 10 || particle.life <= 0) resetParticle(particle)
        const fade = Math.min(1, particle.y / 45, (260 - particle.y) / 45)
        particleContext.globalAlpha = Math.max(0, fade) * particle.alpha * particle.life
        particleContext.fillStyle = "#d8d4fe"
        particleContext.beginPath()
        particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        particleContext.fill()
      })

      const beam = scannerContext.createLinearGradient(width / 2 - 12, 0, width / 2 + 12, 0)
      beam.addColorStop(0, "transparent")
      beam.addColorStop(0.5, "rgba(255,255,255,.98)")
      beam.addColorStop(1, "transparent")
      scannerContext.globalCompositeOperation = "lighter"
      scannerContext.fillStyle = beam
      scannerContext.fillRect(width / 2 - 12, 0, 24, 300)
      scannerContext.fillStyle = "rgba(255,255,255,.95)"
      scannerContext.fillRect(width / 2 - 1.5, 0, 3, 300)
    }

    const updateCardClipping = () => {
      const scannerLeft = section.getBoundingClientRect().left + width / 2 - 3
      const scannerRight = scannerLeft + 6
      line.querySelectorAll<HTMLElement>(".about-card-item").forEach((card) => {
        const rect = card.getBoundingClientRect()
        const normal = card.querySelector<HTMLElement>(".about-card-normal")
        const ascii = card.querySelector<HTMLElement>(".about-card-ascii")
        if (!normal || !ascii) return
        if (rect.left < scannerRight && rect.right > scannerLeft) {
          const left = Math.max(scannerLeft - rect.left, 0)
          const right = Math.min(scannerRight - rect.left, rect.width)
          normal.style.setProperty("--clip-left", `${(left / rect.width) * 100}%`)
          ascii.style.setProperty("--clip-left", `${(right / rect.width) * 100}%`)
        } else if (rect.right <= scannerLeft) {
          normal.style.setProperty("--clip-left", "100%")
          ascii.style.setProperty("--clip-left", "100%")
        } else {
          normal.style.setProperty("--clip-left", "0%")
          ascii.style.setProperty("--clip-left", "0%")
        }
      })
    }

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time
      if (!dragging) {
        velocity = Math.max(30, velocity * 0.95)
        position += velocity * direction * delta
        if (position < -lineWidth) position = width
        if (position > width) position = -lineWidth
        line.style.transform = `translate3d(${position}px, 0, 0)`
      }
      drawCanvases()
      updateCardClipping()
      animationFrame = requestAnimationFrame(animate)
    }

    const pointerDown = (event: PointerEvent) => {
      dragging = true
      lastPointerX = event.clientX
      pointerVelocity = 0
      line.setPointerCapture?.(event.pointerId)
      line.classList.add("is-dragging")
    }
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const delta = event.clientX - lastPointerX
      position += delta
      pointerVelocity = delta * 60
      lastPointerX = event.clientX
      line.style.transform = `translate3d(${position}px, 0, 0)`
    }
    const pointerUp = () => {
      if (!dragging) return
      dragging = false
      line.classList.remove("is-dragging")
      if (Math.abs(pointerVelocity) > 30) {
        velocity = Math.abs(pointerVelocity)
        direction = pointerVelocity > 0 ? 1 : -1
      }
    }
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      position += event.deltaY > 0 ? 20 : -20
    }

    resize()
    position = width
    line.style.transform = `translate3d(${position}px, 0, 0)`
    window.addEventListener("resize", resize)
    line.addEventListener("pointerdown", pointerDown)
    line.addEventListener("pointermove", pointerMove)
    line.addEventListener("pointerup", pointerUp)
    line.addEventListener("pointercancel", pointerUp)
    line.addEventListener("wheel", wheel, { passive: false })
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", resize)
      line.removeEventListener("pointerdown", pointerDown)
      line.removeEventListener("pointermove", pointerMove)
      line.removeEventListener("pointerup", pointerUp)
      line.removeEventListener("pointercancel", pointerUp)
      line.removeEventListener("wheel", wheel)
    }
  }, [])

  return (
    <section ref={sectionRef} className="about-card-section w-full overflow-hidden bg-black text-white" aria-labelledby="about-card-title">
      <div className="relative flex min-h-[34rem] flex-col justify-center overflow-hidden py-16 sm:min-h-[38rem] lg:min-h-[42rem]">
        <div className="about-card-particles" aria-hidden="true" />
        <canvas ref={particleCanvasRef} className="about-card-particle-canvas" aria-hidden="true" />
        <canvas ref={scannerCanvasRef} className="about-card-scanner-canvas" aria-hidden="true" />
        <div className="about-card-edge-fade" aria-hidden="true" />
        <div className="absolute inset-x-0 top-8 z-20 px-6 text-center sm:px-10 lg:px-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">INPOM / secure card layer</p>
          <h2 id="about-card-title" className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">Безпечні транзакції всередині INPOM</h2>
        </div>
        <div ref={lineRef} className="about-card-stream relative z-10 flex w-max gap-8 py-16 sm:gap-12">
          <CardSet set={0} />
          <CardSet set={1} />
        </div>
        <p className="absolute inset-x-6 bottom-8 z-20 mx-auto max-w-2xl text-center text-sm leading-relaxed text-white/65 sm:text-base">Кожна операція проходить у контрольованому середовищі: дані картки захищені, рух коштів прозорий, а доступ до транзакцій залишається у вашому кабінеті.</p>
      </div>
    </section>
  )
}
