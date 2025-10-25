"use client"
import Image from "next/image";
import React, { useMemo, useState, useCallback, useRef, } from "react";
import TgModalForm from '../components/TgModalForm';
export default function Home() {

type Props = {
  className?: string;
  onRawChange?: (digits10: string) => void; // отдаём 10 цифр без пробелов
  useOverlayPrefix?: boolean;               // если true — рисуешь "+7" отдельным <span>, а инпут показывает только "000 000 00 00"
};

const PREFIX = '+7 ';
const GROUPS = [3, 3, 2, 2];
const MAX_DIGITS = 10;

const onlyDigits = (s: string) => (s.match(/\d/g) || []).join('');
const formatGroups = (digits: string) => {
  let i = 0; const parts: string[] = [];
  for (const g of GROUPS) { parts.push(digits.slice(i, i + g)); i += g; }
  return parts.join(' ').trimEnd();
};

function MaskedPhoneRU({
  className = '',
  onRawChange,
  useOverlayPrefix = false,
}: Props) {
  const [digits, setDigits] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const minCaret = useOverlayPrefix ? 0 : PREFIX.length;

  const setCaretSafe = (pos?: number) => {
    const el = inputRef.current; if (!el) return;
    const end = el.value.length;
    const safe = Math.max(minCaret, Math.min(end, pos ?? end));
    requestAnimationFrame(() => el.setSelectionRange(safe, safe));
  };

  // Блокируем нецифры ещё до изменения value (важно для мобилок)
  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const ev = e as unknown as InputEvent;
    // Разрешаем удаления/навиг. действия
    if (!ev.data) return;
    if (!/^\d$/.test(ev.data)) {
      ev.preventDefault?.();
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let d = onlyDigits(e.target.value);

    // Берём ПОСЛЕДНИЕ 10 цифр, чтобы любые автоподстановки/вставки
    // не «раздували» значение и не добавляли лишних семёрок
    if (d.length > MAX_DIGITS) d = d.slice(-MAX_DIGITS);

    setDigits(d);
    onRawChange?.(d);
  }, [onRawChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const caret = e.currentTarget.selectionStart ?? 0;

    // Защита префикса (если он рисуется внутри value)
    if (!useOverlayPrefix) {
      if ((e.key === 'Backspace' && caret <= minCaret) ||
          (e.key === 'Delete' && caret <  minCaret)) {
        e.preventDefault();
        return;
      }
    }

    const nav = ['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','Home','End'];
    if (nav.includes(e.key) || (e.ctrlKey || e.metaKey)) return;

    if (!/^\d$/.test(e.key) || digits.length >= MAX_DIGITS) e.preventDefault();
  }, [digits.length, minCaret, useOverlayPrefix]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    let d = onlyDigits(e.clipboardData.getData('text') || '');
    if (d.length > MAX_DIGITS) d = d.slice(-MAX_DIGITS);
    setDigits(d);
    onRawChange?.(d);
    setCaretSafe();
  }, [onRawChange]);

  const handleFocus = () => setCaretSafe();
  const handleClick = () => setCaretSafe();

  const value = (useOverlayPrefix ? '' : PREFIX) + formatGroups(digits);
  const placeholder = (useOverlayPrefix ? '' : PREFIX) + '000 000 00 00';

  return (
    <input
      ref={inputRef}
      inputMode="numeric"
      autoComplete="off"         // избегаем автоподстановок с «7…»
      pattern="[0-9]*"
      placeholder={placeholder}
      value={value}
      onBeforeInput={handleBeforeInput}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      onClick={handleClick}
      className={className}
      aria-label="Номер телефона в формате +7 000 000 00 00"
    />
  );
}

     const [val, setVal] = useState("");
     const [value, setValue] = useState("tariff");

       // --- СТЕЙТЫ ВЫБОРА ---
  const [tier, setTier] = useState<"300" | "1000" | "3000" | "5000" | "5000+">("300");
  const [marketplaces, setMarketplaces] = useState<"1" | "2">("1");
  const [period, setPeriod] = useState<1 | 3 | 6 | 12>(12);
  const [premium, setPremium] = useState(false);
  const [training, setTraining] = useState(false);

  // --- ПРАЙСЫ (руб/мес до скидок) ---
  const base300 = 13700;       // до 300 товаров
  const inc1000 = 10000;
  const inc3000 = 20000;
  const inc5000 = 34000;
  const inc5000p = 44000;

  const mp2 = 5700;            // второй маркетплейс +5 700
  const prem = 8700;           // премиум поддержка
  const train = 15700;         // обучение

  // --- ФУНКЦИИ СЧЁТА ---
  const monthlyBeforeDiscount = useMemo(() => {
    let subtotal = base300;

    // товары
    if (tier === "1000") subtotal += inc1000;
    if (tier === "3000") subtotal += inc3000;
    if (tier === "5000") subtotal += inc5000;
    if (tier === "5000+") subtotal += inc5000p;

    // маркетплейсы
    if (marketplaces === "2") subtotal += mp2;

    // доп. опции
    if (premium) subtotal += prem;
    if (training) subtotal += train;

    return subtotal;
  }, [tier, marketplaces, premium, training]);

  const discount = useMemo(() => {
    if (period === 12) return 0.2;
    if (period === 6) return 0.15;
    if (period === 3) return 0.1;
    return 0;
  }, [period]);

  const monthly = Math.round(monthlyBeforeDiscount * (1 - discount));
  const total = monthly * period;

  const format = (n: number) =>
    new Intl.NumberFormat("ru-RU").format(n) + " ₽";
  return (
     <div className="!bg-black relative overflow-x-hidden w-full h-full ">
          <div className="bg-black relative overflow-hidden">
               
               
               <div className="flex justify-between pt-5 mx-5 lg:mx-10 lg:pt-10 items-center">
                    <div className="flex items-center"> 
                         <div className="flex items-center">
                              <div className="flex items-center cursor-pointer">
                                   <div className="text-white block">

                                        <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M24.3775 0V20.1479L32.3214 24.0551V6.68447C32.3214 2.99274 29.3287 0 25.6369 0H24.3775ZM20.4688 7.94433L0.320856 7.94434L0.320855 6.68491C0.320855 2.99318 3.3136 0.000435698 7.00533 0.000435537L24.376 0.000434778L20.4688 7.94433ZM8.26421 32L8.26422 11.8521L0.320314 7.94487L0.320313 25.3155C0.320312 29.0073 3.31305 32 7.00478 32H8.26421ZM32.3209 24.0557H12.1729L8.26571 31.9996H25.6364C29.3281 31.9996 32.3209 29.0068 32.3209 25.3151V24.0557Z" fill="url(#paint0_linear_1012_6407)"></path><defs><linearGradient id="paint0_linear_1012_6407" x1="0.320312" y1="0" x2="36.7486" y2="38.1989" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"></stop><stop offset="1" stopColor="#0145FF"></stop></linearGradient></defs></svg>

                                   </div>
                                   <span className="hidden lg:block ml-3 text-white text-[26px] font-semibold leading-[35px]">ПРАЙС НИНДЗЯ</span>
                              </div>
                              <div className="lg:hidden ml-2 flex items-center"> 
                                   <span className="block text-white text-[14px] font-semibold leading-[17px]">ПРАЙС НИНДЗЯ</span>
                              </div>

                         </div>
                         <div className="hidden lg:flex ml-[38px] h-[45px] border-l border-[rgb(62,67,73,0.40)] pl-[38px] items-center space-x-6"><div className="h-[45px] flex relative items-center"><button className="block text-[#454A50] text-lg leading-[22px] font-semibold cursor-pointer !text-white after:content-[''] after:bg-white after:h-0.5 after:w-[51px] after:absolute after:bottom-0 after:left-[36px]">Управление ценами</button></div><div className="h-[45px] flex relative items-center"><button className="block text-[#454A50] text-lg leading-[22px] font-semibold cursor-pointer"><a href="/parsing">Парсинг</a></button></div></div>
                    </div>
                    <div className="flex space-x-2 lg:space-x-3">
                         <button className=" hover:duration-500 rounded-[100px] px-5 py-2.5 lg:px-8 lg:py-4 hidden lg:flex items-center justify-center bg-[rgb(26,41,55,0.65)] lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]" style={{backdropFilter:`blur(7.5px)`}}><span className="text-white font-semibold text-xs leading-[14px] lg:text-xl lg:leading-6"><a href="#tariffs">Тарифы</a> </span></button>
                         {/* <button className=" hover:duration-500 rounded-[100px] px-5 py-2.5 lg:px-8 lg:py-4 hidden lg:flex items-center justify-center lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]"><span className="hidden lg:block text-white font-semibold text-xs leading-[14px] lg:text-xl lg:leading-6">Войти</span><div className="lg:hidden"><svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.166 16.0371L14.666 16.0371C16.0467 16.0371 17.166 14.9178 17.166 13.5371L17.166 6.87044C17.166 5.48973 16.0467 4.37044 14.666 4.37044L12.166 4.37044M2.16602 10.2038L10.3327 10.2038M10.3327 10.2038L6.99935 13.5371M10.3327 10.2038L6.99935 6.87044" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></div></button><div className="flex lg:hidden items-center"><span className="block text-white text-[14px] leading-[17px] mr-1 font-semibold"><a href="/parsing">Парсинг</a></span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.4" d="M5.5027 4.27368H11.8008M11.8008 4.27368V10.5718M11.8008 4.27368L4.30078 11.7737" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path></svg></div> */}
                         </div>
               </div>







               <div className="mx-5 lg:mx-0 mt-10 lg:mt-[50px] flex flex-col lg:items-center z-20">
                    <span className="block text-[36px] leading-[40px] lg:text-[70px] lg:leading-[100px] text-[#52575D] font-medium -tracking-[2px] lg:-tracking-[3px]">Прайс Ниндзя</span><span className="block text-[36px] leading-[40px] lg:text-[70px] lg:leading-[70px] text-[#FBFBFC] font-medium -tracking-[2px] lg:-tracking-[3px]">Умное управление</span><span className="block text-[36px] leading-[40px] lg:text-[70px] lg:leading-[70px] text-[#FBFBFC] font-medium -tracking-[2px] lg:-tracking-[3px]">ценами</span><div className="mt-6 mb-10 lg:my-10 flex flex-col lg:items-center"><span className="block text-[#DDDDDE] font-medium text-[16px] leading-[24px] lg:text-[24px] lg:leading-[34px] mb-3">Помогает зарабатывать <br className="lg:hidden"/>больше на площадках</span><div className="flex flex-wrap gap-2"><div className="flex items-center bg-[#1A2836] rounded-[24px] px-6 py-4"><div className="relative mr-3 w-4 h-4 flex items-center justify-center"><span className="absolute inset-0 rounded-full bg-[#B531A4] opacity-90 blur-[8px] z-0"></span><span className="w-3 h-3 rounded-full bg-[#B531A4] block relative z-10"></span></div><span className="text-white font-bold uppercase text-[16px] tracking-wide">Wildberries</span></div><div className="flex items-center bg-[#1A2836] rounded-[24px] px-6 py-4"><div className="relative mr-3 w-4 h-4 flex items-center justify-center"><span className="absolute inset-0 rounded-full bg-[#1C77FF]  opacity-90 blur-[8px] z-0"></span><span className="w-3 h-3 rounded-full bg-[#1C77FF] block relative z-10"></span></div><span className="text-white font-bold uppercase text-[16px] tracking-wide">Ozon</span></div><div className="flex items-center bg-[#1A2836] rounded-[24px] px-6 py-4"><div className="relative mr-3 w-4 h-4 flex items-center justify-center"><span className="absolute inset-0 rounded-full bg-[#EFCE56]  opacity-90 blur-[8px] z-0"></span><span className="w-3 h-3 rounded-full bg-[#EFCE56] block relative z-10"></span></div><span className="text-white font-bold uppercase text-[16px] tracking-wide">Yandex Market</span></div><div className="flex items-center bg-[#1A2836] rounded-[24px] px-6 py-4"><div className="relative mr-3 w-4 h-4 flex items-center justify-center"><span className="absolute inset-0 rounded-full bg-[#613CAA]  opacity-90 blur-[8px] z-0"></span><span className="w-3 h-3 rounded-full bg-[#613CAA] block relative z-10"></span></div><span className="text-white font-bold uppercase text-[16px] tracking-wide">Мегамаркет</span></div></div></div>
                    
                    {/* <div className="flex justify-center items-center flex-col lg:flex-row"><button className=" hover:duration-500 rounded-[100px] w-full py-5 lg:w-fit lg:px-12 lg:py-6 flex items-center justify-center lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]"><span className="text-white font-semibold text-[18px] leading-[21px] lg:text-xl lg:leading-6">Оставить заявку</span></button><button className=" hover:duration-500 rounded-[100px] w-full py-5 lg:w-fit lg:px-12 lg:py-6 flex lg:hidden items-center justify-center !bg-[#1A2836] mt-3 !hover:bg-[#1A2836] lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]"><span className="text-white font-semibold text-[18px] leading-[21px] lg:text-xl lg:leading-6">Тарифы</span></button>
                    
                    </div> */}
                    <TgModalForm/>

               </div>
               <div className="flex items-center mt-10 lg:mt-[109px] relative">
                    <div className="mx-auto z-20 overflow-hidden lg:relative w-full lg:w-auto">
                         <div className="hidden lg:block">
                              <img src="/MainPage-1.png" alt="" />
                         </div>
                         <div className="lg:hidden relative">
                              <img src="/MainPage-1.png" alt="" className="w-full h-auto"/>
                         </div>
                    </div>
               </div>


          </div>



          <div className="bg-[#02070D] px-5 lg:px-0">
               <div className="pt-[100px] lg:pt-[150px] flex flex-col lg:items-center">
                    <div className="max-w-[1200px] mx-auto mb-20">
                         <h1 className="text-[#FBFBFC] text-4xl md:text-[60px] font-medium leading-tight mb-12 lg:text-center"><span className="text-[#52575D]">Прайс<br className=" lg:hidden"/> Ниндзя —</span><br className=" lg:hidden"/> это три сервиса</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-start  w-full"><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative"><div className="absolute inset-0 overflow-hidden rounded-[20px] lg:rounded-[60px] z-0"><div className="absolute top-0 right-0 w-[200px] h-[200px]"><div className="absolute inset-0 rounded-full  -translate-y-3/4  bg-[#D172F9] opacity-60 blur-[80px] w-[140%] h-[140%] "></div></div></div><div className="p-10 relative z-10"><h3 className="text-[#FBFBFC] text-xl font-medium mb-2 mt-10">Репрайсер</h3><p className="text-[#9DA3AE] text-base">Автоматически обновляет цены<br className="hidden lg:block"/> по заданным правилам<br className="hidden lg:block"/> и увеличивает маржу</p></div><div className="absolute top-[-20px] right-[20px] z-20"><div><img src="/Diagram-1.png" width="100" height="100"/></div></div></div><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative"><div className="absolute inset-0 overflow-hidden rounded-[20px] lg:rounded-[60px] z-0"><div className="absolute top-0 right-0 w-[200px] h-[200px]"><div className="absolute inset-0 rounded-full  -translate-y-3/4  bg-[#7A85FF] opacity-60 blur-[80px] w-[140%] h-[140%] "></div></div></div><div className="p-10 relative z-10"><h3 className="text-[#FBFBFC] text-xl font-medium mb-2 mt-10">Мониторинг цен</h3><p className="text-[#9DA3AE] text-base">Следите за ценами конкурентов<br className="hidden lg:block"/> и соблюдением РРЦ.<br className="hidden lg:block"/> Оповещения, история изменений и полный контроль</p></div><div className="absolute top-[-20px] right-[20px] z-20"><div><img src="/Diagram-2.png" width="100" height="100"/></div></div></div><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative"><div className="absolute inset-0 overflow-hidden rounded-[20px] lg:rounded-[60px] z-0"><div className="absolute top-0 right-0 w-[200px] h-[200px]"><div className="absolute inset-0 rounded-full  -translate-y-3/4  bg-[#FF4362] opacity-60 blur-[80px] w-[140%] h-[140%] "></div></div></div><div className="p-10 relative z-10"><h3 className="text-[#FBFBFC] text-xl font-medium mb-2 mt-10">Мониторинг поисковых фраз</h3><p className="text-[#9DA3AE] text-base">Узнайте, по каким запросам<br className="hidden lg:block"/> вас находят — и на каких позициях вы в выдаче</p></div><div className="absolute top-[-20px] right-[20px] z-20"><div><img src="/Diagram-3.png" width="100" height="100"/></div></div></div></div>
                    </div>
                    <div className="max-w-[1200px] mx-auto mb-20">
                         <h1 className="text-[#FBFBFC] text-4xl md:text-[60px] font-medium leading-tight mb-12 lg:text-center"><span className="text-[#52575D]">Репрайсер —</span><br className="hidden lg:block"/> главный инструмент для роста <br className="hidden lg:block"/>прибыли на маркетплейсах</h1>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 lg:text-center overflow-hidden"><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:p-20"><div className="flex flex-row lg:block justify-between"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10">Удержание<br className="block lg:hidden"/> цены</h3><span className="block lg:hidden"><img src="/Lock-small.png" alt="Padlock icon" width="60" height="60"/></span></div><p className="text-[#9DA3AE] text-lg lg:mb-4">Если маркетплейс снижает цену за счёт автоакций, СПП или соинвеста - репрайсер вернёт её в заданные границы</p><div className="absolute bottom-0  transform hidden lg:block "><img src="/Lock.png" alt="Padlock icon" width="420" height="420"/><div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] h-48 bg-gradient-to-t from-yellow-400/90 via-yellow-500/50 to-transparent blur-[50px] rounded-full"></div></div></div><div className="flex flex-col h-full"><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:px-20 mb-6 lg:text-center flex flex-col items-center"><div className="flex flex-row  justify-between"><h3 className="text-[#FBFBFC] text-xl font-medium mb-4">Репрайсер подстраивается<br className="block lg:hidden"/> под конкурентов</h3><span className="block lg:hidden"><img src="/graph.png" alt="RepricerGraphIcon" className="w-[100px] object-fit"/></span></div><p className="text-[#9DA3AE] text-base">Повышает цены, когда можно заработать больше.<br className="hidden lg:block"/> Снижает только в заданных пределах, чтобы вы не ушли в минус</p><div className="mt-10 flex justify-center hidden lg:block"><img src="/Diagram-4.png" alt="RepricerGraphIcon" width="270" height="145"/></div></div><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:px-20"><h3 className="text-[#FBFBFC] text-xl font-medium mb-4">Автоматический вход <br className="hidden lg:block"/> и выход из акций</h3><p className="text-[#9DA3AE] text-base">Прайс Ниндзя соблюдает маржу<br className="hidden lg:block"/> и участвует только в выгодных акциях</p></div></div></div>
                         <div className="overflow-hidden transition-all duration-1000 ease-in-out max-h-0"><h1 className="mb-[40px] lg:mt-[100px] lg:mb-12 text-[#FBFBFC] text-4xl md:text-[60px] font-medium leading-tight  
            lg:text-center">Возможности репрайсера</h1><div className="mx-auto max-w-[1200] text-white flex flex-col gap-y-3 min-w-[280px] mb-[40px]
            sm:mb-0
            lg:w-max lg:opacity-100 lg:rounded-[60px] lg:p-[60px] lg:bg-[#1B2126] lg:mb-5
            "><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:mb-8 lg:text-[16px]">Название</div>Удержание цены</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:mb-8 lg:text-[16px]">Описание</div>Репрайсер фиксирует точную цену или соблюдает диапазон. Можно указать,
            какую цену удерживать — с&nbsp;учётом СПП, карты Ozon и WB-кошелька
            или без.</div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:mb-8 lg:text-[16px]">Пример использования</div><ul className="pl-6 list-decimal space-y-3"><li>Соблюдение РРЦ с учётом всех скидок и карт маркетплейсов.</li><li>Удержание единой цены на Ozon и Wildberries.</li></ul></div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Конкурентное следование</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div><p>Автоматически подстраивает цену под конкурентов. Настройте отклонение в рублях или процентах, чтобы цена была чуть выше или ниже. Чтобы не торговать в убыток, задаются ограничения по цене и марже</p><p className="mt-4">Также настраивается, какую цену конкурентов учитывать — с учетом карты Ozon/WB-кошелька или без.</p></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Пример использования</div><ul className="pl-6 list-decimal space-y-3"><li>Ставить цену на 10 ₽ или 5% ниже конкурентов.</li><li>Повышать цену, когда у конкурентов закончились остатки.</li></ul></div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Участие в акциях</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Доступные настройки для участия в акциях:<ul className="pl-4 list-disc list-disc-sm space-y-3 mt-3"><li>Автоматическое участие в акциях,подходящих по условиям цены и маржи</li><li>Автоматический выход из акций при несоответствии заданным условиям</li><li>Повышение цены на ночь для увеличения медианы и порога входа</li><li>Ежечасный пересчёт условий входа и автоматическое повышение цены при их изменении</li><li>Повышение цены сразу после завершения акции</li><li>Установка цены, позволяющей участвовать хотя бы в одной акции с сохранением максимальной маржи.</li></ul></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Пример использования</div>Соблюдение РРЦ с учётом всех скидок и карт маркетплейсов.</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Защита от нулевого остатка</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Позволяет поднять цену, когда товар почти распродан. Например, чтобы замедлить продажи, избежать полного отсутствия на складе и падения в поисковой выдаче.</div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Пример использования</div>Повышать цену на 30% если остаток вашего товара станет меньше 3 шт.</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Оборачиваемость</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div><p>Автоматического изменения цены в зависимости от того, на сколько дней хватит текущих остатков.</p><p className="mt-4">Настройка помогает управлять скоростью продаж: стимулировать спрос при избыточных остатках и замедлять продажи, увеличивая маржу, когда товара на складе недостаточно.</p></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Пример использования</div><ul className="pl-6 list-decimal space-y-3"><li>Если товара хватает более чем на 60 дней → снизить цену на 20%, чтобы ускорить продажи</li><li>Если товара хватает менее чем на 5 дней → поднять цену на 30%, чтобы замедлить продажи и избежать обнуления остатков.</li></ul></div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Расписание</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div><p>Позволяет задать, в какие дни и часы должен работать репрайсер.</p><p className="mt-4">Для одного товара можно настроить несколько стратегий с разным временем действия. Например, одни правила для будней, другие для выходных.</p><p className="mt-4">Расписание можно использовать для A/B-тестов: сравнивать эффективность разных цен в разное время суток.</p></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Пример использования</div><ul className="pl-6 list-decimal space-y-3"><li>A/B-тесты. Можно чередовать цены каждый час (например, 1200 ₽ и 1500 ₽), чтобы лучше понять какая цена приносит больше прибыли.</li><li>Повышение цены ночью, чтобы увеличить порог входа в акцию.</li><li>Настройка разных режимов репрайсера по дням недели и времени суток.</li></ul></div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Журнал репрайсера</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div><p>Хранит полную историю работы репрайсера. Отображает, какие цены устанавливались, когда и почему.</p><p className="mt-4">Позволяет отследить динамику изменений, увидеть, какие цены были у конкурентов на каждом этапе, и понять логику принятия решений системой.</p></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><ul className="pl-6 list-decimal space-y-3"></ul></div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Массовая загрузка</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div><p>Позволяет быстро создавать и редактировать настройки репрайсера для большого количества товаров через Excel-файл.</p><p className="mt-4">Удобна при первичной настройке и для массового внесения изменений.</p></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><ul className="pl-6 list-decimal space-y-3"></ul></div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Ручное подтверждение</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div><p>Репрайсер рассчитывает цены и отображает их в журнале, но не отправляет на маркетплейс.</p><p className="mt-4">Используйте настройку, чтобы проверить расчёты и убедиться, что они соответствуют заданным настройкам, прежде чем включать автоматическое обновление цен.</p></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><ul className="pl-6 list-decimal space-y-3"></ul></div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Юнит экономика</div><div className="sm:w-[440px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div><p>Автоматически рассчитывает маржу по каждому товару с учётом всех затрат при работе на маркетплейсах — комиссии, логистики, хранения и других расходов.</p><p className="mt-4">Позволяет определить минимальную цену без убытков, рассчитать максимально допустимую скидку.</p></div><div className="sm:w-[280px] text-[#CDAA75] leading-[22px]"><ul className="pl-6 list-decimal space-y-3"></ul></div></div></div><div className="text-center"><button className="mx-auto min-w-[280px] sm:min-w-[188px] text-white px-8 py-6 rounded-full border border-[#FFFFFF4D] flex justify-center items-center gap-[10px] hover:opacity-60">Скрыть<svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.745605 7.95228L6.49986 2.19775L12.2544 7.95228" stroke="white" strokeWidth="2"></path></svg></button></div></div>
                 <div className="flex items-center justify-center space-x-4 my-10"><hr className="border-t-2 border-white/20 border-dashed flex-1"/><span className="font-normal text-base leading-[24px] text-[#FBFBFC] text-center">И еще множество гибких настроек<br className="hidden lg:block"/> для роста маржи на каждом заказе</span><hr className="border-t-2 border-white/20 border-dashed  flex-1"/>
                 </div>
                 <div className="text-center"><button className="mx-auto max-w-[280px] sm:max-w-none text-white px-8 py-6 rounded-full border border-[#FFFFFF4D] flex items-center gap-[10px] hover:opacity-60"><span>🔥</span>Все возможности репрайсера<svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.24609 7.19664L10.0004 12.9512L15.7549 7.19664" stroke="white" strokeWidth="2"></path></svg></button>
                 </div>
                 <div className="text-center mt-8">
                  {/* <button className="bg-[#0A25FF] text-white px-8 py-6 rounded-full hover:bg-blue-700 transition-colors">Оставить заявку</button> */}
                  <TgModalForm/>
                 </div>
                    </div>
                    <div className="max-w-[1200px] mx-auto mb-20">
                         <h1 className="text-[#FBFBFC] text-4xl md:text-[60px] font-medium leading-tight mb-12 text-center"><span className="text-[#52575D]"> Мониторинг цен —</span><br className="hidden lg:block"/> полный контроль за конкурентами<br className="hidden lg:block"/> на маркетплейсах
                         </h1>
                         <div className="grid grid-cols-1 gap-6 mb-8 lg:text-center overflow-hidden">
                              <div className="lg:flex space-x-5 self-center">
                                   <div className="grid lg:grid-cols-2 gap-6 ">
                                        <div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:p-20  items-center  overflow-hidden"><div className="absolute inset-0 rounded-full  blur-[80px] z-0 h-[90%] opacity-20 -translate-y-2/3 bg-[#962b92]"></div><span className="block text-2xl leading-[34px] text-white font-medium"><div className="flex flex-row lg:block justify-between gap-6"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10">Учитываем особенности<br className="hidden lg:block"/> маркетплейсов</h3><span className="block lg:hidden"><img src="/marketplace-graph.png" alt="Padlock icon"/></span></div></span><span className="block mt-10 lg:mb-20 text-lg text-[#919BA0] font-normal">Сохраняем все типы цен, включая карты маркетплейсов, wb кошелек и кешбек</span><div className=" hidden lg:block "><svg width="422" height="217" viewBox="0 0 422 217" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.2168 214.785C267.251 214.785 257.868 92.4284 417.52 92.4284" stroke="#B531A4" strokeWidth="2.79176" strokeLinecap="round"></path><path d="M417.986 134.77C229.909 134.77 226.211 29.5895 159.079 29.5895C91.9471 29.5895 107.988 88.4041 2.0141 88.4041" stroke="#1B76FF" strokeWidth="2.79176" strokeLinecap="round"></path><path d="M417.986 64.4077C272.907 64.4077 287.562 22.8135 219.252 22.8135C139.249 22.8135 112.057 160.117 3.4108 160.117" stroke="#E0BC3B" strokeWidth="2.79176" strokeLinecap="round"></path><path d="M417.986 162.189C326.789 162.189 287.219 58.0911 210 58.0911C132.781 58.0911 108.566 126.274 3.40997 126.274" stroke="#613CAA" strokeWidth="2.79176" strokeLinecap="round"></path><rect x="101" y="129.409" width="80.961" height="51.1822" rx="16" fill="#B531A4"></rect><path d="M145.658 146.648L140.472 162.5H136.532L133.044 151.766L129.444 162.5H125.526L120.317 146.648H124.122L127.7 157.79L131.436 146.648H134.833L138.457 157.88L142.148 146.648H145.658ZM159.346 154.257C160.252 154.544 160.962 155.027 161.475 155.706C161.988 156.371 162.245 157.193 162.245 158.175C162.245 159.564 161.701 160.636 160.614 161.39C159.542 162.13 157.972 162.5 155.904 162.5H147.706V146.648H155.451C157.384 146.648 158.863 147.018 159.89 147.758C160.931 148.497 161.452 149.501 161.452 150.769C161.452 151.539 161.264 152.226 160.886 152.83C160.524 153.434 160.01 153.91 159.346 154.257ZM151.352 149.411V153.147H154.998C155.904 153.147 156.591 152.989 157.059 152.672C157.527 152.355 157.761 151.887 157.761 151.268C157.761 150.649 157.527 150.188 157.059 149.886C156.591 149.569 155.904 149.411 154.998 149.411H151.352ZM155.632 159.737C156.598 159.737 157.323 159.579 157.806 159.262C158.304 158.945 158.554 158.454 158.554 157.79C158.554 156.476 157.58 155.819 155.632 155.819H151.352V159.737H155.632Z" fill="white"></path><rect x="272" y="145.909" width="80.961" height="51.1822" rx="16" fill="#613CAA"></rect><path d="M307.156 179L307.134 169.489L302.469 177.324H300.816L296.173 169.693V179H292.731V163.148H295.766L301.699 172.999L307.541 163.148H310.553L310.599 179H307.156ZM328.785 179L328.763 169.489L324.097 177.324H322.444L317.802 169.693V179H314.36V163.148H317.394L323.327 172.999L329.17 163.148H332.182L332.227 179H328.785Z" fill="white"></path><g filter="url(#filter0_d_730_18753)"><rect x="343.539" width="74.4469" height="51.1822" rx="16" fill="#E0BC3B" shapeRendering="crispEdges"></rect><path d="M371.862 27.4749V33.0911H368.194V27.4296L362.057 17.2389H365.952L370.187 24.2818L374.421 17.2389H378.022L371.862 27.4749ZM393.828 33.0911L393.805 23.5798L389.14 31.4153H387.487L382.844 23.7836V33.0911H379.402V17.2389H382.437L388.37 27.0899L394.213 17.2389H397.225L397.27 33.0911H393.828Z" fill="#1E1E1E"></path></g><rect x="2.0141" y="16.5" width="71.6551" height="51.1822" rx="16" fill="#1B76FF"></rect><path d="M30.3253 49.8629C28.6797 49.8629 27.1926 49.5081 25.8641 48.7985C24.5506 48.0889 23.5164 47.1152 22.7616 45.8772C22.0218 44.6241 21.6519 43.2201 21.6519 41.665C21.6519 40.11 22.0218 38.7135 22.7616 37.4755C23.5164 36.2224 24.5506 35.2411 25.8641 34.5315C27.1926 33.822 28.6797 33.4672 30.3253 33.4672C31.9709 33.4672 33.4505 33.822 34.7639 34.5315C36.0774 35.2411 37.1116 36.2224 37.8664 37.4755C38.6213 38.7135 38.9987 40.11 38.9987 41.665C38.9987 43.2201 38.6213 44.6241 37.8664 45.8772C37.1116 47.1152 36.0774 48.0889 34.7639 48.7985C33.4505 49.5081 31.9709 49.8629 30.3253 49.8629ZM30.3253 46.7377C31.2614 46.7377 32.1068 46.5264 32.8617 46.1036C33.6165 45.6658 34.2053 45.0619 34.6281 44.292C35.0659 43.522 35.2848 42.6464 35.2848 41.665C35.2848 40.6837 35.0659 39.8081 34.6281 39.0381C34.2053 38.2681 33.6165 37.6718 32.8617 37.2491C32.1068 36.8112 31.2614 36.5923 30.3253 36.5923C29.3893 36.5923 28.5438 36.8112 27.789 37.2491C27.0341 37.6718 26.4378 38.2681 25.9999 39.0381C25.5772 39.8081 25.3659 40.6837 25.3659 41.665C25.3659 42.6464 25.5772 43.522 25.9999 44.292C26.4378 45.0619 27.0341 45.6658 27.789 46.1036C28.5438 46.5264 29.3893 46.7377 30.3253 46.7377ZM54.4414 46.6019V49.5911H40.582V47.2133L49.2781 36.7282H40.7632V33.7389H54.1017V36.1168L45.4283 46.6019H54.4414Z" fill="white"></path><defs><filter id="filter0_d_730_18753" x="339.539" y="0" width="82.4469" height="59.1822" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dy="4"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_730_18753"></feBlend><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_730_18753" result="shape"></feBlend></filter></defs></svg></div></div>
                                        <div className="flex flex-col space-y-5">
                                             <div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:p-16 hidden lg:block">
                                                  <div className="grid grid-cols-3 gap-8 items-start">
                                                       <div className="col-span-2"><span className="block  text-xl leading-[27px] text-white text-left font-medium"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10"> Уведомляем в Telegram <br className="hidden lg:block"/> или на почту</h3></span><span className="block mt-5 text-left text-base text-[#919BA0] font-normal">Присылаем уведомления об изменении цен и наличия по вашему графику</span></div>
                                                       <div className="relative">
                                                            <img src="/Messages.png" alt="" className="w-[142px] h-[137px]" />
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:p-16 block lg:hidden"><div className="text-left"><span className="block text-xl leading-[34px] text-white  font-medium"><div className="flex flex-row lg:block justify-between gap-6"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10"> Уведомляем в Telegram <br className="hidden lg:block"/> или на почту</h3><span className="block lg:hidden"><img src="/tg_notif.png" alt="Telegram icon" width="130"/></span></div></span><span className="block mt-5 text-base text-[#919BA0] font-normal">Присылаем уведомления об изменении цен и наличия по вашему графику </span></div></div>
                                             <div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:p-16"><div className="text-left"><span className="block text-xl leading-[34px] text-white  font-medium"><div className="flex flex-row lg:block justify-between gap-6"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10"> Покажем, сколько вы зарабатываете<br className="hidden lg:block"/>с каждой продажи</h3><span className="block lg:hidden"><img src="/income.png" alt="Padlock icon"/></span></div></span><span className="block mt-5 text-base text-[#919BA0] font-normal">Рассчитываем юнит экономику и маржу.<br className="hidden lg:block"/>Учитываем комиссии, логистику, рекламу и прочие расходы. Показываем допустимую скидку — чтобы вы не ушли в минус</span></div></div>
                                        </div>
                                   </div>
                              </div>



                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left overflow-hidden"><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:py-12 overflow-hidden lg:pb-52"><span className="block text-xl leading-[34px] text-white  font-medium"><div className="flex flex-row lg:block justify-between gap-6"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10"> Анализируем акции</h3><span className="block lg:hidden"><img src="/percent.png" alt="Padlock icon" width="60"/></span></div></span><span className="block mt-1  text-base text-[#919BA0] font-normal">Показываем, в каких акциях участвуют конкуренты</span><div className=" hidden lg:block absolute bottom-0 right-0"><img src="/percent.png" alt="Percent icon" width="220" height="240"/><div className="absolute bottom-0 left-0 transform   w-[90%] h-48 bg-gradient-to-t from-yellow-400/90 via-yellow-500/50 to-transparent blur-[50px] rounded-full"></div></div></div><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:py-12 lg:pt-0 flex flex-col items-end  "><div className="relative hidden lg:block"><img src="/rrc.png" alt="RRC file icon" width="200" height="200"/><div className="absolute -top-[70px] left-0 transform  w-[90%] h-48 bg-gradient-to-t from-yellow-400/90 via-yellow-500/50 to-transparent blur-[50px] rounded-full"></div></div><div className="lg:flex lg:flex-col items-start"><span className="block text-xl leading-[34px] text-white  font-medium"><div className="flex flex-row lg:block justify-between gap-6"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10">Контроль<br className="block lg:hidden"/> РРЦ</h3><span className="block lg:hidden"><img src="/rrc.png" alt="Padlock icon" width="60"/></span></div></span><span className="block mt-1  text-base text-[#919BA0] font-normal">Покажем нарушение РРЦ и отправим уведомления</span></div></div><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:py-12 text-left flex-grow justify-between relative overflow-hidden lg:pb-52"><div className="lg:flex lg:flex-col items-start"><span className="block text-xl leading-[34px] text-white  font-medium"><div className="flex flex-row lg:block justify-between gap-6"><h3 className="text-[#FBFBFC] text-xl  lg:text-2xl font-medium mb-4 lg:mb-10">Экспорт<br className="block lg:hidden"/> отчетов</h3><span className="block lg:hidden"><img src="/excel.png" alt="Export icon" width="60"/></span></div></span><span className="block   mt-1 text-base text-[#919BA0] font-normal">Сохраняйте данные в Excel</span></div><div className="hidden lg:block absolute bottom-0 right-0"><img src="/excel.png" alt="Excel file icon" width="220" height="240"/><div className="absolute bottom-0 left-0 transform  w-[90%] h-48 bg-gradient-to-t from-green-400/90 via-green-500/50 to-transparent blur-[50px] rounded-full"></div></div></div></div>


                         </div>
                         <div className="overflow-hidden transition-all duration-1000 ease-in-out max-h-0"><h1 className="mb-[40px] lg:mt-[100px] lg:mb-12 text-[#FBFBFC] text-4xl md:text-[60px] font-medium leading-tight  
            lg:text-center">Возможности мониторинга</h1><div className="mx-auto max-w-[1200] text-white flex flex-col gap-y-3 min-w-[280px] mb-[40px]
            sm:mb-0
            lg:w-max lg:opacity-100 lg:rounded-[60px] lg:p-[60px] lg:bg-[#1B2126] lg:mb-5
            "><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:mb-8 lg:text-[16px]">Название</div>Мониторинг цен на макретплейсах.</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:mb-8 lg:text-[16px]">Описание</div>Проверяем цены на маркетплейсах. Можно настроить периодичность обновления данных. Например каждый час или раз в сутки</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Учет скидок и карт</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Сохраняем все типы цен, включая СПП, карты маркетплейсов, wb кошелек и кешбек</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Уведомления</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Отправляем оповещения о снижении цен, нарушении РРЦ, изменении наличия. Можно выбрать каналы (Telegram, email) и настроить расписание</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Акции</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Показываем в каких акциях участвуют конкуренты</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Контроль РРЦ</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Отслеживаем товары с нарушением РРЦ. При необходимости присылаем уведомления</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Сравнение с вашей ценой</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Подсвечиваем, если цена конкурента ниже вашей</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>История изменений</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Храним историю цен за любой период. Можно отследить, как менялись цены у конкурентов</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Аналитика и сравнение</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Строим графики и таблицы с динамикой цен по дням и часам. Можно вывести всех конкурентов на единый график для наглядного сравнения</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Экспорт данных</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Все данные экспортируются в Excel</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Массовое добавление товаров</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Возможность загрузки и редактирования товаров через Excel-файл</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0 lg:border-b-2 lg:border-dashed lg:border-white/20 lg:pb-[30px]"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Рекомендации конкурентов</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>После добавления ваших товаров находим соответствующих конкурентов на маркетплейсах</div></div><div className="opacity-100 rounded-[20px] bg-[#1B2126] py-5 px-6 text-xs flex flex-col gap-5
                 lg:opacity-none lg:rounded-none lg:bg-none lg:flex-row lg:gap-[30px] lg:pt-[30px] lg:text-sm lg:py-0 lg:px-0"><div className="sm:w-[280px] text-sm lg:text-[20px] font-medium"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Название</div>Фильтрация</div><div className="sm:w-[450px] leading-[22px]"><div className="text-xs text-[#919BA0] mb-2 font-normal lg:hidden">Описание</div>Поддерживается гибкая фильтрация по: маркетплейсу, продавцу, бренду, категории, типу цены (включая карту Ozon, WB-кошелёк и без карты), участию в акциях, нарушению РРЦ, а также по конкурентам, чья цена ниже вашей на заданный процент</div></div></div><div className="text-center"><button className="mx-auto min-w-[280px] sm:min-w-[188px] text-white px-8 py-6 rounded-full border border-[#FFFFFF4D] flex justify-center items-center gap-[10px] hover:opacity-60">Скрыть<svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.745605 7.95228L6.49986 2.19775L12.2544 7.95228" stroke="white" strokeWidth="2"></path></svg></button></div></div>

                 <div className="text-center"><button className="mx-auto max-w-[280px] sm:max-w-none text-white px-8 py-6 rounded-full border border-[#FFFFFF4D] flex items-center gap-[10px] hover:opacity-60"><span>🔥</span>Все возможности мониторинга<svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.24609 7.19664L10.0004 12.9512L15.7549 7.19664" stroke="white" strokeWidth="2"></path></svg></button></div>
                    </div>
                    <div className="max-w-[1200px] lg:mx-auto mb-20"><h1 className="text-[#FBFBFC] text-4xl md:text-[60px] font-medium leading-tight mb-12 text-center"><span className="text-[#52575D]">Мониторинг фраз  —</span><br className="hidden lg:block"/> ежедневный контроль<br className="hidden lg:block"/> ваших позиций</h1><div className="hidden lg:flex space-x-5 self-center"><div className="hidden mt-5 lg:flex space-x-5 self-center w-full"><div className="flex flex-col space-y-5 w-full"><div className="flex justify-between items-center p-20 rounded-[20px] lg:rounded-[60px] bg-[#1B2126] "><div className="flex flex-col "><span className="block text-5xl leading-[54px] text-white  font-medium">Проверяем<br className="hidden lg:block"/> поисковые запросы</span><span className="block mt-10 text-lg text-[#919BA0] font-normal">Покажем позиции товаров на WB и OZ</span>
                    {/* <button className=" hover:duration-500 rounded-[100px] w-full mt-10 py-5 lg:w-fit lg:px-12 lg:py-6 flex items-center justify-center lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]"><span className="text-white font-semibold text-[18px] leading-[21px] lg:text-xl lg:leading-6">Оставить заявку</span>
                    </button> */}
                    <TgModalForm/>
                    </div><div className="relative left-20"><svg width="482" height="237" viewBox="0 0 482 237" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M173.975 154.08C173.975 108.485 210.937 71.5234 256.532 71.5234H499.92C545.515 71.5234 582.477 108.485 582.477 154.08C582.477 199.676 545.515 236.638 499.92 236.638H256.532C210.937 236.638 173.975 199.676 173.975 154.08Z" fill="#6E7C88"></path><rect x="83.7656" y="36.1094" width="588.922" height="165.114" rx="82.5571" fill="#7C8A96"></rect><rect x="0.115234" y="0.0527344" width="756.223" height="165.114" rx="82.5571" fill="#E7E7E7"></rect><path d="M110.538 106.977L126.15 122.589M120.946 80.9565C120.946 101.075 104.637 117.385 84.518 117.385C64.3993 117.385 48.0898 101.075 48.0898 80.9565C48.0898 60.8378 64.3993 44.5283 84.518 44.5283C104.637 44.5283 120.946 60.8378 120.946 80.9565Z" stroke="#6F6F8D" strokeWidth="10.408" strokeLinecap="round" strokeLinejoin="round"></path></svg></div></div></div></div></div><div className="block lg:hidden space-x-5 self-center"><div className="bg-[#1A1D21] rounded-[20px] lg:rounded-[60px] relative  p-10 lg:py-12 overflow-hidden"><div className="relative w-full flex justify-end -right-[40px] mb-10"><svg width="270" height="100" viewBox="0 0 482 237" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M173.975 154.08C173.975 108.485 210.937 71.5234 256.532 71.5234H499.92C545.515 71.5234 582.477 108.485 582.477 154.08C582.477 199.676 545.515 236.638 499.92 236.638H256.532C210.937 236.638 173.975 199.676 173.975 154.08Z" fill="#6E7C88"></path><rect x="83.7656" y="36.1094" width="588.922" height="165.114" rx="82.5571" fill="#7C8A96"></rect><rect x="0.115234" y="0.0527344" width="756.223" height="165.114" rx="82.5571" fill="#E7E7E7"></rect><path d="M110.538 106.977L126.15 122.589M120.946 80.9565C120.946 101.075 104.637 117.385 84.518 117.385C64.3993 117.385 48.0898 101.075 48.0898 80.9565C48.0898 60.8378 64.3993 44.5283 84.518 44.5283C104.637 44.5283 120.946 60.8378 120.946 80.9565Z" stroke="#6F6F8D" strokeWidth="10.408" strokeLinecap="round" strokeLinejoin="round"></path></svg></div><span className="block text-3xl leading-[40px] text-white  font-medium">Проверяем<br className="hidden lg:block"/> поисковые<br className="hidden lg:block"/>  запросы</span><span className="block mt-10 text-lg text-[#919BA0] font-normal">Покажем позиции товаров на WB и OZ</span>
                    {/* <button className=" hover:duration-500 rounded-[100px] w-full mt-10 py-5 lg:w-fit lg:px-12 lg:py-6 flex items-center justify-center lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]"><span className="text-white font-semibold text-[18px] leading-[21px] lg:text-xl lg:leading-6">Оставить заявку</span>
                    </button> */}
                    <TgModalForm/>
                    </div></div></div>
               </div>
          </div>





     <div className="bg-[#02070D] px-5 lg:px-0">
      <div className="pt-[100px] lg:pt-[150px] flex flex-col lg:items-center">
        <div className="flex flex-col lg:items-center">
          <span className="block text-[36px] leading-[40px] lg:text-[95px] lg:leading-[100px] text-[#FBFBFC] font-medium -tracking-[2px] lg:-tracking-[3px]">
            Стоимость
          </span>
          <span className="block text-[36px] leading-[40px] lg:text-[95px] lg:leading-[100px] text-[#52575D] font-medium -tracking-[2px] lg:-tracking-[3px]">
            Прайс Ниндзя
          </span>
        </div>

        <div className="items-center flex mt-20 gap-3">
          <div className="rounded-[50px] border text-white border-indigo-60 py-5 px-6">Репрайсер</div>
          <div className="cursor-pointer text-white py-5 px-6">Мониторинг цен</div>
          <div className="cursor-pointer text-white py-5 px-6">Поисковые фразы</div>
        </div>

        <div id="tariffs" className="w-full max-w-[1200px]">
          <div className="bg-[#1B2126] rounded-t-[20px] rounded-b-[10px] lg:rounded-t-[60px] lg:rounded-b-[30px] py-5 lg:p-20 mt-[49px] lg:mt-5">
            <div className="hidden lg:flex space-x-10 justify-between">
              {/* ====== ШАГ 1 ====== */}
              <div className="flex flex-grow max-w-[230px] min-w-[230px]">
                <div className="space-y-8 flex-grow">
                  <div className="rounded-[100px] pt-[18px] px-6 pb-4 border border-white/[12%] w-fit">
                    <span className="block text-white text-sm leading-[16px] font-semibold">ШАГ 1</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3 justify-between">
                      <span className="block text-white font-medium text-lg whitespace-nowrap leading-[34px]">Товаров</span>
                      <div className="relative inline-flex items-center group">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2B3135] text-white/80 text-xs select-none" aria-label="Подробнее">?</span>
                        <div className="absolute z-20 hidden group-hover:block left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ minWidth: 260, maxWidth: 460 }}>
                          <div className="rounded-lg bg-[#2B3135] text-white border border-white/[12%] shadow-lg p-3 text-[12px] leading-[16px]">
                            Считаем все товары в наличии по добавленным ключам. Количество магазинов не ограничено
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-0.5 bg-white/[7%]"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer bg-[#2B3135] border-transparent" onClick={() => setTier("300")}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">до 300 товаров</span>
                        </div>
                        <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">13&nbsp;700 ₽</span>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="tier"
                        value="300"
                        checked={tier === "300"}
                        onChange={() => setTier("300")}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setTier("1000")}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">до 1000 товаров</span>
                        </div>
                        <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">+ 10&nbsp;000 ₽</span>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="tier"
                        value="1000"
                        checked={tier === "1000"}
                        onChange={() => setTier("1000")}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setTier("3000")}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">до 3000 товаров</span>
                        </div>
                        <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">+ 20&nbsp;000 ₽</span>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="tier"
                        value="3000"
                        checked={tier === "3000"}
                        onChange={() => setTier("3000")}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setTier("5000")}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">до 5000 товаров</span>
                        </div>
                        <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">+ 34&nbsp;000 ₽</span>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="tier"
                        value="5000"
                        checked={tier === "5000"}
                        onChange={() => setTier("5000")}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setTier("5000+")}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">от 5000 товаров</span>
                        </div>
                        <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">+ 44&nbsp;000 ₽</span>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="tier"
                        value="5000+"
                        checked={tier === "5000+"}
                        onChange={() => setTier("5000+")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ====== ШАГ 2 ====== */}
              <div className="flex flex-grow max-w-[230px] min-w-[230px]">
                <div className="space-y-8 flex-grow">
                  <div className="rounded-[100px] pt-[18px] px-6 pb-4 border border-white/[12%] w-fit">
                    <span className="block text-white text-sm leading-[16px] font-semibold">ШАГ 2</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3 justify-between">
                      <span className="block text-white font-medium text-lg whitespace-nowrap leading-[34px]">Маркетплейсов</span>
                      <div className="relative inline-flex items-center group">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2B3135] text-white/80 text-xs select-none" aria-label="Подробнее">?</span>
                        <div className="absolute z-20 hidden group-hover:block left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ minWidth: 260, maxWidth: 460 }}>
                          <div className="rounded-lg bg-[#2B3135] text-white border border-white/[12%] shadow-lg p-3 text-[12px] leading-[16px]">
                            Количество маркетплейсов, где есть хотя бы один ваш товар в наличии
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-0.5 bg-white/[7%]"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer bg-[#2B3135] border-transparent" onClick={() => setMarketplaces("1")}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">1 маркетплейс</span>
                        </div>
                        <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">Бесплатно</span>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="marketplaces"
                        value="1"
                        checked={marketplaces === "1"}
                        onChange={() => setMarketplaces("1")}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setMarketplaces("2")}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">2 маркетплейса</span>
                        </div>
                        <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">+ 5&nbsp;700 ₽</span>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="marketplaces"
                        value="2"
                        checked={marketplaces === "2"}
                        onChange={() => setMarketplaces("2")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ====== ШАГ 3 ====== */}
              <div className="flex flex-grow max-w-[230px] min-w-[230px]">
                <div className="space-y-8 flex-grow">
                  <div className="rounded-[100px] pt-[18px] px-6 pb-4 border border-white/[12%] w-fit">
                    <span className="block text-white text-sm leading-[16px] font-semibold">ШАГ 3</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3 justify-between">
                      <span className="block text-white font-medium text-lg whitespace-nowrap leading-[34px]">Доп. опции</span>
                      <div className="relative inline-flex items-center group">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2B3135] text-white/80 text-xs select-none" aria-label="Подробнее">?</span>
                        <div className="absolute z-20 hidden group-hover:block left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ minWidth: 260, maxWidth: 460 }}>
                          <div className="rounded-lg bg-[#2B3135] text-white border border-white/[12%] shadow-lg p-3 text-[12px] leading-[16px]">
                            <strong>Премиум-поддержка</strong>
                            <div className="mt-1">Выделенный чат с нашей командой. Среднее время ответа — 15 минут. Без премиума ответы до 6 часов</div>
                            <div className="mt-4">
                              <strong>Обучение сервису</strong>
                              <div className="mt-1">Персональное обучение. Подскажем как лучше настроить репрайсеры для вашего бизнеса. Неограниченные созвоны в течение первого месяца, чтобы вы быстро освоили сервис</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-0.5 bg-white/[7%]"></div>
                  </div>

                  {/* Премиум поддержка */}
                  <button
                    type="button"
                    onClick={() => setPremium(p => !p)}
                    className="flex items-center justify-between w-full px-5 py-4 min-h-[86px] rounded-[16px] border text-left border-white/[12%]"
                  >
                    <div className="pr-4">
                      <span className="block text-white text-sm leading-[22px]">Премиум поддержка</span>
                      <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">+ 8&nbsp;700 ₽</span>
                    </div>
                    <span className="w-[44px] h-[24px] rounded-full p-[2px] transition-colors bg-[#2B3135]">
                      <span
                        className={`block w-[20px] h-[20px] bg-white rounded-full transition-transform ${premium ? "translate-x-[20px]" : "translate-x-0"}`}
                      ></span>
                    </span>
                  </button>

                  {/* Обучение сервису */}
                  <button
                    type="button"
                    onClick={() => setTraining(t => !t)}
                    className="flex items-center justify-between w-full px-5 py-4 min-h-[86px] rounded-[16px] border text-left border-white/[12%]"
                  >
                    <div className="pr-4">
                      <span className="block text-white text-sm leading-[22px]">Обучение сервису</span>
                      <span className="block text-[#FFE8AE] text-xs leading-[20px] pt-[3px]">+ 15&nbsp;700 ₽</span>
                    </div>
                    <span className="w-[44px] h-[24px] rounded-full p-[2px] transition-colors bg-[#2B3135]">
                      <span
                        className={`block w-[20px] h-[20px] bg-white rounded-full transition-transform ${training ? "translate-x-[20px]" : "translate-x-0"}`}
                      ></span>
                    </span>
                  </button>
                </div>
              </div>

              {/* ====== ШАГ 4 ====== */}
              <div className="flex flex-grow max-w-[230px] min-w-[230px]">
                <div className="space-y-8 flex-grow">
                  <div className="rounded-[100px] pt-[18px] px-6 pb-4 border border-white/[12%] w-fit">
                    <span className="block text-white text-sm leading-[16px] font-semibold">ШАГ 4</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3 justify-between">
                      <span className="block text-white font-medium text-lg whitespace-nowrap leading-[34px]">Период действия</span>
                    </div>
                    <div className="h-0.5 bg-white/[7%]"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setPeriod(1)}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">1 месяц</span>
                        </div>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="period"
                        value="1"
                        checked={period === 1}
                        onChange={() => setPeriod(1)}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setPeriod(3)}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">3 месяца</span>
                          <span className="block text-white text-[12px] px-1 leading-[22px] rounded-[7px] bg-[#C93F38] font-semibold">- 10 %</span>
                        </div>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="period"
                        value="3"
                        checked={period === 3}
                        onChange={() => setPeriod(3)}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer border-white/[12%]" onClick={() => setPeriod(6)}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">6 месяцев</span>
                          <span className="block text-white text-[12px] px-1 leading-[22px] rounded-[7px] bg-[#C93F38] font-semibold">- 15 %</span>
                        </div>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="period"
                        value="6"
                        checked={period === 6}
                        onChange={() => setPeriod(6)}
                      />
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 rounded-[16px] min-h-[86px] border cursor-pointer bg-[#2B3135] border-transparent" onClick={() => setPeriod(12)}>
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="block text-white text-sm leading-[22px]">12 месяцев</span>
                          <span className="block text-white text-[12px] px-1 leading-[22px] rounded-[7px] bg-[#C93F38] font-semibold">- 20 %</span>
                        </div>
                      </div>
                      <input
                        className="block relative float-left mr-3 mt-0.5 h-5 w-5 appearance-none rounded-full hover:duration-500 hover:border-[rgb(255,255,255,0.50)] border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[8px] checked:after:w-[8px] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:bg-white checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100  checked:focus:border-primary checked:focus:before:scale-100 dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary border-[rgb(255,255,255,0.12)] checked:border-white"
                        type="radio"
                        name="period"
                        value="12"
                        checked={period === 12}
                        onChange={() => setPeriod(12)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ====== МОБИЛЬНЫЕ БЛОКИ (оставил как есть, без логики выбора) ====== */}
            <div className="lg:hidden flex flex-col pl-6">
              <div className="flex items-center pr-6">
                <span className="block text-[#D9D9D9] text-xs leading-[18px] font-bold mr-4">ШАГ 1</span>
                <div className="grow bg-[#2B3135] h-[1px]"></div>
              </div>
              <span className="block mt-1 text-xs leading-[18px] text-[#919BA0]">
                Количество поисковых фраз<br />для мониторинга
              </span>
              <div className="relative">
                <div
                  className="absolute right-0 w-[35px] h-[70px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(267deg, rgb(27, 33, 38) 16.37%, rgba(27, 33, 38, 0) 96.93%)",
                  }}
                ></div>
                <div className="mt-3 overflow-x-auto mobile-tariffs-block">
                  <div className="flex space-x-2 pb-6">
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px] border-white">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">
                        до 300 товаров
                      </span>
                      <span className="block text-[#FFE8AE] text-[10px] leading-[16px] pt-[3px]"></span>
                    </div>
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px]">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">
                        до 1000 товаров
                      </span>
                      <span className="block text-[#FFE8AE] text-[10px] leading-[16px] pt-[3px]">
                        + 10&nbsp;000 ₽
                      </span>
                    </div>
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px]">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">
                        до 3000 товаров
                      </span>
                      <span className="block text-[#FFE8AE] text-[10px] leading-[16px] pt-[3px]">
                        + 20&nbsp;000 ₽
                      </span>
                    </div>
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px]">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">
                        до 5000 товаров
                      </span>
                      <span className="block text-[#FFE8AE] text-[10px] leading-[16px] pt-[3px]">
                        + 34&nbsp;000 ₽
                      </span>
                    </div>
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px]">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">
                        от 5000 товаров
                      </span>
                      <span className="block text-[#FFE8AE] text-[10px] leading-[16px] pt-[3px]">
                        + 44&nbsp;000 ₽
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center pr-6">
                <span className="block text-[#D9D9D9] text-xs leading-[18px] font-bold mr-4">ШАГ 2</span>
                <div className="grow bg-[#2B3135] h-[1px]"></div>
              </div>
              <span className="block mt-1 text-xs leading-[18px] text-[#919BA0]">
                Выберите кол-во месяцев <br /> действия сервиса
              </span>
              <div className="relative">
                <div
                  className="absolute right-0 w-[35px] h-[70px]"
                  style={{
                    background:
                      "linear-gradient(267deg, rgb(27, 33, 38) 16.37%, rgba(27, 33, 38, 0) 96.93%)",
                  }}
                ></div>
                <div className="mt-3 overflow-x-auto mobile-tariffs-block">
                  <div className="flex space-x-2 pb-6">
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px]">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">1 мес</span>
                    </div>
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px]">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">3 мес</span>
                      <span className="block text-[#FF7B74] text-[10px] leading-[16px] pt-[3px] whitespace-nowrap">Скидка 10 %</span>
                    </div>
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px]">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">6 мес</span>
                      <span className="block text-[#FF7B74] text-[10px] leading-[16px] pt-[3px] whitespace-nowrap">Скидка 15 %</span>
                    </div>
                    <div className="border border-[rgb(255,255,255,0.07)] py-2 px-3 rounded-[8px] border-white">
                      <span className="block text-white text-[12px] leading-[15px] whitespace-nowrap">12 мес</span>
                      <span className="block text-[#FF7B74] text-[10px] leading-[16px] pt-[3px] whitespace-nowrap">Скидка 20 %</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center pr-6">
                <span className="block text-[#D9D9D9] text-xs leading-[18px] font-bold mr-4">ШАГ 3</span>
                <div className="grow bg-[#2B3135] h-[1px]"></div>
              </div>
              <span className="block mt-1 text-xs leading-[18px] text-[#919BA0]">
                Осталось оплатить и начать<br /> пользоваться!
              </span>
              <div className="pr-6">
                <span className="block mb-4 flex justify-between w-full items-baseline text-[#9DCF4E] text-[32px] font-normal leading-[47px] !text-[32px]">
                  <span>{format(monthly)}</span>
                  <span className="dots grow h-[2px] bg-[repeating-linear-gradient(90deg,_#9DCF4E,_#9DCF4E_2px,_transparent_2px,_transparent_6px)]"></span>
                  <span className="text-base">в месяц</span>
                </span>
                <span className="block mb-4 text-[#9DCF4E] text-[20px] font-normal leading-[23px]">
                  <div className="flex justify-between items-baseline w-full">
                    <span>{format(total)}</span>
                    <span className="dots grow h-[2px] bg-[repeating-linear-gradient(90deg,_#9DCF4E,_#9DCF4E_2px,_transparent_2px,_transparent_6px)]"></span>
                    <span className="text-base">за {period} мес</span>
                  </div>
                </span>
              </div>
            </div>
          </div>

          {/* Итоговый блок (десктоп) */}
          <div className="w-full hidden lg:block  max-w-[1200px] bg-[#1B2126] rounded-b-[20px] rounded-t-[10px] lg:rounded-b-[60px] lg:rounded-t-[30px] py-6 lg:py-10 px-6 lg:px-10 mt-[49px] lg:mt-5">
            <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6">
              <div className="w-full lg:w-2/5">
                <div>
                  <span className="block mb-2 flex justify-between w-full items-baseline text-[#9DCF4E] text-5xl font-normal leading-[47px] !text-[32px]">
                    <span className="text-5xl">{format(monthly)}</span>
                    <span className="dots grow h-[2px] bg-[repeating-linear-gradient(90deg,_#9DCF4E,_#9DCF4E_2px,_transparent_2px,_transparent_6px)]"></span>
                    <span className="text-lg">в месяц</span>
                  </span>
                  <span className="block text-[#9DCF4E] text-base font-normal leading-[23px]">
                    <div className="flex justify-between items-baseline w-full">
                      <span className="text-base">{format(total)}</span>
                      <span className="dots grow h-[2px] bg-[repeating-linear-gradient(90deg,_#9DCF4E,_#9DCF4E_2px,_transparent_2px,_transparent_6px)]"></span>
                      <span className="text-base">за {period} мес</span>
                    </div>
                  </span>
                </div>
              </div>

              <div className="hidden lg:block w-px bg-white/[12%]"></div>

              <div className="w-full lg:w-3/5 self-center">
                <button className=" hover:duration-500 rounded-[100px] w-full py-6 lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]">
                  <span className="block font-semibold lg:font-medium text-[18px] leading-[21px] lg:text-[32px] lg:leading-[38px] lg:-tracking-[1px] text-center text-white">
                    Мне все нравится,<br className="lg:hidden" /> начинаем!
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>



