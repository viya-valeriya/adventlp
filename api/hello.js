// api/hello.js
// Простейший тестовый endpoint для проверки API.

export default function handler(req, res) {
  res.status(200).json({ ok: true, msg: "API is alive" });
}
