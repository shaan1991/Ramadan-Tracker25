import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, calculatePrayerStreakFromData } from '../services/streakService';
import './Achievements.css';

const Achievements = () => {
  const { user, userData, isWithinRamadan } = useUser();
  const [ramadanBadges, setRamadanBadges] = useState([]);
  const [generalBadges, setGeneralBadges] = useState([]);
  const [ramadanAll, setRamadanAll] = useState([]);
  const [generalAll, setGeneralAll] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('ramadan');
  const [shareStatus, setShareStatus] = useState('');
  const shareText = useMemo(() => (
    'Alhamdulillah — sharing a small win from my daily worship tracker.'
  ), []);

  const buildShareImage = async (badge) => {
    if (!badge) return null;
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1920;
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#fbfaf6');
    gradient.addColorStop(1, '#eef2e8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Soft blobs
    const blob = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(200, 300, 260, 'rgba(76, 175, 80, 0.15)');
    blob(920, 420, 300, 'rgba(17, 17, 17, 0.08)');
    blob(540, 1500, 360, 'rgba(76, 175, 80, 0.12)');

    // Geometric accents
    const drawArc = (x, y, r, start, end, color, width) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(x, y, r, start, end);
      ctx.stroke();
    };
    drawArc(140, 220, 90, Math.PI * 0.1, Math.PI * 0.9, 'rgba(17,17,17,0.12)', 6);
    drawArc(980, 300, 120, Math.PI * 0.2, Math.PI * 1.1, 'rgba(76,175,80,0.18)', 8);
    drawArc(860, 1680, 140, Math.PI * 1.1, Math.PI * 1.9, 'rgba(17,17,17,0.08)', 6);

    // Celebration confetti dots
    const dotColors = ['rgba(76,175,80,0.35)', 'rgba(17,17,17,0.25)', 'rgba(76,175,80,0.2)'];
    for (let i = 0; i < 26; i += 1) {
      const x = 120 + Math.random() * (width - 240);
      const y = 140 + Math.random() * 420;
      const r = 4 + Math.random() * 6;
      ctx.fillStyle = dotColors[i % dotColors.length];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Card
    const cardX = 90;
    const cardY = 380;
    const cardW = width - 180;
    const cardH = 860;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 16;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.stroke();

    // Brand mark
    ctx.fillStyle = '#111';
    ctx.font = '600 34px "Poppins", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☾✧ Ramadan Tracker', width / 2, cardY + 80);

    // Badge ring
    const ringX = width / 2;
    const ringY = cardY + 210;
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(17,17,17,0.12)';
    ctx.beginPath();
    ctx.arc(ringX, ringY, 88, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.font = '88px "Poppins", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(badge.icon || '🏆', ringX, ringY + 28);

    // Title
    ctx.fillStyle = '#111';
    ctx.font = '600 44px "Poppins", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('Achievement Unlocked', width / 2, cardY + 360);

    // Badge name
    ctx.fillStyle = '#111';
    ctx.font = '600 46px "Poppins", "Helvetica Neue", Arial, sans-serif';
    wrapText(ctx, badge.name || 'Achievement', width / 2, cardY + 450, cardW - 140, 56);

    // Description
    ctx.fillStyle = '#555';
    ctx.font = '400 30px "Poppins", "Helvetica Neue", Arial, sans-serif';
    wrapText(ctx, badge.description || '', width / 2, cardY + 590, cardW - 160, 44);

    // Footer strip
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.beginPath();
    ctx.roundRect(cardX + 40, cardY + cardH - 170, cardW - 80, 70, 24);
    ctx.fill();

    const userLabel = user?.displayName ? `by ${user.displayName}` : 'by you';
    ctx.fillStyle = '#333';
    ctx.font = '500 26px "Poppins", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(userLabel, width / 2, cardY + cardH - 122);

    ctx.fillStyle = '#111';
    ctx.font = '600 30px "Poppins", "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), width / 2, cardY + cardH - 70);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) resolve(null);
        resolve({ blob, dataUrl: canvas.toDataURL('image/png') });
      }, 'image/png');
    });
  };

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    const lines = [];
    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line.trim());
        line = `${word} `;
      } else {
        line = testLine;
      }
    });
    lines.push(line.trim());
    lines.slice(0, 3).forEach((ln, idx) => {
      ctx.fillText(ln, x, lineY + idx * lineHeight);
    });
  };

  const shareImage = async (badge) => {
    if (!badge) return;
    setShareStatus('Preparing image...');
    const image = await buildShareImage(badge);
    if (!image) {
      setShareStatus('Unable to generate image.');
      return;
    }

    const file = new File([image.blob], 'achievement.png', { type: 'image/png' });
    const canShare = navigator.canShare && navigator.canShare({ files: [file] });
    if (canShare && navigator.share) {
      try {
        await navigator.share({
          files: [file],
          text: shareText,
          title: badge.name || 'Achievement'
        });
        setShareStatus('Shared successfully.');
        return;
      } catch (error) {
        setShareStatus('Share cancelled.');
      }
    }

    // Fallback: download and open target
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = 'achievement.png';
    link.click();
    setShareStatus('Image downloaded. Share it in your app.');
  };

  useEffect(() => {
    if (!userData || !user?.uid) return;

    const loadAchievements = async () => {
      const parseDateKey = (key) => {
        const [y, m, d] = key.split('-').map(Number);
        return new Date(y, m - 1, d, 12, 0, 0, 0);
      };
      const now = new Date();
      const ramadanLength = userData?.ramadanLength || 30;

      const prayerStreakGeneral = calculatePrayerStreakFromData(userData, { ramadanOnly: false, baseDate: now });
      const prayerStreakRamadan = calculatePrayerStreakFromData(userData, { ramadanOnly: true, baseDate: now });

      await calculateStreak(user.uid, 'fasting', { ramadanOnly: false, baseDate: now });
      await calculateStreak(user.uid, 'fasting', { ramadanOnly: true, baseDate: now });
      await calculateStreak(user.uid, 'taraweeh', { ramadanOnly: true, baseDate: now });
      const quranStreakGeneral = await calculateStreak(user.uid, 'quran', { ramadanOnly: false, baseDate: now });
      const quranStreakRamadan = await calculateStreak(user.uid, 'quran', { ramadanOnly: true, baseDate: now });

      const historyEntries = Object.entries(userData.history || {});
      const isRamadanDate = (dateStr) => {
        if (!isWithinRamadan) return false;
        return isWithinRamadan(parseDateKey(dateStr));
      };

      const quranDays = historyEntries.filter(([, entry]) => {
        if (!entry) return false;
        if (entry.juzReadToday !== undefined) return true;
        if (Array.isArray(entry.completedJuzs) && entry.completedJuzs.length > 0) return true;
        if (entry.quran?.completed > 0) return true;
        return false;
      }).length;

      const fastingDaysRamadan = historyEntries.filter(([date, entry]) => isRamadanDate(date) && entry?.fasting).length;
      const fastingDaysGeneral = historyEntries.filter(([date, entry]) => !isRamadanDate(date) && entry?.fasting).length;
      const taraweehDaysRamadan = historyEntries.filter(([date, entry]) => isRamadanDate(date) && (entry?.prayedTaraweeh ?? entry?.taraweeh)).length;

      const sunnahDaysGeneral = historyEntries.filter(([date, entry]) => !isRamadanDate(date) && entry?.sunnahCompleted).length;
      const sunnahDaysRamadan = historyEntries.filter(([date, entry]) => isRamadanDate(date) && entry?.sunnahCompleted).length;

      const totalActiveDays = historyEntries.filter(([, entry]) => {
        if (!entry) return false;
        return Object.keys(entry).some(key => key !== 'day');
      }).length;

      const totalJuzCompleted = Array.isArray(userData.completedJuzs) ? userData.completedJuzs.length : 0;

      const general = [];
      if (totalActiveDays >= 1) {
        general.push({
          id: 'general-first-step',
          name: '🌱 First Step',
          description: 'Logged your first day',
          icon: '🌱',
          unlocked: true
        });
      }
      if (prayerStreakGeneral.current >= 7) {
        general.push({
          id: 'general-prayer-7',
          name: '🙌 7-Day Prayer Streak',
          description: 'Consistent prayers for a week',
          icon: '🙌',
          unlocked: true
        });
      }
      if (prayerStreakGeneral.current >= 30) {
        general.push({
          id: 'general-prayer-30',
          name: '✨ 30-Day Prayer Streak',
          description: 'Prayed consistently for 30 days',
          icon: '✨',
          unlocked: true
        });
      }
      if (quranStreakGeneral.current >= 7) {
        general.push({
          id: 'general-quran-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days straight',
          icon: '📗',
          unlocked: true
        });
      }
      if (quranDays >= 10) {
        general.push({
          id: 'general-quran-10',
          name: '📖 10 Qur\'an Days',
          description: 'Read Qur\'an on 10 different days',
          icon: '📖',
          unlocked: true
        });
      }
      if (sunnahDaysGeneral >= 5) {
        general.push({
          id: 'general-sunnah-5',
          name: '🌿 Sunnah Routine',
          description: 'Completed 5 Sunnahs on different days',
          icon: '🌿',
          unlocked: true
        });
      }
      if (sunnahDaysGeneral >= 10) {
        general.push({
          id: 'general-sunnah-10',
          name: '✨ Sunnah Consistency',
          description: 'Completed 10 Sunnahs on different days',
          icon: '✨',
          unlocked: true
        });
      }
      if (sunnahDaysGeneral >= 20) {
        general.push({
          id: 'general-sunnah-20',
          name: '🌟 Sunnah Momentum',
          description: 'Completed 20 Sunnahs on different days',
          icon: '🌟',
          unlocked: true
        });
      }
      if (fastingDaysGeneral >= 3) {
        general.push({
          id: 'general-fasting-3',
          name: '🥗 Voluntary Fasts',
          description: 'Fasted 3 non‑Ramadan days',
          icon: '🥗',
          unlocked: true
        });
      }

      const ramadan = [];
      if (prayerStreakRamadan.current >= 7) {
        ramadan.push({
          id: 'ramadan-prayer-7',
          name: '🕌 7 Ramadan Prayers',
          description: 'Seven days of complete prayers',
          icon: '🕌',
          unlocked: true
        });
      }
      if (prayerStreakRamadan.current >= 14) {
        ramadan.push({
          id: 'ramadan-prayer-14',
          name: '🌙 14 Ramadan Prayers',
          description: 'Two weeks of complete prayers',
          icon: '🌙',
          unlocked: true
        });
      }
      if (prayerStreakRamadan.current >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-prayer-full',
          name: '✨ Full Ramadan Prayers',
          description: `Complete prayers for all ${ramadanLength} days`,
          icon: '✨',
          unlocked: true
        });
      }
      if (fastingDaysRamadan >= 10) {
        ramadan.push({
          id: 'ramadan-fasting-10',
          name: '🌙 10-Day Faster',
          description: '10 days of fasting',
          icon: '🌙',
          unlocked: true
        });
      }
      if (fastingDaysRamadan >= 20) {
        ramadan.push({
          id: 'ramadan-fasting-20',
          name: '⭐ 20-Day Faster',
          description: '20 days of fasting',
          icon: '⭐',
          unlocked: true
        });
      }
      if (fastingDaysRamadan >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-fasting-full',
          name: '🏁 Full Ramadan Fast',
          description: `Fasted all ${ramadanLength} days`,
          icon: '🏁',
          unlocked: true
        });
      }
      if (taraweehDaysRamadan >= 10) {
        ramadan.push({
          id: 'ramadan-taraweeh-10',
          name: '🕯️ 10 Taraweeh Nights',
          description: 'Prayed Taraweeh 10 nights',
          icon: '🕯️',
          unlocked: true
        });
      }
      if (taraweehDaysRamadan >= 20) {
        ramadan.push({
          id: 'ramadan-taraweeh-20',
          name: '🕌 20 Taraweeh Nights',
          description: 'Prayed Taraweeh 20 nights',
          icon: '🕌',
          unlocked: true
        });
      }
      if (taraweehDaysRamadan >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-taraweeh-full',
          name: '🌙 Full Taraweeh',
          description: `Prayed Taraweeh all ${ramadanLength} nights`,
          icon: '🌙',
          unlocked: true
        });
      }
      if (quranStreakRamadan.current >= 7) {
        ramadan.push({
          id: 'ramadan-quran-streak-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days in Ramadan',
          icon: '📗',
          unlocked: true
        });
      }
      if (totalJuzCompleted >= 10) {
        ramadan.push({
          id: 'ramadan-quran-10',
          name: '📖 10 Juz Reader',
          description: 'Read 10 Juz in Ramadan',
          icon: '📖',
          unlocked: true
        });
      }
      if (totalJuzCompleted >= 30) {
        ramadan.push({
          id: 'ramadan-quran-30',
          name: '📚 Qur\'an Master',
          description: 'Completed the Qur\'an',
          icon: '📚',
          unlocked: true
        });
      }
      if (sunnahDaysRamadan >= 10) {
        ramadan.push({
          id: 'ramadan-sunnah-10',
          name: '🌿 Sunnah Routine',
          description: 'Completed Sunnah 10 days',
          icon: '🌿',
          unlocked: true
        });
      }
      if (sunnahDaysRamadan >= 15) {
        ramadan.push({
          id: 'ramadan-sunnah-15',
          name: '✨ Sunnah Steady',
          description: 'Completed Sunnah 15 days',
          icon: '✨',
          unlocked: true
        });
      }
      if (sunnahDaysRamadan >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-sunnah-full',
          name: '🌙 Full Sunnah Ramadan',
          description: `Completed Sunnah all ${ramadanLength} days`,
          icon: '🌙',
          unlocked: true
        });
      }

      const makeProgress = (current, target) => `${Math.min(current, target)}/${target}`;

      const generalDefinitions = [
        {
          id: 'general-first-step',
          name: '🌱 First Step',
          description: 'Logged your first day',
          icon: '🌱',
          unlocked: totalActiveDays >= 1,
          progressText: makeProgress(totalActiveDays, 1)
        },
        {
          id: 'general-prayer-7',
          name: '🙌 7-Day Prayer Streak',
          description: 'Consistent prayers for a week',
          icon: '🙌',
          unlocked: prayerStreakGeneral.current >= 7,
          progressText: makeProgress(prayerStreakGeneral.current, 7)
        },
        {
          id: 'general-prayer-30',
          name: '✨ 30-Day Prayer Streak',
          description: 'Prayed consistently for 30 days',
          icon: '✨',
          unlocked: prayerStreakGeneral.current >= 30,
          progressText: makeProgress(prayerStreakGeneral.current, 30)
        },
        {
          id: 'general-quran-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days straight',
          icon: '📗',
          unlocked: quranStreakGeneral.current >= 7,
          progressText: makeProgress(quranStreakGeneral.current, 7)
        },
        {
          id: 'general-quran-10',
          name: '📖 10 Qur\'an Days',
          description: 'Read Qur\'an on 10 different days',
          icon: '📖',
          unlocked: quranDays >= 10,
          progressText: makeProgress(quranDays, 10)
        },
        {
          id: 'general-sunnah-5',
          name: '🌿 Sunnah Routine',
          description: 'Completed 5 Sunnahs on different days',
          icon: '🌿',
          unlocked: sunnahDaysGeneral >= 5,
          progressText: makeProgress(sunnahDaysGeneral, 5)
        },
        {
          id: 'general-sunnah-10',
          name: '✨ Sunnah Consistency',
          description: 'Completed 10 Sunnahs on different days',
          icon: '✨',
          unlocked: sunnahDaysGeneral >= 10,
          progressText: makeProgress(sunnahDaysGeneral, 10)
        },
        {
          id: 'general-sunnah-20',
          name: '🌟 Sunnah Momentum',
          description: 'Completed 20 Sunnahs on different days',
          icon: '🌟',
          unlocked: sunnahDaysGeneral >= 20,
          progressText: makeProgress(sunnahDaysGeneral, 20)
        },
        {
          id: 'general-fasting-3',
          name: '🥗 Voluntary Fasts',
          description: 'Fasted 3 non‑Ramadan days',
          icon: '🥗',
          unlocked: fastingDaysGeneral >= 3,
          progressText: makeProgress(fastingDaysGeneral, 3)
        }
      ];

      const ramadanDefinitions = [
        {
          id: 'ramadan-prayer-7',
          name: '🕌 7 Ramadan Prayers',
          description: 'Seven days of complete prayers',
          icon: '🕌',
          unlocked: prayerStreakRamadan.current >= 7,
          progressText: makeProgress(prayerStreakRamadan.current, 7)
        },
        {
          id: 'ramadan-prayer-14',
          name: '🌙 14 Ramadan Prayers',
          description: 'Two weeks of complete prayers',
          icon: '🌙',
          unlocked: prayerStreakRamadan.current >= 14,
          progressText: makeProgress(prayerStreakRamadan.current, 14)
        },
        {
          id: 'ramadan-prayer-full',
          name: '✨ Full Ramadan Prayers',
          description: `Complete prayers for all ${ramadanLength} days`,
          icon: '✨',
          unlocked: prayerStreakRamadan.current >= ramadanLength,
          progressText: makeProgress(prayerStreakRamadan.current, ramadanLength)
        },
        {
          id: 'ramadan-fasting-10',
          name: '🌙 10-Day Faster',
          description: '10 days of fasting',
          icon: '🌙',
          unlocked: fastingDaysRamadan >= 10,
          progressText: makeProgress(fastingDaysRamadan, 10)
        },
        {
          id: 'ramadan-fasting-20',
          name: '⭐ 20-Day Faster',
          description: '20 days of fasting',
          icon: '⭐',
          unlocked: fastingDaysRamadan >= 20,
          progressText: makeProgress(fastingDaysRamadan, 20)
        },
        {
          id: 'ramadan-fasting-full',
          name: '🏁 Full Ramadan Fast',
          description: `Fasted all ${ramadanLength} days`,
          icon: '🏁',
          unlocked: fastingDaysRamadan >= ramadanLength,
          progressText: makeProgress(fastingDaysRamadan, ramadanLength)
        },
        {
          id: 'ramadan-taraweeh-10',
          name: '🕯️ 10 Taraweeh Nights',
          description: 'Prayed Taraweeh 10 nights',
          icon: '🕯️',
          unlocked: taraweehDaysRamadan >= 10,
          progressText: makeProgress(taraweehDaysRamadan, 10)
        },
        {
          id: 'ramadan-taraweeh-20',
          name: '🕌 20 Taraweeh Nights',
          description: 'Prayed Taraweeh 20 nights',
          icon: '🕌',
          unlocked: taraweehDaysRamadan >= 20,
          progressText: makeProgress(taraweehDaysRamadan, 20)
        },
        {
          id: 'ramadan-taraweeh-full',
          name: '🌙 Full Taraweeh',
          description: `Prayed Taraweeh all ${ramadanLength} nights`,
          icon: '🌙',
          unlocked: taraweehDaysRamadan >= ramadanLength,
          progressText: makeProgress(taraweehDaysRamadan, ramadanLength)
        },
        {
          id: 'ramadan-quran-streak-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days in Ramadan',
          icon: '📗',
          unlocked: quranStreakRamadan.current >= 7,
          progressText: makeProgress(quranStreakRamadan.current, 7)
        },
        {
          id: 'ramadan-quran-10',
          name: '📖 10 Juz Reader',
          description: 'Read 10 Juz in Ramadan',
          icon: '📖',
          unlocked: totalJuzCompleted >= 10,
          progressText: makeProgress(totalJuzCompleted, 10)
        },
        {
          id: 'ramadan-quran-30',
          name: '📚 Qur\'an Master',
          description: 'Completed the Qur\'an',
          icon: '📚',
          unlocked: totalJuzCompleted >= 30,
          progressText: makeProgress(totalJuzCompleted, 30)
        },
        {
          id: 'ramadan-sunnah-10',
          name: '🌿 Sunnah Routine',
          description: 'Completed Sunnah 10 days',
          icon: '🌿',
          unlocked: sunnahDaysRamadan >= 10,
          progressText: makeProgress(sunnahDaysRamadan, 10)
        },
        {
          id: 'ramadan-sunnah-15',
          name: '✨ Sunnah Steady',
          description: 'Completed Sunnah 15 days',
          icon: '✨',
          unlocked: sunnahDaysRamadan >= 15,
          progressText: makeProgress(sunnahDaysRamadan, 15)
        },
        {
          id: 'ramadan-sunnah-full',
          name: '🌙 Full Sunnah Ramadan',
          description: `Completed Sunnah all ${ramadanLength} days`,
          icon: '🌙',
          unlocked: sunnahDaysRamadan >= ramadanLength,
          progressText: makeProgress(sunnahDaysRamadan, ramadanLength)
        }
      ];

      const sortByUnlocked = (a, b) => {
        if (a.unlocked === b.unlocked) return 0;
        return a.unlocked ? -1 : 1;
      };

      const sortedGeneral = [...generalDefinitions].sort(sortByUnlocked);
      const sortedRamadan = [...ramadanDefinitions].sort(sortByUnlocked);

      setGeneralAll(sortedGeneral);
      setRamadanAll(sortedRamadan);
      setGeneralBadges(sortedGeneral.filter((badge) => badge.unlocked));
      setRamadanBadges(sortedRamadan.filter((badge) => badge.unlocked));
    };

    loadAchievements();
  }, [user, userData, isWithinRamadan]);

  if (!userData) {
    return null;
  }

  const hasBadges = ramadanBadges.length > 0 || generalBadges.length > 0;

  if (!hasBadges) {
    return (
      <div className="achievements-container">
        <h3>🏆 Achievements</h3>
        <p className="no-achievements">Keep going! Achievements will unlock as you progress.</p>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h3>🏆 Achievements</h3>
        <button className="achievements-viewall" onClick={() => setShowAll(true)}>
          View all
        </button>
      </div>

      <div className="achievements-section">
        <div className="achievements-section-title">Ramadan Highlights</div>
        {ramadanBadges.length === 0 ? (
          <p className="achievements-section-note">No Ramadan achievements yet.</p>
        ) : (
          <>
            <div className="badges-carousel">
              {ramadanBadges.map(badge => (
                <div
                  key={badge.id}
                  className="badge-item unlocked carousel-card"
                  onClick={() => shareImage(badge)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-info">
                    <p className="badge-name">{badge.name}</p>
                    <p className="badge-desc">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="achievements-share-hint">Tap a badge to share</div>
          </>
        )}
      </div>

      <div className="achievements-section">
        <div className="achievements-section-title">Everyday Achievements</div>
        {generalBadges.length === 0 ? (
          <p className="achievements-section-note">No everyday achievements yet.</p>
        ) : (
          <>
            <div className="badges-carousel">
              {generalBadges.map(badge => (
                <div
                  key={badge.id}
                  className="badge-item unlocked carousel-card"
                  onClick={() => shareImage(badge)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-info">
                    <p className="badge-name">{badge.name}</p>
                    <p className="badge-desc">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="achievements-share-hint">Tap a badge to share</div>
          </>
        )}
      </div>

      {showAll && (
        <div
          className={`achievements-modal-overlay ${isClosing ? 'closing' : ''}`}
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setShowAll(false);
              setIsClosing(false);
              setShareStatus('');
            }, 180);
          }}
        >
          <div
            className={`achievements-modal ${isClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="achievements-modal-header">
              <h4>All Achievements</h4>
              <button
                className="achievements-modal-close"
                onClick={() => {
                  setIsClosing(true);
                  setTimeout(() => {
                  setShowAll(false);
                  setIsClosing(false);
                  setShareStatus('');
                }, 180);
              }}
            >
              ✕
            </button>
            </div>
            <div className="achievements-modal-tabs">
              <button
                className={`achievements-tab ${activeTab === 'ramadan' ? 'active' : ''}`}
                onClick={() => setActiveTab('ramadan')}
              >
                Ramadan
              </button>
              <button
                className={`achievements-tab ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                Everyday
              </button>
            </div>
            <div className="achievements-modal-content">
              {activeTab === 'ramadan' ? (
                ramadanAll.length === 0 ? (
                  <p className="achievements-section-note">No Ramadan achievements yet.</p>
                ) : (
                  <div className="badges-grid">
                    {ramadanAll.map(badge => (
                      <div
                        key={badge.id}
                        className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}
                        onClick={() => badge.unlocked && shareImage(badge)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-info">
                          <p className="badge-name">{badge.name}</p>
                          <p className="badge-desc">{badge.description}</p>
                          {badge.progressText && (
                            <p className="badge-progress">Progress: {badge.progressText}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                generalAll.length === 0 ? (
                  <p className="achievements-section-note">No everyday achievements yet.</p>
                ) : (
                  <div className="badges-grid">
                    {generalAll.map(badge => (
                      <div
                        key={badge.id}
                        className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}
                        onClick={() => badge.unlocked && shareImage(badge)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-info">
                          <p className="badge-name">{badge.name}</p>
                          <p className="badge-desc">{badge.description}</p>
                          {badge.progressText && (
                            <p className="badge-progress">Progress: {badge.progressText}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
            <div className="share-note">
              {shareStatus || 'Tap any unlocked badge to share it.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
