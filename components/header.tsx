"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, LoaderPinwheel, Gem, User } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name?: string; avatar_url?: string } | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data.user)
      }
    } catch (err) {
      console.error("Auth check failed:", err)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  return (
    <header className="fixed top-0 z-99 w-full">
      <nav className="bg-background py-0 px-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="pl-3 flex items-center gap-2">
            <Link
              href="/"
              className="p-1"
            >
            <Image
              src="/home/inpom-logo.png"
              alt="Inpom Logo"
              width={48}
              height={48}
              className="w-8 h-8"
            />
            </Link>
          </div>
          <div className="pl-3 flex items-center gap-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="py-1 px-2 rounded-lg text-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center cursor-pointer border-0 font-medium transition-all duration-300 ease-in-out"
            >
              <Plus className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
              
            </button>
            <Link
              href="/community"
              className="md:flex hidden py-1 px-2 text-sm text-primary rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              Спільнота
            </Link>
            <Link
              href="/development"
              className="md:flex hidden py-1 px-2 text-sm text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              Розвиток
            </Link>
            <Link
              href="/business"
              className="md:flex hidden py-1 px-2 text-sm text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              Бізнес
            </Link>
            <span className="text-xs text-muted-foreground">|</span>
            <Link
              href="/international"
              className="md:flex hidden py-1 px-2 text-sm text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              Міжнародні можливості
            </Link>
            <Link
              href="/about"
              className="md:flex hidden py-1 px-2 text-sm text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              Про INPOM
            </Link>
            <Link
              href="/partnership"
              className="md:flex hidden py-1 px-2 text-sm text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              Партнерство
            </Link>
            <Link
              href="/newsletter"
              className="md:flex hidden py-1 px-2 text-sm text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              Новини
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
              href="/partnership"
              className="md:flex relative hidden py-1 px-2 text-sm text-primary rounded-lg bg-card hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
            <Gem className="mr-2 w-4 h-4 transition-transform duration-300" />
            Підтримати INPOM
            </Link>
          <Link
              href="/projects"
              className="md:flex hidden py-1 px-2 text-sm text-muted-foreground rounded-lg hover:bg-primary hover:text-primary-foreground font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
            <LoaderPinwheel className="mr-2 w-4 h-4 transition-transform duration-300" />
            Проєкти
            </Link>
          
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="md:flex hidden p-1 text-sm text-primary rounded-full bg-card font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
            >
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="md:flex hidden py-1 px-2 text-sm text-primary rounded-lg bg-card font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
              >
                Увійти
              </Link>
              
              <Link
                href="/signup"
                className="md:flex hidden py-1 px-2 text-sm text-primary-foreground rounded-lg bg-primary font-medium transition-all duration-300 ease-in-out flex items-center justify-center"
              >
                Приєднатися
              </Link>
            </>
          )}

          
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute left-2 right-2 md:left-0 md:right-0 top-full bg-background border-0 text-foreground overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="p-6"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="space-y-3 md:flex md:flex-wrap md:gap-3 mb-3"
              >
                <Link
                  href="/projects"
                  className="px-12 h-12 md:h-10 text-md md:text-xs uppercase text-foreground rounded-full bg-card hover:bg-primary hover:text-primary-foreground font-[300] transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  Можливості
                </Link>
                {/* <Link
                  href="/ambassadors"
                  className="px-12 h-12 md:h-10 text-md md:text-xs uppercase text-foreground rounded-full bg-card hover:bg-primary hover:text-primary-foreground font-[300] transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  Амбасадорки
                </Link> */}
                <Link
                  href="/newsletter"
                  className="px-12 h-12 md:h-10 text-md md:text-xs uppercase text-foreground rounded-full bg-card hover:bg-primary hover:text-primary-foreground font-[300] transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  Новини
                </Link>
                <Link
                  href="/about"
                  className="px-12 h-12 md:h-10 text-md md:text-xs uppercase text-foreground rounded-full bg-card hover:bg-primary hover:text-primary-foreground font-[300] transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  Хто ми
                </Link>
                <Link
                  href="/contacts"
                  className="px-12 h-12 md:h-10 text-md md:text-xs uppercase text-foreground rounded-full bg-card hover:bg-primary hover:text-primary-foreground font-[300] transition-all duration-300 ease-in-out flex items-center justify-center"
                >
                  Контакти
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="my-8 md:my-4 flex justify-center md:justify-start"
              >
                <Link href="#" className="text-lg md:text-left text-center md:text-xs text-foreground/70 hover:text-foreground transition-colors duration-300 ease-in-out">
                  Instagram
                </Link>
                {/* <Link href="#" className="text-lg w-1/2 md:text-left text-center md:text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 ease-in-out">
                  LinkedIn
                </Link> */}
              </motion.div>

                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="md:text-xs text-md md:text-left text-center text-foreground/70"
              >
                wbc.vision® - 2026
                <br />
                ALL RIGHTS RESERVED.
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
