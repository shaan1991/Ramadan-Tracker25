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
      text: "He who does not thank the people has not thanked Allah.",
      narrator: "Reported by Abu Dawud and Tirmidhi",
      source: "Sunan Abu Dawud 4811"
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