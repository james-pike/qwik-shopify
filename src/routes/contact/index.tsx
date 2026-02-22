import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <div class="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out any time.</p>
      </div>

      <div class="page-content" style={{ maxWidth: "900px" }}>
        <div class="contact-grid">
          <div class="contact-card">
            <h3>Get in Touch</h3>
            <p>
              <strong>Phone &amp; Fax</strong>
              <br />
              <a href="tel:613-224-6804">613-224-6804</a>
            </p>
            <p style={{ marginTop: "1rem" }}>
              <strong>Email</strong>
              <br />
              <a href="mailto:info@safetyhouse.ca">info@safetyhouse.ca</a>
            </p>
            <p style={{ marginTop: "1rem" }}>
              <strong>Address</strong>
              <br />
              595 West Hunt Club Road
              <br />
              Nepean, ON K2G 5X6
            </p>
          </div>

          <div class="contact-card">
            <h3>Store Hours</h3>
            <table class="hours-table">
              <tbody>
                <tr>
                  <td>Monday</td>
                  <td>8:30 AM - 6:00 PM</td>
                </tr>
                <tr>
                  <td>Tuesday</td>
                  <td>8:30 AM - 6:00 PM</td>
                </tr>
                <tr>
                  <td>Wednesday</td>
                  <td>8:30 AM - 6:00 PM</td>
                </tr>
                <tr>
                  <td>Thursday</td>
                  <td>8:30 AM - 7:00 PM</td>
                </tr>
                <tr>
                  <td>Friday</td>
                  <td>8:30 AM - 6:00 PM</td>
                </tr>
                <tr>
                  <td>Saturday</td>
                  <td>9:00 AM - 4:00 PM</td>
                </tr>
                <tr>
                  <td>Sunday</td>
                  <td>Closed</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
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
