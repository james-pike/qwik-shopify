import { component$, useSignal, useComputed$, $, useOnDocument, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, Link, useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getCollectionByHandle, formatPrice } from "~/lib/shopify";
import type { ShopifyProduct } from "~/lib/shopify";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-asc", label: "Price \u2191" },
  { value: "price-desc", label: "Price \u2193" },
  { value: "title-asc", label: "A\u2013Z" },
  { value: "title-desc", label: "Z\u2013A" },
  { value: "best-selling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
];

function sortProducts(products: ShopifyProduct[], sortValue: string): ShopifyProduct[] {
  if (!sortValue) return products;
  const sorted = [...products];
  switch (sortValue) {
    case "price-asc":
      return sorted.sort((a, b) =>
        parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
    case "price-desc":
      return sorted.sort((a, b) =>
        parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "newest":
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "best-selling":
      return products; // collection default order from Shopify
    default:
      return products;
  }
}

export const useCollection = routeLoader$(async (requestEvent) => {
  const handle = requestEvent.params.handle;
  const collection = await getCollectionByHandle(handle, 50);

  if (!collection) {
    requestEvent.status(404);
    return null;
  }

  return collection;
});

export default component$(() => {
  const collection = useCollection();
  const location = useLocation();
  const brandFilterOpen = useSignal(false);
  const selectedBrands = useSignal<string[]>([]);
  const currentSort = useSignal(location.url.searchParams.get("sort") || "");
  const gridCols = useSignal<1 | 2>(2);

  useOnDocument(
    "click",
    $((e: Event) => {
      if (!brandFilterOpen.value) return;
      const target = e.target as HTMLElement;
      if (!target.closest("[data-brand-filter]")) {
        brandFilterOpen.value = false;
      }
    }),
  );

  if (!collection.value) {
    return (
      <div class="text-center py-24 px-8">
        <h1 class="text-2xl font-bold mb-4">Collection not found</h1>
        <Link
          href="/"
          class="inline-flex items-center justify-center py-3 px-7 text-[0.9rem] font-semibold rounded-lg border-none transition-all duration-200 bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const c = collection.value;
  const allProducts = c.products.edges.map((e) => e.node);

  const brands = useComputed$(() => {
    const vendorSet = new Set<string>();
    for (const p of allProducts) {
      if (p.vendor) vendorSet.add(p.vendor);
    }
    return [...vendorSet].sort();
  });

  const filteredProducts = useComputed$(() => {
    const sorted = sortProducts(allProducts, currentSort.value);
    if (selectedBrands.value.length === 0) return sorted;
    return sorted.filter((p: ShopifyProduct) =>
      selectedBrands.value.includes(p.vendor),
    );
  });

  const heroData: Record<string, { subtitle?: string; img2?: string }> = {
    "work-wear": { img2: "/workwear.jpg" },
    "safety-footwear": {
      subtitle: "Looking for Work Wear or Footwear? We've got you covered. The Safety House carries the best brands of men's and women's work clothing and footwear.",
      img2: "/footwear.jpg",
    },
    "flame-resistant": { img2: "/flame-resistant-clothing.jpg" },
    "safety-supplies": { img2: "/safety-supplies.jpg" },
    "school-wear": { img2: "/schoolwear.jpg" },
  };
  const hero = heroData[c.handle] || {};
  const heroImg = c.image?.url;
  const heroImg2 = hero.img2 || null;
  const heroImages = [heroImg, heroImg2].filter(Boolean) as string[];
  const heroSlide = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (heroImages.length < 2) return;
    const id = setInterval(() => {
      heroSlide.value = heroSlide.value === 0 ? 1 : 0;
    }, 5000);
    cleanup(() => clearInterval(id));
  });

  return (
    <>
      <div class="relative text-white h-[40svh] px-8 text-center overflow-hidden flex flex-col items-center justify-center">
        {heroImages.length > 0 ? (
          heroImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={c.image?.altText || ""}
              width={1400}
              height={600}
              fetchPriority={i === 0 ? "high" : "auto"}
              class={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${heroSlide.value === i ? "opacity-100" : "opacity-0"}`}
            />
          ))
        ) : null}
        <div class="absolute inset-0 bg-gradient-to-br from-dark/60 to-[#2d2d2d]/50" />
        {heroImages.length === 0 && (
          <div class="absolute inset-0 bg-gradient-to-br from-dark to-[#2d2d2d]" />
        )}
        <h1 class="relative z-10 text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{c.title}</h1>
        {hero.subtitle ? (
          <p class="relative z-10 text-white/60 text-lg max-w-[560px] mx-auto leading-relaxed">{hero.subtitle}</p>
        ) : (
          c.description && <p class="relative z-10 text-white/60 text-lg max-w-[560px] mx-auto leading-relaxed">{c.description}</p>
        )}
      </div>

      <div class="bg-white dark:bg-[#1a1a1a] border-b border-gray-200/60 dark:border-gray-700/40 px-4 md:px-8 py-3 md:py-4">
        <div class="flex items-center justify-between mb-2 md:hidden">
          <nav class="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            <Link href="/" class="text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
              Collections
            </Link>
            <span class="text-gray-400 dark:text-gray-500">/</span>
            <span class="font-medium text-gray-900 dark:text-white">{c.title}</span>
          </nav>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {selectedBrands.value.length > 0
              ? `${filteredProducts.value.length} of ${allProducts.length} products`
              : `${allProducts.length} products`}
          </span>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 mb-2 md:hidden">
          {/* Grid toggle - mobile */}
          <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden mr-auto">
            <button
              type="button"
              aria-label="2 column grid"
              class={`p-1.5 transition-colors ${gridCols.value === 2 ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              onClick$={() => { gridCols.value = 2; }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="1 column list"
              class={`p-1.5 transition-colors ${gridCols.value === 1 ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              onClick$={() => { gridCols.value = 1; }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="1" width="14" height="6" rx="1" />
                <rect x="1" y="9" width="14" height="6" rx="1" />
              </svg>
            </button>
          </div>
          {/* Sort dropdown - mobile */}
          <div class="flex items-center gap-2">
            <select
              id="sort-select-mobile"
              aria-label="Sort by"
              class="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={currentSort.value}
              onChange$={(_, el) => {
                const val = el.value;
                currentSort.value = val;
                const url = new URL(window.location.href);
                if (val) {
                  url.searchParams.set("sort", val);
                } else {
                  url.searchParams.delete("sort");
                }
                history.replaceState(null, "", url.pathname + url.search);
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} selected={opt.value === currentSort.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand filter - mobile */}
          {brands.value.length > 1 && (
            <div class="relative" data-brand-filter>
              <button
                type="button"
                class="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 cursor-pointer flex items-center gap-1.5 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                onClick$={() => { brandFilterOpen.value = !brandFilterOpen.value; }}
              >
                Brand
                {selectedBrands.value.length > 0 && (
                  <span class="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {selectedBrands.value.length}
                  </span>
                )}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {brandFilterOpen.value && (
                <div class="absolute top-full right-0 mt-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[200px] py-2">
                  {selectedBrands.value.length > 0 && (
                    <button
                      type="button"
                      class="w-full text-left px-4 py-1.5 text-xs text-primary hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                      onClick$={() => { selectedBrands.value = []; }}
                    >
                      Clear all
                    </button>
                  )}
                  {brands.value.map((brand) => (
                    <label
                      key={brand}
                      class="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50"
                        checked={selectedBrands.value.includes(brand)}
                        onChange$={() => {
                          const current = [...selectedBrands.value];
                          const idx = current.indexOf(brand);
                          if (idx >= 0) {
                            current.splice(idx, 1);
                          } else {
                            current.push(brand);
                          }
                          selectedBrands.value = current;
                        }}
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div class="hidden md:flex flex-wrap items-center justify-between gap-3 mb-3">
          <nav class="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            <Link href="/" class="text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
              Collections
            </Link>
            <span class="text-gray-400 dark:text-gray-500">/</span>
            <span class="font-medium text-gray-900 dark:text-white">{c.title}</span>
          </nav>

          <div class="flex flex-wrap items-center gap-3">
          {/* Sort dropdown */}
          <div class="flex items-center gap-2">
            <label for="sort-select" class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Sort by:
            </label>
            <select
              id="sort-select"
              class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={currentSort.value}
              onChange$={(_, el) => {
                const val = el.value;
                currentSort.value = val;
                const url = new URL(window.location.href);
                if (val) {
                  url.searchParams.set("sort", val);
                } else {
                  url.searchParams.delete("sort");
                }
                history.replaceState(null, "", url.pathname + url.search);
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} selected={opt.value === currentSort.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand filter dropdown */}
          {brands.value.length > 1 && (
            <div class="relative" data-brand-filter>
              <button
                type="button"
                class="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 cursor-pointer flex items-center gap-2 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                onClick$={() => { brandFilterOpen.value = !brandFilterOpen.value; }}
              >
                Brand
                {selectedBrands.value.length > 0 && (
                  <span class="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedBrands.value.length}
                  </span>
                )}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {brandFilterOpen.value && (
                <div class="absolute top-full left-0 mt-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[200px] py-2">
                  {selectedBrands.value.length > 0 && (
                    <button
                      type="button"
                      class="w-full text-left px-4 py-1.5 text-xs text-primary hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                      onClick$={() => { selectedBrands.value = []; }}
                    >
                      Clear all
                    </button>
                  )}
                  {brands.value.map((brand) => (
                    <label
                      key={brand}
                      class="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50"
                        checked={selectedBrands.value.includes(brand)}
                        onChange$={() => {
                          const current = [...selectedBrands.value];
                          const idx = current.indexOf(brand);
                          if (idx >= 0) {
                            current.splice(idx, 1);
                          } else {
                            current.push(brand);
                          }
                          selectedBrands.value = current;
                        }}
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <span class="text-sm text-gray-500 dark:text-gray-400">
            {selectedBrands.value.length > 0
              ? `${filteredProducts.value.length} of ${allProducts.length} products`
              : `${allProducts.length} products`}
          </span>
          </div>
        </div>

      </div>

      <section class="px-4 md:px-8 py-4 md:py-5">
        {filteredProducts.value.length === 0 ? (
          <p class="text-center text-gray-500 dark:text-gray-400 py-12">
            {allProducts.length === 0
              ? "No products in this collection yet."
              : "No products match the selected filters."}
          </p>
        ) : (
          <div class={`grid gap-3 md:gap-5 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] ${gridCols.value === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {filteredProducts.value.map((product: ShopifyProduct) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}/?collection=${c.handle}`}
                class="group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
              >
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    width={400}
                    height={400}
                    class="w-full aspect-square md:h-[280px] md:aspect-auto object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div class="w-full aspect-square md:h-[280px] md:aspect-auto bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                )}
                <div class="p-4 px-5 flex-1 flex flex-col">
                  {product.vendor && (
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      {product.vendor}
                    </span>
                  )}
                  <h3 class="text-[0.95rem] font-semibold mb-1 leading-snug">
                    {product.title}
                  </h3>
                  <span class="text-base font-bold text-primary mt-auto pt-2">
                    {formatPrice(product.priceRange.minVariantPrice)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const collection = resolveValue(useCollection);
  const heroImg = collection?.image?.url;
  return {
    title: collection
      ? `${collection.title} | The Safety House`
      : "Collection Not Found | The Safety House",
    meta: [
      {
        name: "description",
        content: collection?.description || "Browse our collection",
      },
    ],
    links: heroImg
      ? [{ rel: "preload", as: "image", href: heroImg }]
      : [],
  };
};
