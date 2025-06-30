"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

function JoinContent() {
  const params = useSearchParams();
  const url = params.get('u')!;
  const [sec,setSec]=useState(3);
  useEffect(()=>{
    const t=setInterval(()=>setSec(s=>s-1),1000);
    if(sec===0){window.location.href=url;}
    return ()=>clearInterval(t);
  },[sec, url]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-lg py-xl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-xl md:p-xl flex flex-col items-center">
        <p className="text-2xl md:text-3xl font-bold text-ink mb-lg text-center">Creating your room… <span className="text-brand-yellow text-4xl md:text-5xl font-extrabold align-middle">{sec}</span></p>
        <a href={url} className="mt-md inline-block bg-sky-500 text-white font-bold rounded-2xl px-lg py-md shadow-lg hover:bg-sky-600 hover:shadow-xl transition-all duration-200 text-xl">Click if not redirected</a>
      </div>
    </div>
  );
}

export default function Join() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-lg py-xl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-xl md:p-xl flex flex-col items-center">
          <p className="text-2xl md:text-3xl font-bold text-ink mb-lg text-center">Loading...</p>
        </div>
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
