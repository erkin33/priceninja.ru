'use client';
import { useEffect, useState } from 'react';

export default function Pers() {
  const [headerH, setHeaderH] = useState(0);

  useEffect(() => {
    const el = document.getElementById('siteHeader');
    const measure = () => setHeaderH(el?.getBoundingClientRect().height ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div className="!bg-black relative overflow-x-hidden w-full h-full">
      <div className="bg-black relative overflow-hidden">
        {/* === Шапка (как у тебя), просто дал id для измерения === */}
        <header id="siteHeader" className="flex justify-between pt-5 mx-5 lg:mx-10 lg:pt-10 items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer">
                <div className="text-white block">
                  {/* логотип */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24.3775 0V20.1479L32.3214 24.0551V6.68447C32.3214 2.99274 29.3287 0 25.6369 0H24.3775ZM20.4688 7.94433L0.320856 7.94434L0.320855 6.68491C0.320855 2.99318 3.3136 0.000435698 7.00533 0.000435537L24.376 0.000434778L20.4688 7.94433ZM8.26421 32L8.26422 11.8521L0.320314 7.94487L0.320313 25.3155C0.320312 29.0073 3.31305 32 7.00478 32H8.26421ZM32.3209 24.0557H12.1729L8.26571 31.9996H25.6364C29.3281 31.9996 32.3209 29.0068 32.3209 25.3151V24.0557Z" fill="url(#paint0_linear_1012_6407)"></path>
                    <defs><linearGradient id="paint0_linear_1012_6407" x1="0.320312" y1="0" x2="36.7486" y2="38.1989" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"></stop><stop offset="1" stopColor="#0145FF"></stop></linearGradient></defs>
                  </svg>
                </div>
                <span className="hidden lg:block ml-3 text-white text-[26px] font-semibold leading-[35px]">ПРАЙС НИНДЗЯ</span>
              </div>
              <div className="lg:hidden ml-2 flex items-center">
                <span className="block text-white text-[14px] font-semibold leading-[17px]">ПРАЙС НИНДЗЯ</span>
              </div>
            </div>
            <div className="hidden lg:flex ml-[38px] h-[45px] border-l border-[rgb(62,67,73,0.40)] pl-[38px] items-center space-x-6">
              <div className="h-[45px] flex relative items-center">
                <button className="block text-[#454A50] text-lg leading-[22px] font-semibold cursor-pointer">
                  <a href="/">Управление ценами</a>
                </button>
              </div>
              <div className="h-[45px] flex relative items-center">
                <button className="block text-[#454A50] text-lg leading-[22px] font-semibold cursor-pointer !text-white after:content-[''] after:bg-white after:h-0.5 after:w-[51px] after:absolute after:bottom-0 after:left-[18px]">
                   <a href="/parsing">Парсинг</a>
                </button>
              </div>
            </div>
          </div>

          <div>
            <button className="hover:duration-500 rounded-[100px] px-5 py-2.5 lg:px-8 lg:py-4 hidden lg:flex items-center justify-center lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]">
              <span className="block text-white font-semibold text-xs leading-[14px] lg:text-xl lg:leading-6">
                <a href="#contactUs">Связаться</a>
              </span>
            </button>
            <div className="flex lg:hidden items-center">
              <span className="block text-white text-[14px] leading-[17px] mr-1 font-semibold">Мониторинг</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.4" d="M5.5027 4.27368H11.8008M11.8008 4.27368V10.5718M11.8008 4.27368L4.30078 11.7737" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </div>
          </div>
        </header>

        {/* Контент: PDF на всю доступную высоту экрана минус шапка */}
        <main className="container py-4 lg:py-6">
          <div className="rounded-xl overflow-hidden">
            <iframe
              // масштаб сразу «по ширине страницы»
              src="/docs/pers.pdf#page=1&zoom=page-width"
              title="Политика обработки персональных данных (PDF)"
              className="w-full"
              style={{ height: `calc(100svh - ${headerH + 32}px)` }} // 32px ≈ вертикальные паддинги main на мобе; подгони при желании
              loading="lazy"
            />
          </div>

          {/* Фолбэк на случай, если PDF не отображается */}
          <div className="mt-3">
            <a className="underline text-white/80" href="/docs/pers.pdf" download>
              Скачать PDF
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
