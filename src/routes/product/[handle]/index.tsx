import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  getProductByHandle,
  getCollectionByHandle,
  getProductRecommendations,
  formatPrice,
  createCart,
  addToCart,
} from "~/lib/medusa";
import type { ShopifyVariant } from "~/lib/medusa";
import { Carousel } from "@qwik-ui/headless";

export const useProduct = routeLoader$(async (requestEvent) => {
  const handle = requestEvent.params.handle;
  const collectionHandle = requestEvent.url.searchParams.get("collection");

  const [product, collection] = await Promise.all([
    getProductByHandle(handle),
    collectionHandle
      ? getCollectionByHandle(collectionHandle, 1)
      : Promise.resolve(null),
  ]);

  if (!product) {
    requestEvent.status(404);
    return null;
  }

  let related = await getProductRecommendations(product.id);

  // Fallback: if no recommendations, use products from same collection
  if (related.length === 0 && collectionHandle) {
    const col = await getCollectionByHandle(collectionHandle, 12);
    if (col) {
      related = col.products.edges
        .map((e) => e.node)
        .filter((p) => p.handle !== handle);
    }
  }

  return {
    ...product,
    _collection: collection
      ? { handle: collection.handle, title: collection.title }
      : null,
    _related: related.slice(0, 10),
  };
});

