import { component$, useSignal, useComputed$, $, useOnDocument, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, Link, useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getCollectionByHandle, getCollectionProducts, formatPrice } from "~/lib/shopify";
import type { ShopifyProduct } from "~/lib/shopify";

const SORT_OPTIONS = [
  { value: "newest", label: "Latest" },
  { value: "price-asc", label: "Price \u2191" },
  { value: "price-desc", label: "Price \u2193" },
  { value: "title-asc", label: "A\u2013Z" },
  { value: "title-desc", label: "Z\u2013A" },
  { value: "best-selling", label: "Popular" },
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
  const collection = await getCollectionByHandle(handle, 20);

  if (!collection) {
    requestEvent.status(404);
    return null;
  }

  return collection;
});

export default component$(() => {
  const collection = useCollection();
  const location = useLocation();
  const currentSort = useSignal(location.url.searchParams.get("sort") || "newest");
  const gridCols = useSignal<1 | 2>(2);

  // Filter dropdown state
  const brandFilterOpen = useSignal(false);
  const typeFilterOpen = useSignal(false);
  const sizeFilterOpen = useSignal(false);
  const selectedBrands = useSignal<string[]>([]);
  const selectedTypes = useSignal<string[]>([]);
  const selectedSizes = useSignal<string[]>([]);
  const inStockOnly = useSignal(false);

  const closeAllDropdowns = $(() => {
    brandFilterOpen.value = false;
    typeFilterOpen.value = false;
    sizeFilterOpen.value = false;
  });

  useOnDocument(
    "click",
    $((e: Event) => {
      const target = e.target as HTMLElement;
      if (brandFilterOpen.value && !target.closest("[data-brand-filter]")) {
        brandFilterOpen.value = false;
      }
      if (typeFilterOpen.value && !target.closest("[data-type-filter]")) {
        typeFilterOpen.value = false;
      }
      if (sizeFilterOpen.value && !target.closest("[data-size-filter]")) {
        sizeFilterOpen.value = false;
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

  // Pagination state
  const loadedProducts = useSignal<ShopifyProduct[]>(c.products.edges.map((e) => e.node));
  const endCursor = useSignal<string | null>(c.products.pageInfo.endCursor);
  const hasNextPage = useSignal(c.products.pageInfo.hasNextPage);
  const loadingMore = useSignal(false);

  const loadMore = $(async () => {
    if (!hasNextPage.value || loadingMore.value) return;
    loadingMore.value = true;
    try {
      const result = await getCollectionProducts(c.handle, 20, endCursor.value || undefined);
      loadedProducts.value = [...loadedProducts.value, ...result.products];
      endCursor.value = result.pageInfo.endCursor;
      hasNextPage.value = result.pageInfo.hasNextPage;
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      loadingMore.value = false;
    }
  });

  const brands = useComputed$(() => {
    const vendorSet = new Set<string>();
    for (const p of loadedProducts.value) {
      if (p.vendor) vendorSet.add(p.vendor);
    }
    return [...vendorSet].sort();
  });

  const productTypes = useComputed$(() => {
    const typeSet = new Set<string>();
    for (const p of loadedProducts.value) {
      if (p.productType) typeSet.add(p.productType);
    }
    return [...typeSet].sort();
  });

  const sizes = useComputed$(() => {
    const sizeSet = new Set<string>();
    for (const p of loadedProducts.value) {
      if (!p.options) continue;
      const sizeOpt = p.options.find((o) => o.name.toLowerCase() === "size");
      if (sizeOpt) {
        for (const v of sizeOpt.values) sizeSet.add(v);
      }
    }
    return [...sizeSet];
  });

  const activeFilterCount = useComputed$(() => {
    let count = 0;
    if (selectedBrands.value.length > 0) count++;
    if (selectedTypes.value.length > 0) count++;
    if (selectedSizes.value.length > 0) count++;
    if (inStockOnly.value) count++;
    return count;
  });

  const clearAllFilters = $(() => {
    selectedBrands.value = [];
    selectedTypes.value = [];
    selectedSizes.value = [];
    inStockOnly.value = false;
  });

  const filteredProducts = useComputed$(() => {
    const sorted = sortProducts(loadedProducts.value, currentSort.value);
    let result = sorted;

    if (selectedBrands.value.length > 0) {
      result = result.filter((p: ShopifyProduct) => selectedBrands.value.includes(p.vendor));
    }
    if (selectedTypes.value.length > 0) {
      result = result.filter((p: ShopifyProduct) => selectedTypes.value.includes(p.productType));
    }
    if (selectedSizes.value.length > 0) {
      result = result.filter((p: ShopifyProduct) => {
        if (!p.options) return false;
        const sizeOpt = p.options.find((o) => o.name.toLowerCase() === "size");
        if (!sizeOpt) return false;
        return sizeOpt.values.some((v) => selectedSizes.value.includes(v));
      });
    }
    if (inStockOnly.value) {
      result = result.filter((p: ShopifyProduct) => p.availableForSale);
    }
    return result;
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
      <div class="relative text-white aspect-video md:aspect-auto md:h-[40vh] md:max-h-[400px] px-8 text-center overflow-hidden flex flex-col items-center justify-center">
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

      <div class="bg-white dark:bg-[#1a1a1a] border-y border-gray-200/60 dark:border-gray-700/40 px-2.5 md:px-8 py-2.5 md:py-4">
        {/* Breadcrumbs + mobile count */}
        <div class="flex items-center justify-between mb-3">
          <nav class="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <Link href="/#products" class="hover:text-dark dark:hover:text-white transition-colors">Collections</Link>
            <svg class="w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="font-medium text-gray-900 dark:text-white">{c.title}</span>
          </nav>
          <div class="md:hidden flex items-center gap-2">
            <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <button
                type="button"
                aria-label="2 column grid"
                class={`p-1.5 transition-colors ${gridCols.value === 2 ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
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
                class={`p-1.5 transition-colors ${gridCols.value === 1 ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-[#1e1e1e] hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                onClick$={() => { gridCols.value = 1; }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="1" y="1" width="14" height="6" rx="1" />
                  <rect x="1" y="9" width="14" height="6" rx="1" />
                </svg>
              </button>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500">
              {activeFilterCount.value > 0
                ? `${filteredProducts.value.length} of ${loadedProducts.value.length}`
                : `${loadedProducts.value.length}`} products
            </span>
          </div>
        </div>

        {/* Toolbar: filters left, count + sort right */}
        <div class="flex flex-wrap items-center gap-1.5 md:gap-2.5">
          {/* Product type filter */}
          {(
            <div class="relative" data-type-filter>
              <button
                type="button"
                class={`text-[12px] md:text-[13px] border rounded-md px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-1.5 transition-colors ${selectedTypes.value.length > 0 ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}`}
                onClick$={() => {
                  const opening = !typeFilterOpen.value;
                  closeAllDropdowns();
                  typeFilterOpen.value = opening;
                }}
              >
                Type
                {selectedTypes.value.length > 0 && (
                  <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                    {selectedTypes.value.length}
                  </span>
                )}
                <svg class={`w-3.5 h-3.5 transition-transform ${typeFilterOpen.value ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {typeFilterOpen.value && (
                <div class="absolute top-full right-0 md:left-0 md:right-auto mt-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[200px] py-1.5 max-h-[280px] overflow-y-auto">
                  {selectedTypes.value.length > 0 && (
                    <button
                      type="button"
                      class="w-full text-left px-4 py-1.5 text-xs text-primary hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                      onClick$={() => { selectedTypes.value = []; }}
                    >
                      Clear
                    </button>
                  )}
                  {productTypes.value.map((type) => (
                    <label
                      key={type}
                      class="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50"
                        checked={selectedTypes.value.includes(type)}
                        onChange$={() => {
                          const current = [...selectedTypes.value];
                          const idx = current.indexOf(type);
                          if (idx >= 0) current.splice(idx, 1);
                          else current.push(type);
                          selectedTypes.value = current;
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brand filter */}
          {(
            <div class="relative" data-brand-filter>
              <button
                type="button"
                class={`text-[12px] md:text-[13px] border rounded-md px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-1.5 transition-colors ${selectedBrands.value.length > 0 ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}`}
                onClick$={() => {
                  const opening = !brandFilterOpen.value;
                  closeAllDropdowns();
                  brandFilterOpen.value = opening;
                }}
              >
                Brand
                {selectedBrands.value.length > 0 && (
                  <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                    {selectedBrands.value.length}
                  </span>
                )}
                <svg class={`w-3.5 h-3.5 transition-transform ${brandFilterOpen.value ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {brandFilterOpen.value && (
                <div class="absolute top-full right-0 md:left-0 md:right-auto mt-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[200px] py-1.5 max-h-[280px] overflow-y-auto">
                  {selectedBrands.value.length > 0 && (
                    <button
                      type="button"
                      class="w-full text-left px-4 py-1.5 text-xs text-primary hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                      onClick$={() => { selectedBrands.value = []; }}
                    >
                      Clear
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
                          if (idx >= 0) current.splice(idx, 1);
                          else current.push(brand);
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

          {/* Size filter */}
          {(
            <div class="relative" data-size-filter>
              <button
                type="button"
                class={`text-[12px] md:text-[13px] border rounded-md px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-1.5 transition-colors ${selectedSizes.value.length > 0 ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}`}
                onClick$={() => {
                  const opening = !sizeFilterOpen.value;
                  closeAllDropdowns();
                  sizeFilterOpen.value = opening;
                }}
              >
                Size
                {selectedSizes.value.length > 0 && (
                  <span class="bg-primary text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                    {selectedSizes.value.length}
                  </span>
                )}
                <svg class={`w-3.5 h-3.5 transition-transform ${sizeFilterOpen.value ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sizeFilterOpen.value && (
                <div class="absolute top-full right-0 md:left-0 md:right-auto mt-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[180px] py-1.5 max-h-[280px] overflow-y-auto">
                  {selectedSizes.value.length > 0 && (
                    <button
                      type="button"
                      class="w-full text-left px-4 py-1.5 text-xs text-primary hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                      onClick$={() => { selectedSizes.value = []; }}
                    >
                      Clear
                    </button>
                  )}
                  {sizes.value.map((size) => (
                    <label
                      key={size}
                      class="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50"
                        checked={selectedSizes.value.includes(size)}
                        onChange$={() => {
                          const current = [...selectedSizes.value];
                          const idx = current.indexOf(size);
                          if (idx >= 0) current.splice(idx, 1);
                          else current.push(size);
                          selectedSizes.value = current;
                        }}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Availability toggle */}
          <button
            type="button"
            class={`text-[12px] md:text-[13px] border rounded-md px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-1.5 transition-colors ${inStockOnly.value ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}`}
            onClick$={() => { inStockOnly.value = !inStockOnly.value; }}
          >
            In Stock
          </button>

          {/* Clear all */}
          {activeFilterCount.value > 0 && (
            <button
              type="button"
              class="text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors underline underline-offset-2"
              onClick$={clearAllFilters}
            >
              Clear all
            </button>
          )}

          {/* Right side: count + sort */}
          <div class="flex items-center gap-1.5 md:gap-3 md:ml-auto">
            <span class="hidden md:block text-xs text-gray-400 dark:text-gray-500">
              {activeFilterCount.value > 0
                ? `${filteredProducts.value.length} of ${loadedProducts.value.length}`
                : `${loadedProducts.value.length}`} products
            </span>
            <div class="flex items-center gap-1.5">
              <label for="sort-select" class="hidden md:block text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                Sort by
              </label>
              <select
                id="sort-select"
                aria-label="Sort by"
                class="text-[12px] md:text-[13px] border border-gray-200 dark:border-gray-700 rounded-md px-2 md:px-3 bg-white dark:bg-[#1e1e1e] text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 !py-1 md:!py-1.5"
                value={currentSort.value}
                onChange$={(_, el) => {
                  currentSort.value = el.value;
                  const url = new URL(window.location.href);
                  if (el.value) url.searchParams.set("sort", el.value);
                  else url.searchParams.delete("sort");
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
          </div>
        </div>

        {/* Active filter tags */}
        {activeFilterCount.value > 0 && (
          <div class="flex flex-wrap gap-1.5 mt-2.5">
            {selectedBrands.value.map((brand) => (
              <span key={`brand-${brand}`} class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                {brand}
                <button type="button" class="hover:text-red-500 transition-colors bg-transparent border-none p-0 text-gray-400 hover:text-red-500" onClick$={() => { selectedBrands.value = selectedBrands.value.filter((b) => b !== brand); }}>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            {selectedSizes.value.map((size) => (
              <span key={`size-${size}`} class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                Size: {size}
                <button type="button" class="bg-transparent border-none p-0 text-gray-400 hover:text-red-500 transition-colors" onClick$={() => { selectedSizes.value = selectedSizes.value.filter((s) => s !== size); }}>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            {selectedTypes.value.map((type) => (
              <span key={`type-${type}`} class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                {type}
                <button type="button" class="bg-transparent border-none p-0 text-gray-400 hover:text-red-500 transition-colors" onClick$={() => { selectedTypes.value = selectedTypes.value.filter((t) => t !== type); }}>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            {inStockOnly.value && (
              <span class="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full pl-2.5 pr-1.5 py-0.5">
                In Stock
                <button type="button" class="bg-transparent border-none p-0 text-gray-400 hover:text-red-500 transition-colors" onClick$={() => { inStockOnly.value = false; }}>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <section class="px-4 md:px-8 py-5 md:py-6">
        {filteredProducts.value.length === 0 ? (
          <p class="text-center text-gray-500 dark:text-gray-400 py-12">
            {loadedProducts.value.length === 0
              ? "No products in this collection yet."
              : "No products match the selected filters."}
          </p>
        ) : (
          <div class={`grid gap-1 md:gap-1.5 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] ${gridCols.value === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
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

        {/* Load More button */}
        {hasNextPage.value && (
          <div class="text-center mt-8">
            <button
              type="button"
              class="inline-flex items-center gap-2 py-3 px-8 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              disabled={loadingMore.value}
              onClick$={loadMore}
            >
              {loadingMore.value ? (
                <>
                  <div class="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Products"
              )}
            </button>
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
