import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      {/* Announcement Bar */}
      <div class="bg-dark text-white text-center py-2 px-4 text-[0.8rem] font-medium tracking-wider">
        <span class="text-primary font-bold">WE ARE OPEN</span> &mdash; 595
        West Hunt Club Road, Nepean, ON &bull; Mon-Sat &bull; 613-224-6804
      </div>

      {/* Header */}
      <header class="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
        <div class="max-w-site mx-auto py-1 md:py-2 px-4 md:px-8 flex items-center justify-between">
          <Link href="/" class="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <img
              src="/logo.png"
              alt="The Safety House"
              width="170"
              height="48"
              class="object-contain w-[170px] md:w-[210px]"
            />
          </Link>
          <nav class="flex items-center gap-3 xs:gap-4 md:gap-7">
            <Link href="/" class="nav-link">Shop</Link>
            <Link href="/about/" class="nav-link">About</Link>
            <Link href="/faq/" class="nav-link">FAQ</Link>
            <Link href="/contact/" class="nav-link">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <Slot />

      {/* Footer */}
      <footer class="bg-dark text-white/80 mt-16">
        <div class="max-w-site mx-auto pt-14 px-8 pb-8">
          <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-10">
            <div>
              <h3 class="text-lg font-extrabold text-white mb-3">
                THE SAFETY <span class="text-primary">HOUSE</span>
              </h3>
              <p class="text-sm leading-relaxed text-white/50">
                Where work and lifestyle apparel intersect. Your one stop shop
                for quality specialized clothing, safety footwear, and in-house
                embroidery services.
              </p>
            </div>
            <div class="grid grid-cols-2 md:contents gap-8">
              <div>
                <h4 class="text-[0.7rem] uppercase tracking-[0.12em] text-white/40 font-semibold mb-3">
                  Shop
                </h4>
                <Link href="/collections/work-wear/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">Work Wear</Link>
                <Link href="/collections/safety-footwear/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">Safety Footwear</Link>
                <Link href="/collections/safety-supplies/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">Safety Supplies</Link>
                <Link href="/collections/flame-resistant/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">Flame Resistant</Link>
                <Link href="/collections/school-wear/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">School Wear</Link>
              </div>
              <div>
                <h4 class="text-[0.7rem] uppercase tracking-[0.12em] text-white/40 font-semibold mb-3">
                  Info
                </h4>
                <Link href="/about/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">About Us</Link>
                <Link href="/faq/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">FAQ</Link>
                <Link href="/contact/" class="block text-sm text-white/65 py-0.5 transition-colors hover:text-white">Contact</Link>
              </div>
            </div>
            <div>
              <h4 class="text-[0.7rem] uppercase tracking-[0.12em] text-white/40 font-semibold mb-3">
                Visit Us
              </h4>
              <p class="text-sm text-white/65 leading-relaxed">
                595 West Hunt Club Road
                <br />
                Nepean, ON K2G 5X6
                <br />
                <br />
                613-224-6804
                <br />
                info@safetyhouse.ca
              </p>
            </div>
          </div>
          <div class="border-t border-white/10 pt-6 flex justify-between items-center text-xs text-white/35">
            <span>&copy; {new Date().getFullYear()} The Safety House</span>
            <span>Powered by Qwik + Shopify</span>
          </div>
        </div>
      </footer>
    </>
  );
});
