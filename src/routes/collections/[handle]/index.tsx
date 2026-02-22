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
      <div
        class="section"
        style={{ textAlign: "center", padding: "6rem 2rem" }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            marginBottom: "1rem",
          }}
        >
          Collection not found
        </h1>
        <Link href="/" class="btn btn-primary">
          Back to shop
        </Link>
      </div>
    );
  }

  const c = collection.value;
  const products = c.products.edges.map((e) => e.node);

  return (
    <>
      <div class="page-header">
        <h1>{c.title}</h1>
        {c.description && <p>{c.description}</p>}
      </div>

      <section class="section">
        <Link href="/" class="back-link">
          &larr; Back to shop
        </Link>

        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "3rem 0" }}>
            No products in this collection yet.
          </p>
        ) : (
          <div class="product-grid">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.handle}/`}
                class="product-card"
              >
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    width={400}
                    height={400}
                    class="product-card-img"
                  />
                ) : (
                  <div class="no-image">No image</div>
                )}
                <div class="product-card-body">
                  <h3>{product.title}</h3>
                  <span class="price">
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