<div className="m-2 pt-[50px] bg-[#02070D]"><a href="/parsing" className="py-5 px-8 flex flex-wrap w-fit mx-auto items-center parsingButton hover:before:!text-[#DCB045] hover:duration-500"><div className="flex items-center"><span className="block text-black text-[27px] leading-[30px] h-[30px] mr-3">✨</span><span className="block text-[#FBFBFC] text-[16px] leading-[34px] font-medium relative top-[1px]">Эй, пссст, у нас еще заказывают парсинг любых сайтов!</span></div><div className="hidden sm:block h-[34px] w-[2px] mx-6" style={{ background: 'rgba(255, 255, 255, 0.07)' }}></div><div className="flex items-center mx-auto"><span className="block text-[#DCB045] text-[16px] leading-[34px] font-medium mr-2 relative top-[1px]">Посмотрите и заказывайте</span><svg xmlns="http://www.w3.org/2000/svg" width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M1.82617 1.48047L5.3457 5.0004L1.82617 8.51994" stroke="#DCB045" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></div></a></div>



<div className="bg-[#02070D] px-5 lg:px-0"><div className="pt-[100px] lg:pt-[150px] flex flex-col lg:items-center"><span className="block text-[36px] leading-[40px] lg:text-[95px] lg:leading-[100px] text-[#FBFBFC] font-medium -tracking-[2px] lg:-tracking-[3px] lg:text-center">У вас <br className="block lg:hidden"/>вопросы?<br className="hidden lg:block"/> Или предложения?</span><span className="block text-[36px] leading-[40px] lg:text-[95px] lg:leading-[100px] text-[#52575D] font-medium -tracking-[2px] lg:-tracking-[3px] lg:text-center">Пришлите <br className="block lg:hidden"/>номер,<br className="hidden lg:block"/> а мы<br className="block lg:hidden"/> свяжемся:</span><div className="relative mt-[49px] lg:mt-[60px] ">
  <MaskedPhoneRU
    useOverlayPrefix
    className="outline-0 cursor-pointer hover:duration-500 hover:bg-[#252B30] bg-[#1B2126] rounded-[1000px] lg:rounded-[100px] pt-[17px] pb-[17px] lg:py-[47px] block text-[27px] lg:text-[95px] leading-[26px] lg:leading-[90px] text-[#FBFBFC] font-medium placeholder:text-[27px] lg:placeholder:text-[95px] placeholder:text-[#52575D] placeholder:font-medium pr-[18px] lg:pr-[64px] pl-[56px] lg:pl-[192px] w-full lg:w-[963px] lg:min-w-[963px]"
  />
  <span className="block absolute text-[27px] lg:text-[95px] leading-[27px] lg:leading-[90px] font-medium text-[#FBFBFC] left-[18px] lg:left-[64px] top-[20px] lg:top-[58px]">
    +7
  </span>
