// src/components/RandomSunnahSuggestion.js
import React, { useState, useEffect } from 'react';
import './RandomSunnahSuggestion.css';

const RandomSunnahSuggestion = (props) => {
  const [expanded, setExpanded] = useState(false);
  const [currentSunnah, setCurrentSunnah] = useState(null);

  // Collection of 30 Sunnah suggestions with short titles and descriptions (one for each day of Ramadan)
  const sunnahSuggestions = [
    {
      title: "🤲 Pray an Extra Sunnah Prayer",
      description: "Praying voluntary prayers in addition to the obligatory ones increases your rewards. The Prophet (PBUH) regularly observed Sunnah prayers before and after the obligatory prayers. Try adding 2 rakats before Fajr, 4 before Zuhr and 2 after, 2 after Maghrib, and 2 after Isha."
    },
    {
      title: "💧 Perfect Your Wudu",
      description: "The Prophet (PBUH) said: 'Whoever performs wudu perfectly, their sins will come out from their body, even from under their nails.' Take extra care with your wudu today, ensuring water reaches between fingers and toes, and making dua afterward."
    },
    {
      title: "🌙 Wake Up for Tahajjud",
      description: "The Prophet (PBUH) said: 'The best prayer after the obligatory prayers is the night prayer.' Try to wake up before Fajr to pray even just 2 rakats of Tahajjud. This time is especially blessed for supplications and seeking forgiveness."
    },
    {
      title: "📿 Increase Your Dhikr",
      description: "The Prophet (PBUH) said: 'The comparison between one who remembers Allah and one who does not is like the living and the dead.' Try to recite Subhanallah, Alhamdulillah, and Allahu Akbar 33 times each after every prayer today."
    },
    {
      title: "🤝 Reconcile with Someone",
      description: "The Prophet (PBUH) said: 'It is not permissible for a Muslim to forsake his brother for more than three days.' If you have a strained relationship with someone, take the initiative today to reach out and make peace."
    },
    {
      title: "🥄 Eat with Your Right Hand",
      description: "The Prophet (PBUH) said: 'Eat with your right hand and drink with your right hand.' Practice this Sunnah consciously today, and remember to recite Bismillah before eating and Alhamdulillah afterward."
    },
    {
      title: "👨‍👩‍👧‍👦 Visit a Relative",
      description: "The Prophet (PBUH) said: 'Whoever would like his provision to be increased and his lifespan to be extended, let him maintain the ties of kinship.' Call or visit a relative you haven't spoken to in a while."
    },
    {
      title: "😊 Smile at Others",
      description: "The Prophet (PBUH) said: 'Your smile to your brother is charity.' Make a conscious effort to smile at people you interact with today, recognizing it as an act of worship and kindness."
    },
    {
      title: "🍽️ Share Your Food",
      description: "The Prophet (PBUH) encouraged sharing food, saying: 'The food of two people is sufficient for three, and the food of three is sufficient for four.' Invite someone to share a meal with you or give food to someone in need."
    },
    {
      title: "📖 Read Quran with Reflection",
      description: "Set aside time today to read a portion of the Quran with contemplation (tadabbur), focusing on understanding the meaning rather than just recitation. The Prophet (PBUH) encouraged deep reflection on Allah's words."
    },
    {
      title: "🧠 Seek Knowledge",
      description: "The Prophet (PBUH) said: 'Seeking knowledge is an obligation upon every Muslim.' Take time today to learn something new about Islam, whether through reading, listening to a lecture, or attending a class."
    },
    {
      title: "🤲 Make Dua for Others",
      description: "The Prophet (PBUH) said: 'The fastest prayer to be answered is a person's supplication for someone else.' Take time today to make sincere dua for your family, friends, and the ummah."
    },
    {
      title: "🌿 Visit the Sick",
      description: "The Prophet (PBUH) said: 'Whoever visits a sick person remains in the fruits of Paradise until he returns.' Take time today to visit, call, or message someone who is ill, bringing them comfort and making dua for their recovery."
    },
    {
      title: "🥛 Break Your Fast with Dates",
      description: "The Prophet (PBUH) used to break his fast with fresh dates before offering Maghrib prayer. If dates are not available, he would break it with water. Follow this Sunnah today and experience the immediate energy boost from natural sugars."
    },
    {
      title: "🧠 Memorize a New Dua",
      description: "The Prophet (PBUH) had specific supplications for different situations. Learn a new dua today, such as the one for entering or leaving the home, traveling, or seeking protection from hardship."
    },
    {
      title: "🧵 Dress Well and Modestly",
      description: "The Prophet (PBUH) encouraged dressing well, especially for prayer and public gatherings. He said: 'Allah is beautiful and loves beauty.' Pay special attention to your appearance today while maintaining modesty."
    },
    {
      title: "🛌 Sleep on Your Right Side",
      description: "The Prophet (PBUH) recommended sleeping on your right side, saying: 'When you go to bed, perform ablution as you do for prayer, then lie down on your right side.' Try implementing this Sunnah tonight."
    },
    {
      title: "🙏 Pray in Congregation",
      description: "The Prophet (PBUH) said: 'Prayer in congregation is 27 times better than prayer offered individually.' Make an extra effort today to pray at least one of your prayers in congregation at the masjid."
    },
    {
      title: "💰 Give Extra Charity",
      description: "The Prophet (PBUH) was most generous during Ramadan. Increase your charity today, even if it's something small. Remember, 'The most beloved deeds to Allah are those done regularly, even if they are small.'"
    },
    {
      title: "🤫 Guard Your Tongue",
      description: "The Prophet (PBUH) said: 'Whoever believes in Allah and the Last Day should speak good or remain silent.' Be extra mindful today about what you say, avoiding backbiting, lying, and useless talk."
    },
    {
      title: "🧘 Practice Patience",
      description: "The Prophet (PBUH) said: 'Patience is illumination.' When faced with challenges today, take a deep breath, say 'Alhamdulillah,' and respond with patience rather than anger or frustration."
    },
    {
      title: "📱 Limit Digital Distractions",
      description: "While not directly a Sunnah, reducing distractions helps focus on worship. The Prophet (PBUH) valued focus and presence. Set aside your phone during worship and family time today."
    },
    {
      title: "🔄 Say Istighfar 100 Times",
      description: "The Prophet (PBUH) said: 'I seek forgiveness from Allah 100 times a day.' Try to incorporate regular istighfar (seeking forgiveness) throughout your day, aiming for at least 100 times."
    },
    {
      title: "🕌 Perform I'tikaf",
      description: "The Prophet (PBUH) used to perform I'tikaf (spiritual retreat in the mosque) during the last ten days of Ramadan. Even if you can't stay overnight, spend extra time in the mosque today in remembrance of Allah."
    },
    {
      title: "🌛 Look for Laylatul Qadr",
      description: "The Prophet (PBUH) said to look for Laylatul Qadr (the Night of Power) in the odd nights of the last ten days of Ramadan. Increase your worship tonight, especially if it's an odd-numbered night."
    },
    {
      title: "🤔 Reflect on Creation",
      description: "The Quran encourages pondering over Allah's creation. Spend some time today observing nature, the sky, or anything around you, reflecting on the greatness of the Creator and expressing gratitude."
    },
    {
      title: "📿 Recite Ayatul Kursi",
      description: "The Prophet (PBUH) said that Ayatul Kursi (2:255) is the greatest verse in the Quran. Recite it after each prayer today and before sleeping for protection and blessings."
    },
    {
      title: "🫴 Feed a Fasting Person",
      description: "The Prophet (PBUH) said: 'Whoever feeds a fasting person will receive the same reward as the one who fasted, without decreasing the faster's reward.' Invite someone for iftar or contribute to a community iftar today."
    },
    {
      title: "🥣 Delay Suhoor",
      description: "The Prophet (PBUH) recommended delaying the pre-dawn meal (suhoor) as close as possible to the time of Fajr. He said: 'There is blessing in suhoor, so do not leave it.' Eat suhoor as late as possible tomorrow."
    },
    {
      title: "🤚 Send Salawat on the Prophet",
      description: "The Prophet (PBUH) said: 'Whoever sends blessings upon me once, Allah will send blessings upon him tenfold.' Make a conscious effort to increase your salawat (prayers upon the Prophet) today."
    },
    {
      title: "⚖️ Be Just in Your Dealings",
      description: "The Prophet (PBUH) emphasized fairness and justice. He said: 'Beware of injustice, for injustice will turn into darkness on the Day of Resurrection.' Ensure all your transactions and interactions today are honest and fair."
    }
  ];

  // Get the current Ramadan day from props or use a default value
  const { currentRamadanDay = 1 } = props;
  
  // Select a Sunnah based on the Ramadan day (ensuring one per day)
  useEffect(() => {
    // Use modulo to handle if we have fewer suggestions than days
    const index = (currentRamadanDay - 1) % sunnahSuggestions.length;
    
    // Get today's Sunnah based on the day of Ramadan
    setCurrentSunnah(sunnahSuggestions[index]);
    
    // Reset expanded state when suggestion changes
    setExpanded(false);
  }, [currentRamadanDay]);

  // Handle the click to expand/collapse
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (!currentSunnah) return null;

  return (
    <div className="suggested-sunnah">
      <p className="sunnah-header">Suggested Sunnah of the day</p>
      <div 
        className={`sunnah-container ${expanded ? 'expanded' : ''}`}
        onClick={toggleExpanded}
      >
        <p className="sunnah-title">{currentSunnah.title}</p>
        
        {expanded && (
          <div className="sunnah-description">
            {currentSunnah.description}
          </div>
        )}
        
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>
    </div>
  );
};

export default RandomSunnahSuggestion;