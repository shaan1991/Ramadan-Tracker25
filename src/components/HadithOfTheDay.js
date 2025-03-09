// File: src/components/HadithOfTheDay.js
import React, { useState, useEffect } from 'react';
import './HadithOfTheDay.css';

const HadithOfTheDay = () => {
  const [hadith, setHadith] = useState({
    text: '',
    narrator: '',
    source: '',
    loading: true,
    error: false
  });

  // Collection of verified short hadiths with their narrators and sources
  // Collection of verified short hadiths with their narrators and sources
  const hadithCollection = [
    {
      text: "None of you truly believes until he loves for his brother what he loves for himself.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "40 Hadith Nawawi 13"
    },
    {
      text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim"
    },
    {
      text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
      narrator: "Reported by Al-Bukhari",
      source: "Sahih Al-Bukhari"
    },
    {
      text: "A good word is charity.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "Riyad as-Salihin"
    },
    {
      text: "Whoever is not merciful to people, Allah will not be merciful to him.",
      narrator: "Reported by Al-Bukhari",
      source: "Sahih Al-Bukhari 7376"
    },
    {
      text: "The strong person is not the one who overcomes people with his strength, but the one who controls himself while in anger.",
      narrator: "Reported by Al-Bukhari",
      source: "Sahih Al-Bukhari 6114"
    },
    {
      text: "Verily, Allah does not look at your appearance or wealth, but rather He looks at your hearts and your deeds.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim 2564"
    },
    {
      text: "He who is not grateful to people is not grateful to Allah.",
      narrator: "Reported by Abu Dawud and Tirmidhi",
      source: "Sunan Abu Dawud 4811"
    },
    {
      text: "The believer is not bitten from the same hole twice.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "Sahih Al-Bukhari 6133"
    },
    {
      text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.",
      narrator: "Reported by Al-Bukhari",
      source: "Sahih Al-Bukhari 69"
    },
    {
      text: "Whoever believes in Allah and the Last Day should honor his neighbor.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "40 Hadith Nawawi 15"
    },
    {
      text: "The most perfect of believers in faith are those with the best character.",
      narrator: "Reported by Abu Dawud and Tirmidhi",
      source: "Jami at-Tirmidhi 1162"
    },
    {
      text: "Seeking knowledge is an obligation upon every Muslim.",
      narrator: "Reported by Ibn Majah",
      source: "Sunan Ibn Majah 224"
    },
    {
      text: "Smiling in the face of your brother is charity.",
      narrator: "Reported by Tirmidhi",
      source: "Jami at-Tirmidhi 1956"
    },
    {
      text: "The Muslim is the one from whose tongue and hand the people are safe.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "40 Hadith Nawawi 8"
    },
    {
      text: "Actions are judged by intentions, and everyone will get what they intended.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "40 Hadith Nawawi 1"
    },
    {
      text: "Part of someone's being a good Muslim is his leaving alone that which does not concern him.",
      narrator: "Reported by Tirmidhi",
      source: "40 Hadith Nawawi 12"
    },
    {
      text: "Do not become angry, and Paradise is yours.",
      narrator: "Reported by Al-Bukhari",
      source: "Sahih Al-Bukhari 6116"
    },
    {
      text: "Fear Allah wherever you may be, follow up a bad deed with a good deed which will wipe it out, and treat people with good character.",
      narrator: "Reported by Tirmidhi",
      source: "40 Hadith Nawawi 18"
    },
    {
      text: "Charity does not decrease wealth, no one forgives another but that Allah increases his honor, and no one humbles himself for the sake of Allah but that Allah raises his status.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim 2588"
    },
    {
      text: "A Muslim is a brother of another Muslim. He should not oppress him nor should he hand him over to an oppressor. Whoever fulfills the needs of his brother, Allah will fulfill his needs.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "Sahih Al-Bukhari 2442"
    },
    {
      text: "Whoever goes out seeking knowledge, then he is in Allah's cause until he returns.",
      narrator: "Reported by Tirmidhi",
      source: "Jami at-Tirmidhi 2647"
    },
    {
      text: "The best of you are those who are best to their families, and I am the best of you to my family.",
      narrator: "Reported by Tirmidhi",
      source: "Jami at-Tirmidhi 3895"
    },
    {
      text: "One who leads to something good is like the one who does it.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim 1893"
    },
    {
      text: "Whoever relieves a believer's distress of the distressful aspects of this world, Allah will rescue him from a difficulty of the difficulties of the Hereafter.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim 2699"
    },
    {
      text: "Do not be people without minds of your own, saying that if others treat you well you will treat them well, and that if they do wrong you will do wrong. Instead, accustom yourselves to do good if people do good and not to do wrong if they do evil.",
      narrator: "Reported by Tirmidhi",
      source: "Jami at-Tirmidhi 1325"
    },
    {
      text: "Do not look down upon any good deed, even meeting your brother with a cheerful face.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim 2626"
    },
    {
      text: "Remember Allah during times of ease and He will remember you during times of hardship.",
      narrator: "Reported by Ahmad",
      source: "Musnad Ahmad 2803"
    },
    {
      text: "The world is the believer's prison and the disbeliever's paradise.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim 2956"
    },
    // Additional Hadiths:
    {
      text: "The best among you are those who learn the Qur'an and teach it.",
      narrator: "Reported by At-Tirmidhi",
      source: "Jami at-Tirmidhi"
    },
    {
      text: "The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.",
      narrator: "Reported by Muslim",
      source: "Sahih Muslim"
    },
    {
      text: "No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that.",
      narrator: "Reported by Al-Bukhari and Muslim",
      source: "Sahih al-Bukhari / Sahih Muslim"
    },
    {
      text: "Make use of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before you are preoccupied, and your life before your death.",
      narrator: "Attributed to Ibn Abbas",
      source: "Various sources"
    }
  ];
  

  useEffect(() => {
    // Function to get a random hadith
    const getRandomHadith = () => {
      try {
        // Get a random index from the collection
        const randomIndex = Math.floor(Math.random() * hadithCollection.length);
        const selectedHadith = hadithCollection[randomIndex];
        
        setHadith({
          text: selectedHadith.text,
          narrator: selectedHadith.narrator,
          source: selectedHadith.source,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('Error fetching hadith:', error);
        setHadith({
          text: '',
          narrator: '',
          source: '',
          loading: false,
          error: true
        });
      }
    };

    getRandomHadith();
  }, []);

  if (hadith.loading) {
    return (
      <div className="hadith-container">
        <p>Loading Hadith of the day...</p>
      </div>
    );
  }

  if (hadith.error) {
    return (
      <div className="hadith-container">
        <p>Could not load Hadith of the day. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="hadith-container">
      <p className="hadith-title">Hadith of the day</p>
      <p className="hadith-text">"{hadith.text}"</p>
      <p className="hadith-source">{hadith.narrator}</p>
    </div>
  );
};

export default HadithOfTheDay;