export default component$(() => {
  const product = useProduct();
  const selectedImage = useSignal(0);
  const selectedVariantId = useSignal("");
  const adding = useSignal(false);
  const added = useSignal(false);
  const cartCount = useSignal(0);

  // Load cart count from localStorage on mount
  useVisibleTask$(() => {
    const count = localStorage.getItem("cart_count");
    if (count) cartCount.value = parseInt(count, 10);
  });

  // Set default selected variant
  useVisibleTask$(({ track }) => {
    track(() => product.value);
    if (product.value) {
      const variants = product.value.variants.edges.map((e) => e.node);
      const available = variants.find((v) => v.availableForSale);
      if (available) {
        selectedVariantId.value = available.id;
      }
    }
  });

  const handleAddToCart = $(async () => {
    if (!selectedVariantId.value || adding.value) return;

    adding.value = true;
    added.value = false;

    try {
      const cartId = localStorage.getItem("cart_id");

      let cart;
      if (cartId) {
        cart = await addToCart(cartId, selectedVariantId.value, 1);
      } else {
        cart = await createCart(selectedVariantId.value, 1);
      }

      localStorage.setItem("cart_id", cart.id);
      localStorage.setItem("cart_checkout_url", cart.checkoutUrl);
      localStorage.setItem("cart_count", String(cart.totalQuantity));
      cartCount.value = cart.totalQuantity;
      added.value = true;

      setTimeout(() => (added.value = false), 2500);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      adding.value = false;
    }
  });

  if (!product.value) {
    return (
      <div class="text-center py-24 px-8">
        <h1 class="text-2xl font-bold mb-4">Product not found</h1>
        <Link
          href="/"
          class="inline-flex items-center justify-center py-3 px-7 text-[0.9rem] font-semibold rounded-lg border-none transition-all duration-200 bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const p = product.value;
  const images = p.images.edges.map((e) => e.node);
  const variants = p.variants.edges.map((e) => e.node);
  const anyAvailable = variants.some((v) => v.availableForSale);

  const getStockLabel = (variant: ShopifyVariant) => {
    return variant.availableForSale ? "In stock" : "Out of stock";
  };

  // Find the currently selected variant for stock display
  const activeVariant = variants.find((v) => v.id === selectedVariantId.value);

  const col = p._collection;

  return (
    <div class="px-5 md:px-8 py-6 md:py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <>
              <img
                src={images[selectedImage.value]?.url}
                alt={images[selectedImage.value]?.altText || p.title}
                class="w-full rounded-xl aspect-square object-cover border border-gray-200 dark:border-gray-700"
              />
              {images.length > 1 && (
                <div class="flex gap-2 mt-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={img.url}
                      onClick$={() => (selectedImage.value = i)}
                      class={`w-16 h-16 rounded-lg overflow-hidden border-2 p-0 bg-transparent flex-shrink-0 transition-colors ${
                        i === selectedImage.value
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.altText || `${p.title} ${i + 1}`}
                        class="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div class="w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm aspect-square rounded-xl">
              No image
            </div>
          )}
          <nav class="flex items-center gap-1.5 text-sm mt-4" aria-label="Breadcrumb">
            <Link href="/" class="text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
              Home
            </Link>
            {col && (
              <>
                <span class="text-gray-400 dark:text-gray-500">/</span>
                <Link href={`/collections/${col.handle}/`} class="text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
                  {col.title}
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Product Info */}
        <div>
          <h1 class="text-[1.75rem] font-extrabold tracking-tight mb-3">
            {p.title}
          </h1>

          <p class="text-2xl font-bold text-primary mb-6">
            {formatPrice(p.priceRange.minVariantPrice)}
            {p.priceRange.minVariantPrice.amount !==
              p.priceRange.maxVariantPrice.amount && (
              <span class="text-gray-500 dark:text-gray-400 font-normal text-lg">
                {" "}
                &ndash; {formatPrice(p.priceRange.maxVariantPrice)}
              </span>
            )}
          </p>

          {/* Availability Indicator */}
          {activeVariant && (
            <div class="flex items-center gap-2 mb-6">
              <span
                class={`w-2 h-2 rounded-full inline-block ${
                  activeVariant.availableForSale
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              />
              <span
                class={`text-sm font-semibold ${
                  activeVariant.availableForSale
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {getStockLabel(activeVariant)}
              </span>
            </div>
          )}

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div class="mb-6">
              <p class="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold mb-2">
                Select Option
              </p>
              <div class="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick$={() => {
                      if (v.availableForSale) selectedVariantId.value = v.id;
                    }}
                    class={`py-1.5 px-3.5 rounded-full border text-xs font-medium transition-all duration-200 ${
                      !v.availableForSale
                        ? "opacity-40 cursor-not-allowed line-through border-gray-200 dark:border-gray-700"
                        : v.id === selectedVariantId.value
                          ? "border-primary bg-primary/[0.08] text-primary font-semibold"
                          : "border-gray-200 dark:border-gray-700"
                    }`}
                    disabled={!v.availableForSale}
                  >
                    {v.title} &middot; {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div class="flex gap-3 items-center mb-6">
            <button
              class={`inline-flex items-center justify-center py-3.5 px-8 text-base font-semibold rounded-lg border-none transition-all duration-200 min-w-[180px] ${
                anyAvailable
                  ? "bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick$={handleAddToCart}
              disabled={!anyAvailable || adding.value}
            >
              {adding.value
                ? "Adding..."
                : added.value
                  ? "Added to Cart!"
                  : anyAvailable
                    ? "Add to Cart"
                    : "Sold Out"}
            </button>

            {cartCount.value > 0 && (
              <a
                href={
                  typeof window !== "undefined"
                    ? localStorage.getItem("cart_checkout_url") || "#"
                    : "#"
                }
                class="inline-flex items-center justify-center py-3 px-7 text-[0.9rem] font-semibold rounded-lg border-none transition-all duration-200 bg-dark text-white hover:bg-dark-soft hover:-translate-y-0.5"
                target="_blank"
                rel="noopener noreferrer"
              >
                Checkout ({cartCount.value})
              </a>
            )}
          </div>

          {/* Description */}
          {p.descriptionHtml && (
            <div
              class="border-t border-gray-200 dark:border-gray-700 pt-8 mt-2 text-[#444] dark:text-gray-300 leading-loose text-[0.925rem]"
              dangerouslySetInnerHTML={p.descriptionHtml}
            />
          )}
        </div>
      </div>

      {/* Related Products */}
      {p._related && p._related.length > 0 && (
        <div class="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 class="text-xl font-bold mb-5">You May Also Like</h2>
          <Carousel.Root class="relative related-carousel" slidesPerView={2} gap={12} draggable>
            <Carousel.Scroller class="flex">
              {p._related.map((item) => (
                <Carousel.Slide key={item.id} class="min-w-0">
                  <Link
                    href={`/product/${item.handle}/${col ? `?collection=${col.handle}` : ""}`}
                    class="group block bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {item.featuredImage ? (
                      <img
                        src={item.featuredImage.url}
                        alt={item.featuredImage.altText || item.title}
                        width={300}
                        height={300}
                        class="w-full aspect-square object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div class="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                    <div class="p-3">
                      {item.vendor && (
                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 block">
                          {item.vendor}
                        </span>
                      )}
                      <h3 class="text-sm font-semibold leading-snug line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      <span class="text-sm font-bold text-primary">
                        {formatPrice(item.priceRange.minVariantPrice)}
                      </span>
                    </div>
                  </Link>
                </Carousel.Slide>
              ))}
            </Carousel.Scroller>
            <Carousel.Previous class="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors z-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </Carousel.Previous>
            <Carousel.Next class="absolute right-0 top-1/3 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 shadow flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors z-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </Carousel.Next>
          </Carousel.Root>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const product = resolveValue(useProduct);
  return {
    title: product
      ? `${product.title} | The Safety House`
      : "Product Not Found | The Safety House",
    meta: [
      {
        name: "description",
        content: product?.description || "Product page",
      },
    ],
  };
};
