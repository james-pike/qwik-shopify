import { component$, Slot, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { Modal } from "@qwik-ui/headless";

export default component$(() => {
  const darkMode = useSignal(false);

  useVisibleTask$(() => {
    // Sync signal with current state (inline script in <head> already applied the class)
    darkMode.value = document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = $(() => {
    const isDark = document.documentElement.classList.toggle("dark");
    darkMode.value = isDark;
    localStorage.setItem("darkMode", String(isDark));
  });

  return (
    <>
      {/* Announcement Bar */}
      <div class="bg-dark text-white text-center py-2 px-4 text-[0.8rem] font-medium tracking-wider">
        <span class="text-primary font-bold">WE ARE OPEN</span> &mdash; 595
        West Hunt Club Road, Nepean, ON &bull; Mon-Sat &bull; 613-224-6804
      </div>

      {/* Header */}
      <header class="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[100] shadow-sm">
        <div class="max-w-site mx-auto py-1 md:py-2 px-4 md:px-8 flex items-center justify-between">
          <Link href="/" class="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <img
              src="/logo.png"
              alt="The Safety House"
              width="210"
              height="60"
              class="object-contain w-[190px] md:w-[240px] dark:invert"
            />
            <img
              src="/flag.webp"
              alt=""
              width="32"
              height="32"
              class="w-7 h-7 md:w-8 md:h-8 object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav class="hidden md:flex items-center gap-7">
            <Link href="/" class="nav-link">Shop</Link>
            <Link href="/about/" class="nav-link">About</Link>
            <Link href="/faq/" class="nav-link">FAQ</Link>
            <Link href="/contact/" class="nav-link">Contact</Link>
          </nav>

          {/* Mobile hamburger menu */}
          <Modal.Root>
            <Modal.Trigger class="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 bg-transparent border-none">
              <span class="block w-5 h-0.5 bg-dark dark:bg-white rounded-full" />
              <span class="block w-5 h-0.5 bg-dark dark:bg-white rounded-full" />
              <span class="block w-5 h-0.5 bg-dark dark:bg-white rounded-full" />
            </Modal.Trigger>
            <Modal.Panel class="mobile-sheet">
              <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <img src="/logo.png" alt="The Safety House" width="180" height="52" class="object-contain w-[180px] dark:invert" />
                <Modal.Close class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-dark dark:hover:text-white bg-transparent border-none text-xl">
                  &times;
                </Modal.Close>
              </div>
              <nav class="flex flex-col p-4 gap-1 overflow-y-auto">
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    Shop
                  </Link>
                </Modal.Close>
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/about/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    About
                  </Link>
                </Modal.Close>
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/faq/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    FAQ
                  </Link>
                </Modal.Close>
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/contact/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    Contact
                  </Link>
                </Modal.Close>
                <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p class="px-3 py-2 text-[0.7rem] uppercase tracking-[0.12em] text-gray-400 font-semibold">Collections</p>
                  <Modal.Close class="bg-transparent border-none text-left">
                    <Link href="/collections/work-wear/" class="block py-2.5 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                      Work Wear
                    </Link>
                  </Modal.Close>
                  <Modal.Close class="bg-transparent border-none text-left">
                    <Link href="/collections/safety-footwear/" class="block py-2.5 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                      Safety Footwear
                    </Link>
                  </Modal.Close>
                  <Modal.Close class="bg-transparent border-none text-left">
                    <Link href="/collections/safety-supplies/" class="block py-2.5 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                      Safety Supplies
                    </Link>
                  </Modal.Close>
                  <Modal.Close class="bg-transparent border-none text-left">
                    <Link href="/collections/flame-resistant/" class="block py-2.5 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                      Flame Resistant
                    </Link>
                  </Modal.Close>
                  <Modal.Close class="bg-transparent border-none text-left">
                    <Link href="/collections/school-wear/" class="block py-2.5 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                      School Wear
                    </Link>
                  </Modal.Close>
                </div>
              </nav>
              <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
                <p class="text-xs text-gray-400">613-224-6804</p>
                <p class="text-xs text-gray-400">info@safetyhouse.ca</p>
              </div>
            </Modal.Panel>
          </Modal.Root>
        </div>
      </header>

      {/* Main Content */}
      <Slot />

      {/* Footer */}
      <footer class="bg-dark text-white/80 mt-16">
        <div class="max-w-site mx-auto pt-14 px-8 pb-8">
          <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-10">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <img
                  src="/logo.png"
                  alt="The Safety House"
                  width="160"
                  height="46"
                  class="object-contain w-[160px] invert"
                />
                <img
                  src="/flag.webp"
                  alt=""
                  width="28"
                  height="28"
                  class="w-7 h-7 object-contain"
                />
              </div>
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
            <button
              onClick$={toggleDarkMode}
              class="text-white/50 hover:text-white transition-colors text-base bg-transparent border-none"
              aria-label="Toggle dark mode"
            >
              {darkMode.value ? "\u2600\uFE0F" : "\uD83C\uDF19"}
            </button>
            <span>Powered by Qwik + Shopify</span>
          </div>
        </div>
      </footer>
    </>
  );
});
