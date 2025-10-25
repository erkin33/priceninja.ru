"use client";
import { useState } from "react";

export default function TgForm({ endpoint = "/api/send-to-telegram", onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  function onPhoneChange(e) {
    const raw = e.target.value || "";
    const digits = raw.replace(/\D/g, "");
    update("phone", digits.slice(0, 15));
  }

  function validate() {
    if (!form.name.trim()) return "Введите имя";
    if (!form.message.trim()) return "Введите сообщение";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Неверный email";
    if (form.phone && !/^\d{6,15}$/.test(form.phone)) return "Телефон должен содержать только цифры";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setNotice(null);
    const err = validate();
    if (err) {
      setNotice({ type: "error", text: err });
      return;
    }

    setSending(true);
    try {
      const payload = {
        form: "Форма с сайта",
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        page: window.location.href,
        ua: navigator.userAgent,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const data = JSON.parse(text || "{}");

      if (res.ok && data.ok !== false) {
        setNotice({ type: "success", text: "✅ Сообщение отправлено!" });
        setForm({ name: "", email: "", phone: "", message: "" });
        onSuccess?.();
      } else {
        setNotice({
          type: "error",
          text: data.error || "Ошибка при отправке. Попробуйте позже.",
        });
      }
    } catch (err) {
      setNotice({ type: "error", text: err.message || "Ошибка сети" });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Ваше имя"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="email@domain.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
          <input
            value={form.phone}
            onChange={onPhoneChange}
            placeholder="Номер телефона"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Сообщение *</label>
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows="4"
          placeholder="Ваше сообщение..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="bg-[#0A25FF] text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-blue-700 disabled:opacity-60 transition-all"
      >
        {sending ? "Отправка..." : "Отправить заявку"}
      </button>

      {notice && (
        <div
          className={`text-sm mt-2 p-3 rounded-md ${
            notice.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {notice.text}
        </div>
      )}
    </form>
  );
}
