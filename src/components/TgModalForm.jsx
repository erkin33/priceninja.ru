"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import TgForm from "./TgForm";

export default function TgModalForm({ variant = "primary" }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const variants = {
    primary: "bg-[#0A25FF] text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all",
    light: "bg-white text-black px-8 py-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-all",
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Оставить заявку</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>
        <TgForm onSuccess={() => setOpen(false)} />
        <div className="text-right mt-3">
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={variants[variant]}
      >
        Оставить заявку
      </button>
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}
