import { component$ } from "@builder.io/qwik";
import { routeLoader$, Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { getCollectionByHandle, formatPrice } from "~/lib/shopify";

export const useCollection = routeLoader$(async (requestEvent) => {
  const handle = requestEvent.params.handle;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    requestEvent.status(404);
    return null;
  }

  return collection;
});

export default component$(() => {
  const collection = useCollection();

  if (!collection.value) {
    return (
      <div class="max-w-site mx-auto text-center py-24 px-8">
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
  const products = c.products.edges.map((e) => e.node);

  return (
    <>
      <div class="bg-gradient-to-br from-dark to-[#2d2d2d] text-white py-14 px-8 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight mb-2">{c.title}</h1>
        {c.description && <p class="text-white/60 text-base">{c.description}</p>}
      </div>

      <section class="max-w-site mx-auto px-4 md:px-8 py-10 md:py-16">
        <Link
          href="/"
          class="inline-flex items-center gap-2 text-gray-500 text-sm font-medium mb-6 transition-colors hover:text-dark"
        >
          &larr; Back to shop
        </Link>

        {products.length === 0 ? (
          <p class="text-center text-gray-500 py-12">
            No products in this collection yet.
          </p>
        ) : (
          <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}/`}
                class="bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
              >
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    width={400}
                    height={400}
                    class="w-full h-[280px] object-cover bg-gray-100"
                  />
                ) : (
                  <div class="w-full h-[280px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                )}
                <div class="p-4 px-5 flex-1 flex flex-col">
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
  };
};
