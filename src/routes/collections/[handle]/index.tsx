import { component$, useSignal, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, Link, useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getCollectionByHandle, formatPrice } from "~/lib/shopify";
import type { ShopifyProduct } from "~/lib/shopify";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
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

  const heroData: Record<string, { img?: string; subtitle?: string }> = {
    "safety-footwear": {
      subtitle: "Looking for Work Wear or Footwear? We've got you covered. The Safety House carries the best brands of men's and women's work clothing and footwear.",
    },
  };
  const hero = heroData[c.handle] || {};
  const heroImg = hero.img || c.image?.url;

  return (
    <>
      <div class="relative text-white py-20 md:py-28 px-8 text-center overflow-hidden">
        {heroImg ? (
          <>
            <img
              src={heroImg}
              alt={c.image?.altText || ""}
              width={1400}
              height={600}
              fetchPriority="high"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-br from-dark/60 to-[#2d2d2d]/50" />
          </>
        ) : (
          <div class="absolute inset-0 bg-gradient-to-br from-dark to-[#2d2d2d]" />
        )}
        <h1 class="relative z-10 text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{c.title}</h1>
        {hero.subtitle ? (
          <p class="relative z-10 text-white/60 text-base max-w-[560px] mx-auto leading-relaxed">{hero.subtitle}</p>
        ) : (
          c.description && <p class="relative z-10 text-white/60 text-base max-w-[560px] mx-auto leading-relaxed">{c.description}</p>
        )}
      </div>

      <section class="px-4 md:px-8 py-8 md:py-16">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <nav class="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            <Link href="/" class="text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
              Home
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
            <div class="relative">
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

        {filteredProducts.value.length === 0 ? (
          <p class="text-center text-gray-500 dark:text-gray-400 py-12">
            {allProducts.length === 0
              ? "No products in this collection yet."
              : "No products match the selected filters."}
          </p>
        ) : (
          <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
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
                    class="w-full h-[280px] object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div class="w-full h-[280px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
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
