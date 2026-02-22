import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <div class="bg-gradient-to-br from-dark to-[#2d2d2d] text-white py-14 px-8 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight mb-2">Contact Us</h1>
        <p class="text-white/60 text-base">
          We'd love to hear from you. Reach out any time.
        </p>
      </div>

      <div class="max-w-[900px] mx-auto py-12 px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 class="text-base font-bold mb-4 text-dark dark:text-white">Get in Touch</h3>
            <p class="text-gray-500 dark:text-gray-400 text-[0.9rem] leading-loose">
              <strong>Phone &amp; Fax</strong>
              <br />
              <a
                href="tel:613-224-6804"
                class="text-primary font-semibold transition-colors hover:text-primary-dark"
              >
                613-224-6804
              </a>
            </p>
            <p class="text-gray-500 text-[0.9rem] leading-loose mt-4">
              <strong>Email</strong>
              <br />
              <a
                href="mailto:info@safetyhouse.ca"
                class="text-primary font-semibold transition-colors hover:text-primary-dark"
              >
                info@safetyhouse.ca
              </a>
            </p>
            <p class="text-gray-500 text-[0.9rem] leading-loose mt-4">
              <strong>Address</strong>
              <br />
              595 West Hunt Club Road
              <br />
              Nepean, ON K2G 5X6
            </p>
          </div>

          <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <h3 class="text-base font-bold mb-4 text-dark dark:text-white">Store Hours</h3>
            <table class="w-full border-collapse">
              <tbody>
                {[
                  ["Monday", "8:30 AM - 6:00 PM"],
                  ["Tuesday", "8:30 AM - 6:00 PM"],
                  ["Wednesday", "8:30 AM - 6:00 PM"],
                  ["Thursday", "8:30 AM - 7:00 PM"],
                  ["Friday", "8:30 AM - 6:00 PM"],
                  ["Saturday", "9:00 AM - 4:00 PM"],
                  ["Sunday", "Closed"],
                ].map(([day, hours]) => (
                  <tr key={day}>
                    <td class="py-1.5 text-sm border-b border-gray-200 dark:border-gray-700 font-semibold text-[#1a1a1a] dark:text-white">
                      {day}
                    </td>
                    <td class="py-1.5 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p class="mt-4 text-[0.8rem] text-gray-500 dark:text-gray-400">
              Closed on long weekends.
              <br />
              December Sundays: 10:00 AM - 4:00 PM
            </p>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Contact | The Safety House",
  meta: [
    {
      name: "description",
      content:
        "Contact The Safety House at 595 West Hunt Club Road, Nepean, ON. Phone: 613-224-6804. Email: info@safetyhouse.ca.",
    },
  ],
};
