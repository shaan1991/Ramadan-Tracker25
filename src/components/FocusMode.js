import React, { useEffect, useMemo, useRef, useState } from 'react';
import './FocusMode.css';

const NAMES_OF_ALLAH = [
  { arabic: 'ٱلرَّحْمَـٰنُ', english: 'Ar-Rahman (The Most Compassionate)' },
  { arabic: 'ٱلرَّحِيمُ', english: 'Ar-Rahim (The Most Merciful)' },
  { arabic: 'ٱلْمَلِكُ', english: 'Al-Malik (The King)' },
  { arabic: 'ٱلْقُدُّوسُ', english: 'Al-Quddus (The Most Holy)' },
  { arabic: 'ٱلسَّلَامُ', english: 'As-Salam (The Source of Peace)' },
  { arabic: 'ٱلْمُؤْمِنُ', english: 'Al-Mumin (The Granter of Security)' },
  { arabic: 'ٱلْمُهَيْمِنُ', english: 'Al-Muhaymin (The Guardian)' },
  { arabic: 'ٱلْعَزِيزُ', english: 'Al-Aziz (The Almighty)' },
  { arabic: 'ٱلْجَبَّارُ', english: 'Al-Jabbar (The Compeller)' },
  { arabic: 'ٱلْمُتَكَبِّرُ', english: 'Al-Mutakabbir (The Supreme)' },
  { arabic: 'ٱلْخَالِقُ', english: 'Al-Khaliq (The Creator)' },
  { arabic: 'ٱلْبَارِئُ', english: 'Al-Bari (The Evolver)' },
  { arabic: 'ٱلْمُصَوِّرُ', english: 'Al-Musawwir (The Fashioner)' },
  { arabic: 'ٱلْغَفَّارُ', english: 'Al-Ghaffar (The Constant Forgiver)' },
  { arabic: 'ٱلْقَهَّارُ', english: 'Al-Qahhar (The Subduer)' },
  { arabic: 'ٱلْوَهَّابُ', english: 'Al-Wahhab (The Bestower)' },
  { arabic: 'ٱلرَّزَّاقُ', english: 'Ar-Razzaq (The Provider)' },
  { arabic: 'ٱلْفَتَّاحُ', english: 'Al-Fattah (The Opener)' },
  { arabic: 'ٱلْعَلِيمُ', english: 'Al-Alim (The All-Knowing)' },
  { arabic: 'ٱلْقَابِضُ', english: 'Al-Qabid (The Withholder)' },
  { arabic: 'ٱلْبَاسِطُ', english: 'Al-Basit (The Expander)' },
  { arabic: 'ٱلْخَافِضُ', english: 'Al-Khafid (The Abaser)' },
  { arabic: 'ٱلرَّافِعُ', english: 'Ar-Rafi (The Exalter)' },
  { arabic: 'ٱلْمُعِزُّ', english: 'Al-Muizz (The Honourer)' },
  { arabic: 'ٱلْمُذِلُّ', english: 'Al-Mudhill (The Humiliator)' },
  { arabic: 'ٱلسَّمِيعُ', english: 'As-Sami (The All-Hearing)' },
  { arabic: 'ٱلْبَصِيرُ', english: 'Al-Basir (The All-Seeing)' },
  { arabic: 'ٱلْحَكَمُ', english: 'Al-Hakam (The Judge)' },
  { arabic: 'ٱلْعَدْلُ', english: 'Al-Adl (The Utterly Just)' },
  { arabic: 'ٱللَّطِيفُ', english: 'Al-Latif (The Most Subtle)' },
  { arabic: 'ٱلْخَبِيرُ', english: 'Al-Khabir (The All-Aware)' },
  { arabic: 'ٱلْحَلِيمُ', english: 'Al-Halim (The Forbearing)' },
  { arabic: 'ٱلْعَظِيمُ', english: 'Al-Azim (The Magnificent)' },
  { arabic: 'ٱلْغَفُورُ', english: 'Al-Ghafur (The Great Forgiver)' },
  { arabic: 'ٱلشَّكُورُ', english: 'Ash-Shakur (The Most Appreciative)' },
  { arabic: 'ٱلْعَلِيُّ', english: 'Al-Aliyy (The Most High)' },
  { arabic: 'ٱلْكَبِيرُ', english: 'Al-Kabir (The Most Great)' },
  { arabic: 'ٱلْحَفِيظُ', english: 'Al-Hafiz (The Preserver)' },
  { arabic: 'ٱلْمُقِيتُ', english: 'Al-Muqit (The Sustainer)' },
  { arabic: 'ٱلْحَسِيبُ', english: 'Al-Hasib (The Reckoner)' },
  { arabic: 'ٱلْجَلِيلُ', english: 'Al-Jalil (The Majestic)' },
  { arabic: 'ٱلْكَرِيمُ', english: 'Al-Karim (The Most Generous)' },
  { arabic: 'ٱلرَّقِيبُ', english: 'Ar-Raqib (The Watchful)' },
  { arabic: 'ٱلْمُجِيبُ', english: 'Al-Mujib (The Responsive)' },
  { arabic: 'ٱلْوَاسِعُ', english: 'Al-Wasi (The All-Encompassing)' },
  { arabic: 'ٱلْحَكِيمُ', english: 'Al-Hakim (The Wise)' },
  { arabic: 'ٱلْوَدُودُ', english: 'Al-Wadud (The Most Loving)' },
  { arabic: 'ٱلْمَجِيدُ', english: 'Al-Majid (The Glorious)' },
  { arabic: 'ٱلْبَاعِثُ', english: 'Al-Baith (The Resurrector)' },
  { arabic: 'ٱلشَّهِيدُ', english: 'Ash-Shahid (The Witness)' },
  { arabic: 'ٱلْحَقُّ', english: 'Al-Haqq (The Truth)' },
  { arabic: 'ٱلْوَكِيلُ', english: 'Al-Wakil (The Trustee)' },
  { arabic: 'ٱلْقَوِيُّ', english: 'Al-Qawiyy (The Most Strong)' },
  { arabic: 'ٱلْمَتِينُ', english: 'Al-Matin (The Firm One)' },
  { arabic: 'ٱلْوَلِيُّ', english: 'Al-Waliyy (The Protecting Friend)' },
  { arabic: 'ٱلْحَمِيدُ', english: 'Al-Hamid (The Praiseworthy)' },
  { arabic: 'ٱلْمُحْصِي', english: 'Al-Muhsi (The All-Enumerating)' },
  { arabic: 'ٱلْمُبْدِئُ', english: 'Al-Mubdi (The Originator)' },
  { arabic: 'ٱلْمُعِيدُ', english: 'Al-Muid (The Restorer)' },
  { arabic: 'ٱلْمُحْيِي', english: 'Al-Muhyi (The Giver of Life)' },
  { arabic: 'ٱلْمُمِيتُ', english: 'Al-Mumit (The Creator of Death)' },
  { arabic: 'ٱلْحَيُّ', english: 'Al-Hayy (The Ever-Living)' },
  { arabic: 'ٱلْقَيُّومُ', english: 'Al-Qayyum (The Self-Subsisting)' },
  { arabic: 'ٱلْوَاجِدُ', english: 'Al-Wajid (The Finder)' },
  { arabic: 'ٱلْمَاجِدُ', english: 'Al-Majid (The Noble)' },
  { arabic: 'ٱلْوَاحِدُ', english: 'Al-Wahid (The One)' },
  { arabic: 'ٱلْأَحَدُ', english: 'Al-Ahad (The Unique)' },
  { arabic: 'ٱلصَّمَدُ', english: 'As-Samad (The Eternal)' },
  { arabic: 'ٱلْقَادِرُ', english: 'Al-Qadir (The Omnipotent)' },
  { arabic: 'ٱلْمُقْتَدِرُ', english: 'Al-Muqtadir (The Determiner)' },
  { arabic: 'ٱلْمُقَدِّمُ', english: 'Al-Muqaddim (The Expediter)' },
  { arabic: 'ٱلْمُؤَخِّرُ', english: 'Al-Muakhkhir (The Delayer)' },
  { arabic: 'ٱلْأَوَّلُ', english: 'Al-Awwal (The First)' },
  { arabic: 'ٱلْآخِرُ', english: 'Al-Akhir (The Last)' },
  { arabic: 'ٱلظَّاهِرُ', english: 'Az-Zahir (The Manifest)' },
  { arabic: 'ٱلْبَاطِنُ', english: 'Al-Batin (The Hidden)' },
  { arabic: 'ٱلْوَالِي', english: 'Al-Wali (The Sole Governor)' },
  { arabic: 'ٱلْمُتَعَالِي', english: 'Al-Mutaali (The Self Exalted)' },
  { arabic: 'ٱلْبَرُّ', english: 'Al-Barr (The Source of Goodness)' },
  { arabic: 'ٱلتَّوَّابُ', english: 'At-Tawwab (The Acceptor of Repentance)' },
  { arabic: 'ٱلْمُنْتَقِمُ', english: 'Al-Muntaqim (The Avenger)' },
  { arabic: 'ٱلْعَفُوُّ', english: 'Al-Afuww (The Pardoner)' },
  { arabic: 'ٱلرَّؤُوفُ', english: 'Ar-Ra’uf (The Most Kind)' },
  { arabic: 'مَالِكُ ٱلْمُلْكُ', english: 'Malik-ul-Mulk (Master of the Kingdom)' },
  { arabic: 'ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ', english: 'Dhul-Jalali wal-Ikram (Lord of Glory and Honour)' },
  { arabic: 'ٱلْمُقْسِطُ', english: 'Al-Muqsit (The Equitable)' },
  { arabic: 'ٱلْجَامِعُ', english: 'Al-Jami (The Gatherer)' },
  { arabic: 'ٱلْغَنِيُّ', english: 'Al-Ghani (The Self-Sufficient)' },
  { arabic: 'ٱلْمُغْنِي', english: 'Al-Mughni (The Enricher)' },
  { arabic: 'ٱلْمَانِعُ', english: 'Al-Mani (The Withholder)' },
  { arabic: 'ٱلضَّارَّ', english: 'Ad-Darr (The Afflictor)' },
  { arabic: 'ٱلنَّافِعُ', english: 'An-Nafi (The Benefactor)' },
  { arabic: 'ٱلنُّورُ', english: 'An-Nur (The Light)' },
  { arabic: 'ٱلْهَادِي', english: 'Al-Hadi (The Guide)' },
  { arabic: 'ٱلْبَدِيعُ', english: 'Al-Badi (The Incomparable Originator)' },
  { arabic: 'ٱلْبَاقِي', english: 'Al-Baqi (The Everlasting)' },
  { arabic: 'ٱلْوَارِثُ', english: 'Al-Warith (The Inheritor)' },
  { arabic: 'ٱلرَّشِيدُ', english: 'Ar-Rashid (The Guide to the Right Path)' },
  { arabic: 'ٱلصَّبُورُ', english: 'As-Sabur (The Patient)' }
];

