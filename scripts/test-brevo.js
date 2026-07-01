const payload = {
  sender: { name: "Test", email: "test@test.com" },
  to: [{ email: "test2@test.com" }],
  subject: "Test",
  htmlContent: "<html><body>Test</body></html>"
};

fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: {
    "api-key": "fake-key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
}).then(async (res) => {
  console.log(res.status);
  console.log(await res.text());
});
