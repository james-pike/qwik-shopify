import { component$, Slot, useSignal, useVisibleTask$, useTask$, $ } from "@builder.io/qwik";
import { isServer } from "@builder.io/qwik/build";
import { Link } from "@builder.io/qwik-city";
import { Modal } from "@qwik-ui/headless";
import { getCart, removeFromCart, formatPrice } from "~/lib/shopify";
import type { ShopifyCart } from "~/lib/shopify";

export default component$(() => {
  const darkMode = useSignal(false);
  const cartCount = useSignal(0);
  const cartOpen = useSignal(false);
  const cartData = useSignal<ShopifyCart | null>(null);
  const cartLoading = useSignal(false);

  useVisibleTask$(() => {
    // Sync signal with current state (inline script in <head> already applied the class)
    darkMode.value = document.documentElement.classList.contains("dark");
    // Load cart count
    const count = localStorage.getItem("cart_count");
    if (count) cartCount.value = parseInt(count, 10);

    // Listen for cart updates from product pages
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart_count" && e.newValue) {
        cartCount.value = parseInt(e.newValue, 10);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  });

  // Fetch cart data from Shopify when drawer opens
  useTask$(async ({ track }) => {
    const isOpen = track(() => cartOpen.value);
    if (isServer || !isOpen) return;

    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    cartLoading.value = true;
    try {
      const cart = await getCart(cartId);
      cartData.value = cart;
      if (cart) {
        cartCount.value = cart.totalQuantity;
        localStorage.setItem("cart_count", String(cart.totalQuantity));
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      cartLoading.value = false;
    }
  });

  const removeLineItem = $(async (lineId: string) => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;
    try {
      const cart = await removeFromCart(cartId, [lineId]);
      cartData.value = cart;
      cartCount.value = cart.totalQuantity;
      localStorage.setItem("cart_count", String(cart.totalQuantity));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  });

  const toggleDarkMode = $(() => {
    const isDark = document.documentElement.classList.toggle("dark");
    darkMode.value = isDark;
    localStorage.setItem("darkMode", String(isDark));
  });

  return (
    <div class="max-w-site mx-auto bg-white dark:bg-[#121212] shadow-xl">
      {/* Announcement Bar */}
      <div class="bg-dark text-white py-2 px-4 md:px-8 text-[0.65rem] md:text-[0.8rem] font-medium tracking-wider whitespace-nowrap overflow-hidden text-ellipsis text-center md:text-left">
        <div class="flex items-center justify-between">
          <span>
            <span class="text-primary font-bold">WE ARE OPEN</span> &mdash; 595
            West Hunt Club Road, Nepean, ON &bull; Mon-Sat &bull; 613-224-6804
          </span>
          <nav class="hidden md:flex items-center gap-5">
            <Link href="/about/" class="text-[0.8rem] font-semibold text-white/60 hover:text-white transition-colors">ABOUT</Link>
            <Link href="/faq/" class="text-[0.8rem] font-semibold text-white/60 hover:text-white transition-colors">FAQ</Link>
            <Link href="/contact/" class="text-[0.8rem] font-semibold text-white/60 hover:text-white transition-colors">CONTACT</Link>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header class="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[100] shadow-sm pl-3 pr-2 md:px-4">
        <div class="py-1 md:py-2 flex items-center justify-between">
          <Link href="/" class="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <img
              src="/logo.png"
              alt="The Safety House"
              width="210"
              height="60"
              class="object-contain w-[220px] md:w-[280px] dark:invert"
            />
            <img
              src="/flag.webp"
              alt=""
              width="32"
              height="32"
              class="w-8 h-8 md:w-9 md:h-9 object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav class="hidden md:flex items-center gap-7">
            <Link href="/collections/work-wear/" class="nav-link">Work Wear</Link>
            <Link href="/collections/safety-footwear/" class="nav-link">Safety Footwear</Link>
            <Link href="/collections/safety-supplies/" class="nav-link">Safety Supplies</Link>
            <Link href="/collections/flame-resistant/" class="nav-link">Flame Resistant</Link>
            <Link href="/collections/school-wear/" class="nav-link">School & Sports Wear</Link>
          </nav>

          <div class="flex items-center gap-1">
            {/* Cart button + drawer */}
            <Modal.Root bind:show={cartOpen}>
              <Modal.Trigger
                class="relative flex items-center justify-center w-10 h-10 bg-transparent border-none text-gray-600 dark:text-gray-300 hover:text-dark dark:hover:text-white transition-colors"
                aria-label="Open cart"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount.value > 0 && (
                  <span class="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                    {cartCount.value}
                  </span>
                )}
              </Modal.Trigger>
              <Modal.Panel class="cart-sheet">
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 class="text-lg font-bold">Your Cart</h2>
                  <Modal.Close class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-dark dark:hover:text-white bg-transparent border-none text-xl">
                    &times;
                  </Modal.Close>
                </div>

                <div class="flex-1 overflow-y-auto p-4">
                  {cartLoading.value ? (
                    <div class="flex items-center justify-center py-12">
                      <div class="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : !cartData.value || cartData.value.lines.edges.length === 0 ? (
                    <div class="text-center py-12">
                      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <p class="text-gray-500 dark:text-gray-400 text-sm">Your cart is empty</p>
                      <Modal.Close class="bg-transparent border-none p-0 mt-4">
                        <Link href="/" class="inline-flex items-center justify-center py-2.5 px-6 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
                          Continue Shopping
                        </Link>
                      </Modal.Close>
                    </div>
                  ) : (
                    <div class="flex flex-col gap-4">
                      {cartData.value.lines.edges.map((edge) => {
                        const line = edge.node;
                        const product = line.merchandise.product;
                        return (
                          <div key={line.id} class="flex gap-3">
                            {product.featuredImage ? (
                              <Link href={`/product/${product.handle}/`} class="flex-shrink-0">
                                <img
                                  src={product.featuredImage.url}
                                  alt={product.featuredImage.altText || product.title}
                                  width={72}
                                  height={72}
                                  class="w-[72px] h-[72px] rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                />
                              </Link>
                            ) : (
                              <div class="w-[72px] h-[72px] rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                            )}
                            <div class="flex-1 min-w-0">
                              <Link href={`/product/${product.handle}/`} class="text-sm font-semibold leading-snug hover:text-primary transition-colors line-clamp-2">
                                {product.title}
                              </Link>
                              {line.merchandise.title !== "Default Title" && (
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{line.merchandise.title}</p>
                              )}
                              <div class="flex items-center justify-between mt-1.5">
                                <span class="text-xs text-gray-500 dark:text-gray-400">Qty: {line.quantity}</span>
                                <div class="flex items-center gap-2">
                                  <button
                                    type="button"
                                    class="text-gray-400 hover:text-red-500 transition-colors bg-transparent border-none p-0"
                                    aria-label="Remove item"
                                    onClick$={() => removeLineItem(line.id)}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                  <span class="text-sm font-bold text-primary">
                                    {formatPrice(line.merchandise.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {cartData.value && cartData.value.lines.edges.length > 0 && (
                  <div class="border-t border-gray-200 dark:border-gray-700 p-4">
                    <div class="flex items-center justify-between mb-4">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span class="text-lg font-bold">
                        {formatPrice(cartData.value.cost.subtotalAmount)}
                      </span>
                    </div>
                    <a
                      href={cartData.value.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block w-full text-center py-3 px-6 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      Checkout
                    </a>
                  </div>
                )}
              </Modal.Panel>
            </Modal.Root>

            {/* Mobile hamburger menu */}
            <Modal.Root>
              <Modal.Trigger class="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 bg-transparent border-none">
                <span class="block w-5 h-0.5 bg-dark dark:bg-white rounded-full" />
                <span class="block w-5 h-0.5 bg-dark dark:bg-white rounded-full" />
                <span class="block w-5 h-0.5 bg-dark dark:bg-white rounded-full" />
              </Modal.Trigger>
            <Modal.Panel class="mobile-sheet">
              <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <img src="/logo.png" alt="The Safety House" width="180" height="52" class="object-contain w-[180px] dark:invert" />
                  <img src="/flag.webp" alt="" width="32" height="32" class="w-8 h-8 object-contain" />
                </div>
                <Modal.Close class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-dark dark:hover:text-white bg-transparent border-none text-xl">
                  &times;
                </Modal.Close>
              </div>
              <nav class="flex flex-col p-4 gap-1 overflow-y-auto">
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/collections/work-wear/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    Work Wear
                  </Link>
                </Modal.Close>
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/collections/safety-footwear/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    Safety Footwear
                  </Link>
                </Modal.Close>
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/collections/safety-supplies/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    Safety Supplies
                  </Link>
                </Modal.Close>
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/collections/flame-resistant/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    Flame Resistant
                  </Link>
                </Modal.Close>
                <Modal.Close class="bg-transparent border-none text-left">
                  <Link href="/collections/school-wear/" class="block py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    School & Sports Wear
                  </Link>
                </Modal.Close>
              </nav>
              <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
                <p class="text-xs text-gray-400">613-224-6804</p>
                <p class="text-xs text-gray-400">info@safetyhouse.ca</p>
              </div>
              </Modal.Panel>
            </Modal.Root>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Slot />

      {/* Footer */}
      <footer class="bg-dark text-white/80 mt-16">
        <div class="pt-10 px-4 pb-6 md:pt-14 md:px-8 md:pb-8">
          <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-14 mb-10">
            <div>
              <img
                src="/logo.png"
                alt="The Safety House"
                width="160"
                height="46"
                class="object-contain w-[160px] invert mb-3"
              />
              <p class="text-sm leading-relaxed text-white/50 mb-4">
                Where work and lifestyle apparel intersect. Your one stop shop
                for quality specialized clothing, safety footwear, and in-house
                embroidery services.
              </p>
              <div class="flex items-center gap-3">
                <a href="https://www.instagram.com/thesafetyhouse/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="https://www.facebook.com/thesafetyhouse/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="mailto:info@safetyhouse.ca" aria-label="Email" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </a>
                <a href="tel:613-224-6804" aria-label="Phone" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </a>
              </div>
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
                595 West Hunt Club Rd
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
            <span>&copy; {new Date().getFullYear()} The Safety House. All rights reserved.</span>
            <button
              onClick$={toggleDarkMode}
              class="text-white/50 hover:text-white transition-colors text-base bg-transparent border-none"
              aria-label="Toggle dark mode"
            >
              {darkMode.value ? "\u2600\uFE0F" : "\uD83C\uDF19"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
});
