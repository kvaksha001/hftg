'use client';
import { useState } from 'react';

export default function Home() {
  const [test, setTest] = useState('GAME PAGE WORKS!');
  return <div className="text-white text-4xl p-8">{test}</div>;
}
