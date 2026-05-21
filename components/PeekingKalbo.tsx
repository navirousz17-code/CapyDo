'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const MESSAGES = [
  "tangna lods move on k nlang",
  "Atecco gumalaw tayo kasi wala tayong generational wealth 😭",
  "Mama Mary... mukhang cram season nanaman po 😭🙏",
  "hoy panget !!",
  "ate dei UwuU",
  "ulo koh parang buko",
  "ang bait naman ng ate ko hehe",
  "ate crush mo ba raw si sigben",
  "naunsamani dong",
  "teh hindi counted as work yung paglipat-lipat ng music 😭",
  "sanaalls baliw",
  "lods linga",
  "hoy panget ako",
  "Nasa productivity app ka pero bakit walang productivity 😭",
  "ahahhahahahahah",
  "Mama Mary... sana kayanin ng kape tong lifestyle natin 😭🙏",
  "zanaalls mapanghe ate",
  "bhwaahahahha",
  "hindi m pa rin nagagawa yang task mo? panahon pa ng kupong-kupong",
  "Lods parang awa mo na tapusin mo kahit isa 😭",
  "ate pakiss",
  "Beh naka-ilang 'mamaya na' ka na today 😭",
  "i miss you",
  "Lods kung ikaw si mama mary pwede pakiss si kuya ivan",
  "elkyard and linga suntukan blue comment",
  "ako zack kamuka ko si bato",
  "Beh baka gusto mo mag-lock in kahit 15 minutes lang 😭",
  "Mama Mary nadapa pagbaba blue comment",
  "ang bait mo te para kang si mama mary",
  "Mama Mary please bless this procrastinator 🙏😭",
  "Atecco focus tayo kasi hindi tayo anak ng milyonaryo 😭",
];

export default function PeekingKalbo() {
  const [peeking, setPeeking] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wiggle, setWiggle] = useState(false);
 
  useEffect(() => {
    setMounted(true);
 
    const showFirst = setTimeout(() => peek(), 4000);
    const interval = setInterval(() => peek(), Math.random() * 25000 + 20000);
 
    return () => {
      clearTimeout(showFirst);
      clearInterval(interval);
    };
  }, []);
 
  const peek = () => {
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(randomMsg);
    setPeeking(true);
    setShowMessage(false);
    setWiggle(false);
 
    setTimeout(() => {
      setShowMessage(true);
      setWiggle(true);
      setTimeout(() => setWiggle(false), 600);
    }, 500);
 
    setTimeout(() => {
      setShowMessage(false);
      setTimeout(() => setPeeking(false), 500);
    }, 5500);
  };
 
  if (!mounted) return null;
 
  return (
    <>
      {/* Inject keyframes */}
      <style>{`
        @keyframes kalbo-wiggle {
          0%, 100% { transform: translateX(-70px) rotate(0deg); }
          25% { transform: translateX(-70px) rotate(-6deg); }
          75% { transform: translateX(-70px) rotate(6deg); }
        }
        @keyframes kalbo-peek-in {
          0% { transform: translateX(220px); }
          60% { transform: translateX(-90px); }
          80% { transform: translateX(-60px); }
          100% { transform: translateX(-70px); }
        }
        @keyframes kalbo-peek-out {
          0% { transform: translateX(-70px); }
          100% { transform: translateX(220px); }
        }
        @keyframes bubble-pop {
          0% { transform: scale(0) translateY(10px); opacity: 0; }
          60% { transform: scale(1.1) translateY(-3px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes bubble-hide {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        .kalbo-peek-in { animation: kalbo-peek-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .kalbo-peek-out { animation: kalbo-peek-out 0.5s ease-in forwards; }
        .kalbo-wiggle { animation: kalbo-wiggle 0.5s ease-in-out; }
        .bubble-pop { animation: bubble-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .bubble-hide { animation: bubble-hide 0.3s ease-in forwards; }
      `}</style>
 
      <div
        className="fixed z-50 flex flex-col items-end"
        style={{ bottom: '80px', right: 0 }}
      >
        {/* Message bubble */}
        {showMessage && (
          <div
            className="bubble-pop mb-3"
            style={{
              marginRight: '150px',
              background: 'white',
              border: '2.5px solid #d9b98f',
              borderRadius: '18px 18px 4px 18px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#5c4022',
              fontFamily: 'Nunito, sans-serif',
              maxWidth: '260px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              lineHeight: '1.6',
              position: 'relative',
            }}
          >
            {message}
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '16px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '0px solid transparent',
              borderTop: '10px solid #d9b98f',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-7px',
              right: '18px',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '0px solid transparent',
              borderTop: '8px solid white',
            }} />
          </div>
        )}
 
        {/* Kalbo face */}
        <div
          className={`cursor-pointer ${peeking ? (wiggle ? 'kalbo-wiggle' : 'kalbo-peek-in') : 'kalbo-peek-out'}`}
          onClick={peek}
          style={{ transform: peeking ? 'translateX(-70px)' : 'translateX(220px)' }}
        >
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '6px solid #d9b98f',
              boxShadow: '-10px 10px 40px rgba(0,0,0,0.35)',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <Image
              src="/kalbo.png"
              alt="Kalbo peeking"
              width={200}
              height={200}
              className="w-full h-full object-cover"
              style={{
                objectPosition: '40% 40%',
                transform: 'scale(1.0)',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
 