</div>
{/* <button className=" hover:duration-500 rounded-[100px] relative flex justify-center items-center mt-5 lg:mt-[60px] w-full lg:w-auto py-5 lg:py-8 lg:px-[106px] mb-[80px] lg:mb-[150px] lg:hover:bg-[#0A25FF]/80 bg-[#0A25FF]"><span className="text-[#FBFBFC] font-medium text-[18px] leading-[21px] lg:text-[60px] lg:leading-[124px] lg:-tracking-[3px] ">Свяжитесь со мной</span></button> */}
<TgModalForm/>
</div></div>



<div className="px-5 lg:px-10 lg:pb-[55px] bg-[#02070D] lg:mb-0"><div className="lg:px-10 lg:pt-10 lg:py-5 flex flex-col lg:flex-row justify-between"><div><span className="block text-white font-semibold text-2xl leading-[30px]">Свяжитесь с нами</span><span className="block text-[#666B71] text-lg leading-[26px] font-normal my-[22px]">Если у вас остались вопросы<br/> или хотите обсудить сотрудничество, <br/>пишите</span><a href="mailto:hello@priceninja.ru" className="block text-white font-normal text-2xl leading-[30px]">hello@priceninja.ru</a></div><div className="mt-10 lg:mt-0 flex flex-col-reverse lg:flex-col justify-between lg:text-right pb-10 lg:pb-0"><span className="block text-white font-semibold text-2xl leading-[30px] mt-10 lg:mt-0">2023-2025</span><div className="flex flex-col"><a href="/" className="block text-[#B6BBC1] text-lg leading-[26px] font-normal underline cursor-pointer hover:duration-500 hover:text-white">Мониторинг и управление ценами</a><a href="/parsing" className="block text-[#B6BBC1] text-lg leading-[26px] font-normal underline cursor-pointer hover:duration-500 hover:text-white mt-2">Парсинг</a><a href="/pers" className="block text-[#666B71] text-lg leading-[26px] font-normal underline cursor-pointer hover:duration-500 hover:text-white mt-10 lg:mt-2">Политика конфиденциальности</a><a href="/oferta" className="block text-[#666B71] text-lg leading-[26px] font-normal underline cursor-pointer hover:duration-500 hover:text-white mt-2">Договор оферта</a></div></div></div></div>
<div className="hidden lg:block"></div>
<div className="lg:hidden"></div>
<div data-headlessui-state=""><button id="headlessui-popover-button-:Rdu:" aria-expanded="false" data-headlessui-state="" className="fixed bottom-4 right-4 z-[999] bg-red rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer focus:outline-none" type="button"><svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.589844" width="48" height="48" rx="24" fill="url(#paint0_linear_6899_29439)"></rect><path d="M13.6367 27.6296C13.6367 29.7006 15.3157 31.3796 17.3867 31.3796H21.3632V28.3796H17.3867C16.9725 28.3796 16.6367 28.0438 16.6367 27.6296V18.6438C16.6367 18.2296 16.9725 17.8938 17.3867 17.8938H31.7927C32.2069 17.8938 32.5427 18.2296 32.5427 18.6438V27.6296C32.5427 28.0438 32.2069 28.3796 31.7927 28.3796H26.0461L21.3632 32.3191V33.3679V36.1062L27.2289 31.3796H31.7927C33.8638 31.3796 35.5427 29.7006 35.5427 27.6296V18.6438C35.5427 16.5728 33.8638 14.8938 31.7927 14.8938H17.3867C15.3157 14.8938 13.6367 16.5728 13.6367 18.6438V27.6296Z" fill="white"></path><defs><linearGradient id="paint0_linear_6899_29439" x1="0.589844" y1="0" x2="55.2324" y2="57.2964" gradientUnits="userSpaceOnUse"><stop stopColor="#00E691"></stop><stop offset="1" stopColor="#0145FF"></stop></linearGradient></defs></svg></button></div>


     </div>
);
}
