import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-serif text-stone-100 text-lg mb-3">Niche Design Studios</p>
          <p className="text-sm leading-relaxed">
            Interior architecture for spaces that reflect who you are.
            Based on Capitol Hill, Washington DC.
          </p>
        </div>

        <div>
          <p className="text-stone-100 text-xs tracking-widest uppercase mb-4">Navigate</p>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/about', label: 'About' },
              { href: '/portfolio', label: 'Portfolio' },
              { href: '/blog', label: 'Journal' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-stone-100 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-stone-100 text-xs tracking-widest uppercase mb-4">Get In Touch</p>
          <p className="text-sm">Capitol Hill, Washington DC</p>
          <a
            href="mailto:hello@nichedesignstudios.com"
            className="text-sm hover:text-stone-100 transition-colors"
          >
            hello@nichedesignstudios.com
          </a>
        </div>
      </div>

      <div className="border-t border-stone-800 max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-600">
        <p>&copy; {new Date().getFullYear()} Niche Design Studios. All rights reserved.</p>
        <Link href="/studio" className="hover:text-stone-400 transition-colors">
          Studio
        </Link>
      </div>
    </footer>
  )
}