const DURATIONS = [
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 }
];

const shuffle = (arr) => {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const FocusMode = () => {
  const [duration, setDuration] = useState(300);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [namesQueue, setNamesQueue] = useState(() => shuffle(NAMES_OF_ALLAH));
  const [nameIndex, setNameIndex] = useState(0);
  const [position, setPosition] = useState({ left: 50, top: 50 });
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef(null);
  const rotateRef = useRef(null);

  const progressPercent = useMemo(() => {
    return Math.min(100, Math.max(0, Math.round((elapsed / duration) * 100)));
  }, [elapsed, duration]);

  const activeName = useMemo(() => namesQueue[nameIndex % namesQueue.length], [namesQueue, nameIndex]);

  const randomPosition = () => ({
    left: 38 + Math.random() * 24,
    top: 24 + Math.random() * 52
  });

  const stopTimers = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (rotateRef.current) window.clearInterval(rotateRef.current);
    timerRef.current = null;
    rotateRef.current = null;
  };

  const runTimers = () => {
    stopTimers();
    startRef.current = Date.now() - elapsedRef.current * 1000;

    timerRef.current = window.setInterval(() => {
      const seconds = Math.floor((Date.now() - startRef.current) / 1000);
      elapsedRef.current = seconds;
      setElapsed(seconds);
      if (seconds >= duration) {
        stopTimers();
        setRunning(false);
        setPaused(false);
        setCompleted(true);
        setElapsed(duration);
        elapsedRef.current = duration;
      }
    }, 200);

    rotateRef.current = window.setInterval(() => {
      setNameIndex((prev) => {
        const next = prev + 1;
        if (next > 0 && next % NAMES_OF_ALLAH.length === 0) {
          setNamesQueue(shuffle(NAMES_OF_ALLAH));
          return 0;
        }
        return next;
      });
      setPosition(randomPosition());
    }, 2600);
  };

  const startSession = () => {
    stopTimers();
    setCompleted(false);
    setRunning(true);
    setPaused(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setNameIndex(0);
    setNamesQueue(shuffle(NAMES_OF_ALLAH));
    setPosition(randomPosition());
    runTimers();
  };

  const endSession = () => {
    stopTimers();
    setRunning(false);
    setPaused(false);
    setCompleted(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setNameIndex(0);
    setNamesQueue(shuffle(NAMES_OF_ALLAH));
  };

  const togglePause = () => {
    if (!running) return;
    if (paused) {
      setPaused(false);
      runTimers();
    } else {
      setPaused(true);
      stopTimers();
    }
  };

  useEffect(() => () => stopTimers(), []);

  return (
    <div className="focus-mode-screen">
      {!running && !completed && (
        <div className="focus-start-card">
          <h2>Focus Mode</h2>
          <p>Watch the 99 Names of Allah appear gently, dissolve, and renew your attention.</p>
          <div className="focus-duration-group">
            {DURATIONS.map((item) => (
              <button
                key={item.value}
                className={`focus-duration ${duration === item.value ? 'active' : ''}`}
                onClick={() => setDuration(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button className="focus-start-btn" onClick={startSession}>
            Start Focus
          </button>
        </div>
      )}

      {(running || completed) && (
        <div className="focus-live">
          {running && !paused && activeName && (
            <div
              key={`${activeName.arabic}-${nameIndex}`}
              className="focus-name-item"
              style={{ left: `${position.left}%`, top: `${position.top}%` }}
            >
              <div className="focus-name-arabic">{activeName.arabic}</div>
              <div className="focus-name-english">{activeName.english}</div>
            </div>
          )}

          {completed && (
            <div className="focus-complete-card">
              <h3>Session complete</h3>
              <p>Take a breath and carry this calm into your day.</p>
              <button className="focus-start-btn" onClick={startSession}>
                Restart
              </button>
            </div>
          )}

          <div className="focus-bottom-controls">
            <div className="focus-progress-wrap bottom">
              <div className="focus-progress-label">
                <span>Focus</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="focus-progress-bar">
                <div className="focus-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            {running && (
              <div className="focus-control-row">
                <button className="focus-control-btn" onClick={togglePause}>
                  {paused ? 'Resume' : 'Pause'}
                </button>
                <button className="focus-control-btn outline" onClick={endSession}>
                  End
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
