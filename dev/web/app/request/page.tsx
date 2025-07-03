"use client";
import { useState } from "react";
export default function Request() {
  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');
  const handleSubmit= async(e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const r = await fetch("/api/request",{method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({title,desc})});
    const {meetUrl}= await r.json();
    window.location.href=`/join?u=${encodeURIComponent(meetUrl)}`;
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-lg p-4 md:p-6 bg-white rounded-lg shadow-md">
  <label className="block text-ink font-medium mb-2">Title</label>
  <input
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
  />
  <label className="block text-ink font-medium mb-2">Description</label>
  <textarea
    required
    rows={5}
    value={desc}
    onChange={(e) => setDesc(e.target.value)}
    className="w-full border border-gray-300 rounded-md p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-sky-500"
  />
  <button
    type="submit"
    className="w-full bg-brand-yellow text-ink font-medium rounded-md px-6 py-3 shadow hover:bg-yellow-400 transition-colors"
  >
    Submit & join room
  </button>
</form>);
}
