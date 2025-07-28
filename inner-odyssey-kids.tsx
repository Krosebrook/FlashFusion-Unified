import React, { useState, useEffect } from 'react';
import { Star, Heart, Brain, Coins, Book, Users, Award, Trophy, Calendar, Mic, Palette, Camera, Play, Home, User, Settings, ChevronRight, Target, Zap, Crown, Gift } from 'lucide-react';

const InnerOdysseyApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userAge, setUserAge] = useState(7);
  const [userMode, setUserMode] = useState('child'); // 'child' or 'parent'
  const [userProgress, setUserProgress] = useState({
    totalPoints: 1250,
    totalXP: 2840,
    level: 3,
    badges: ['emotion-explorer', 'money-saver', 'kind-heart', 'reading-rookie'],
    completedQuests: 12,
    journalEntries: 5,
    weeklyStreak: 4,
    masteredSkills: ['Sharing & Taking Turns', 'Counting Coins', 'Reading Simple Books'],
    skillProgress: {
      'Reading & Language': { current: 3, total: 6, mastery: 50 },
      'Math Skills': { current: 2, total: 6, mastery: 33 },
      'Science Discovery': { current: 3, total: 6, mastery: 50 },
      'Social Studies': { current: 3, total: 6, mastery: 50 },
      'Communication & Friendship': { current: 3, total: 6, mastery: 50 },
      'Money & Life Skills': { current: 3, total: 6, mastery: 50 }
    }
  });

  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [showModal, setShowModal] = useState(null);
  const [dailyQuestCompleted, setDailyQuestCompleted] = useState(false);
  const [weeklyChallenge, setWeeklyChallenge] = useState({ completed: 2, total: 5 });
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');

  // Breathing exercise effect
  useEffect(() => {
    if (breathingActive) {
      const interval = setInterval(() => {
        setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [breathingActive]);

  const avatars = ['🚀', '🌟', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '👑', '🎨', '📚', '⚽', '🎵', '🔬'];

  const badges = {
    'emotion-explorer': { 
      name: 'Emotion Explorer', 
      emoji: '🌟', 
      description: 'You learned about different feelings!',
      earned: 'June 20, 2025',
      xp: 100
    },
    'money-saver': { 
      name: 'Money Saver', 
      emoji: '💰', 
      description: 'You saved coins in your piggy bank!',
      earned: 'June 15, 2025',
      xp: 150
    },
    'kind-heart': { 
      name: 'Kind Heart', 
      emoji: '❤️', 
      description: 'You shared and helped others!',
      earned: 'June 10, 2025',
      xp: 120
    },
    'reading-rookie': {
      name: 'Reading Rookie',
      emoji: '📖',
      description: 'You completed your first reading challenge!',
      earned: 'June 25, 2025',
      xp: 200
    }
  };

  const weeklyActivities = [
    { day: 'Monday', activity: 'Read 10 minutes', completed: true, xp: 50 },
    { day: 'Tuesday', activity: 'Practice math', completed: true, xp: 50 },
    { day: 'Wednesday', activity: 'Science discovery', completed: false, xp: 50 },
    { day: 'Thursday', activity: 'Creative writing', completed: false, xp: 50 },
    { day: 'Friday', activity: 'Share with friends', completed: false, xp: 50 }
  ];

  const quizzes = {
    'Reading Simple Books': {
      questions: [
        {
          question: "What do you do when you see a word you don't know?",
          options: ["Skip it", "Sound it out", "Give up", "Cry"],
          correct: 1,
          explanation: "Sounding out words helps you learn new ones!"
        },
        {
          question: "Where can you find clues about the story?",
          options: ["Only in words", "In pictures too", "Nowhere", "Only at the end"],
          correct: 1,
          explanation: "Pictures give us great clues about what's happening!"
        }
      ]
    },
    'Counting to 100': {
      questions: [
        {
          question: "What comes after 19?",
          options: ["18", "20", "21", "91"],
          correct: 1,
          explanation: "Great! 20 comes after 19."
        },
        {
          question: "How do you count by 10s?",
          options: ["1,2,3,4...", "10,20,30,40...", "5,10,15,20...", "2,4,6,8..."],
          correct: 1,
          explanation: "Perfect! Counting by 10s: 10, 20, 30, 40..."
        }
      ]
    }
  };

  const completeDailyQuest = () => {
    setDailyQuestCompleted(true);
    const newXP = 50;
    setUserProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + 50,
      totalXP: prev.totalXP + newXP,
      completedQuests: prev.completedQuests + 1
    }));
    setShowModal('questComplete');
  };

  const openSkill = (skillName, isUnlocked) => {
    if (isUnlocked) {
      setCurrentLesson(skillName);
      if (quizzes[skillName]) {
        setShowModal('skillOptions');
      } else {
        setShowModal('skill');
      }
    }
  };

  const startQuiz = (skillName) => {
    setCurrentQuiz({
      skill: skillName,
      questions: quizzes[skillName].questions,
      currentQuestion: 0,
      score: 0,
      answers: []
    });
    setShowModal('quiz');
  };

  const answerQuiz = (answerIndex) => {
    const question = currentQuiz.questions[currentQuiz.currentQuestion];
    const isCorrect = answerIndex === question.correct;
    const newAnswers = [...currentQuiz.answers, { answer: answerIndex, correct: isCorrect }];
    
    if (currentQuiz.currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuiz(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        score: isCorrect ? prev.score + 1 : prev.score,
        answers: newAnswers
      }));
    } else {
      const finalScore = isCorrect ? currentQuiz.score + 1 : currentQuiz.score;
      const xpEarned = finalScore * 25;
      
      setUserProgress(prev => ({
        ...prev,
        totalXP: prev.totalXP + xpEarned,
        totalPoints: prev.totalPoints + (finalScore * 10)
      }));

      setCurrentQuiz(prev => ({
        ...prev,
        score: finalScore,
        answers: newAnswers,
        completed: true
      }));
      setShowModal('quizResults');
    }
  };

  const openBadge = (badgeId) => {
    setShowModal('badge');
    setCurrentLesson(badgeId);
  };

  const skillTree = {
    'Reading & Language': {
      unlocked: ['Reading Simple Books', 'Writing Letters', 'Spelling CVC Words'],
      locked: ['Reading Chapter Books', 'Writing Stories', 'Using Punctuation']
    },
    'Math Skills': {
      unlocked: ['Counting to 100', 'Adding 1-Digit Numbers', 'Recognizing Shapes'],
      locked: ['Adding 2-Digit Numbers', 'Subtraction', 'Telling Time']
    },
    'Science Discovery': {
      unlocked: ['Weather Watching', 'Plant Parts', 'Animal Homes'],
      locked: ['Life Cycles', 'Magnets', 'States of Matter']
    },
    'Social Studies': {
      unlocked: ['Community Helpers', 'Map Skills', 'Following Rules'],
      locked: ['Past & Present', 'Holidays & Traditions', 'Good Citizenship']
    },
    'Communication & Friendship': {
      unlocked: ['Sharing & Taking Turns', 'Using Please & Thank You', 'Listening to Friends'],
      locked: ['Asking for Help', 'Saying Sorry', 'Being a Good Friend']
    },
    'Money & Life Skills': {
      unlocked: ['Counting Coins', 'Pennies vs Nickels', 'What Money Buys'],
      locked: ['Saving for Toys', 'Needs vs Wants', 'Earning Money for Chores']
    }
  };

  const emotions = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-200' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-200' },
    { name: 'Mad', emoji: '😠', color: 'bg-red-200' },
    { name: 'Scared', emoji: '😰', color: 'bg-purple-200' },
    { name: 'Excited', emoji: '🤩', color: 'bg-orange-200' },
    { name: 'Calm', emoji: '😌', color: 'bg-green-200' },
    { name: 'Proud', emoji: '😊', color: 'bg-pink-200' },
    { name: 'Tired', emoji: '😴', color: 'bg-gray-200' }
  ];

  const moneyLessons = {
    6: [
      { title: 'Coin Detective', description: 'Learn to recognize different coins!', completed: true },
      { title: 'Penny Power', description: 'Count pennies and learn their value', completed: false }
    ],
    7: [
      { title: 'Nickel & Dime Game', description: 'Learn about 5¢ and 10¢ coins', completed: true },
      { title: 'Toy Store Math', description: 'Add coins to buy pretend toys', completed: false },
      { title: 'My First Piggy Bank', description: 'Start saving coins for something special', completed: true }
    ],
    8: [
      { title: 'Quarter Master', description: 'Learn about 25¢ and making change', completed: true },
      { title: 'Smart Spending', description: 'Learn when to spend and when to save', completed: false },
      { title: 'Needs vs Wants', description: 'Tell the difference between things you need and want', completed: false }
    ],
    10: [
      { title: 'Allowance Manager', description: 'Budget your weekly allowance', completed: false },
      { title: 'Earning Money', description: 'Learn different ways to earn money', completed: false }
    ],
    12: [
      { title: 'Bank Account Basics', description: 'Learn how banks help save money', completed: false },
      { title: 'Smart Shopping', description: 'Compare prices and make good choices', completed: false }
    ]
  };

  if (userMode === 'parent') {
    return renderParentDashboard();
  }

  const renderHome = () => (
    <div className="p-3 space-y-3 pb-20">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-xl p-3 text-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">Welcome back! 🌟</h1>
          <button 
            onClick={() => setShowModal('avatarSelect')}
            className="text-2xl bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center"
          >
            {selectedAvatar}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-white bg-opacity-20 rounded-full px-2 py-1">
            <span className="text-xs font-semibold">Level {userProgress.level}</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full px-2 py-1 flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span className="text-xs font-semibold">{userProgress.totalXP} XP</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full px-2 py-1">
            <span className="text-xs font-semibold">{userProgress.totalPoints} Points</span>
          </div>
        </div>
      </div>

      {/* Weekly Challenge */}
      <div className="bg-gradient-to-r from-orange-300 to-red-300 rounded-xl p-3">
        <h2 className="text-sm font-bold text-white mb-2 flex items-center">
          <Target className="w-4 h-4 mr-1" />
          Weekly Challenge
        </h2>
        <div className="bg-white rounded-lg p-2">
          <h3 className="font-semibold text-gray-800 text-xs">Learning Champion</h3>
          <p className="text-gray-600 text-xs">Complete 5 learning activities this week</p>
          <div className="mt-1 mb-2 bg-orange-100 rounded-full h-1">
            <div className="bg-orange-400 h-1 rounded-full" style={{width: `${(weeklyChallenge.completed / weeklyChallenge.total) * 100}%`}}></div>
          </div>
          <div className="text-xs text-gray-600">{weeklyChallenge.completed}/{weeklyChallenge.total} completed</div>
        </div>
      </div>

      {/* Daily Quest */}
      <div className="bg-gradient-to-r from-green-300 to-blue-300 rounded-xl p-3">
        <h2 className="text-sm font-bold text-white mb-2">🎯 Today's Quest</h2>
        <div className="bg-white rounded-lg p-2">
          <h3 className="font-semibold text-gray-800 text-xs">Practice Sharing</h3>
          <p className="text-gray-600 text-xs">Share a toy or snack with someone today</p>
          <div className="mt-1 mb-2 bg-green-100 rounded-full h-1">
            <div className={`bg-green-400 h-1 rounded-full transition-all ${dailyQuestCompleted ? 'w-full' : 'w-2/3'}`}></div>
          </div>
          {!dailyQuestCompleted ? (
            <button 
              onClick={completeDailyQuest}
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-full text-xs"
            >
              I Did It! ✨
            </button>
          ) : (
            <div className="text-green-600 text-xs font-semibold">✅ Quest Complete! +50 XP</div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 rounded-xl p-2 text-center">
          <Trophy className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-blue-600">{userProgress.badges.length}</div>
          <div className="text-xs text-gray-600">Badges</div>
        </div>
        <div className="bg-green-50 rounded-xl p-2 text-center">
          <Book className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-green-600">{userProgress.completedQuests}</div>
          <div className="text-xs text-gray-600">Quests</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-2 text-center">
          <Star className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <div className="text-sm font-bold text-purple-600">{userProgress.weeklyStreak}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>
      </div>

      {/* Featured Activities */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-gray-800">🚀 Learning Adventures</h2>
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={() => setCurrentScreen('emotions')}
            className="bg-pink-100 hover:bg-pink-200 rounded-lg p-2 text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs">Emotion Explorer</h3>
                  <p className="text-xs text-gray-600">Learn about feelings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('skills')}
            className="bg-purple-100 hover:bg-purple-200 rounded-lg p-2 text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs">2nd Grade Skills</h3>
                  <p className="text-xs text-gray-600">Reading, math & more</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <button 
            onClick={() => setCurrentScreen('progress')}
            className="bg-yellow-100 hover:bg-yellow-200 rounded-lg p-2 text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs">My Progress</h3>
                  <p className="text-xs text-gray-600">See how you're doing</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="p-3 space-y-3 pb-20">
      <div className="flex items-center mb-3">
        <button onClick={() => setCurrentScreen('home')} className="mr-2 p-1 hover:bg-gray-100 rounded-full">
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">📊 My Progress</h1>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl p-3 text-white">
        <h3 className="font-semibold text-sm mb-2">Learning Journey</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold">{userProgress.masteredSkills.length}</div>
            <div className="text-xs opacity-90">Skills Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{userProgress.totalXP}</div>
            <div className="text-xs opacity-90">Total XP Earned</div>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">📚 Subject Mastery</h3>
        {Object.entries(userProgress.skillProgress).map(([subject, progress]) => (
          <div key={subject} className="bg-white rounded-xl p-2 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-gray-800 text-xs">{subject}</h4>
              <span className="text-xs text-gray-600">{progress.current}/{progress.total}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" 
                style={{width: `${progress.mastery}%`}}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">{progress.mastery}% mastered</div>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">📅 This Week's Activities</h3>
        <div className="space-y-2">
          {weeklyActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs font-semibold">{activity.day}</div>
                <div className="text-xs text-gray-600">{activity.activity}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">+{activity.xp} XP</span>
                {activity.completed ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderParentDashboard = () => (
    <div className="p-3 space-y-3 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-gray-800">👨‍👩‍👧‍👦 Parent Dashboard</h1>
        <button 
          onClick={() => setUserMode('child')}
          className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs"
        >
          Child View
        </button>
      </div>

      {/* Child Overview */}
      <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-xl p-3 text-white">
        <h3 className="font-semibold text-sm mb-2">Learning Summary - This Week</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold">{userProgress.totalXP}</div>
            <div className="text-xs opacity-90">XP Earned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{userProgress.completedQuests}</div>
            <div className="text-xs opacity-90">Activities Done</div>
          </div>
        </div>
      </div>

      {/* Progress by Subject */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">📊 Subject Progress</h3>
        {Object.entries(userProgress.skillProgress).map(([subject, progress]) => (
          <div key={subject} className="bg-white rounded-xl p-2 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-gray-800 text-xs">{subject}</h4>
              <span className="text-xs text-gray-600">{progress.mastery}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" 
                style={{width: `${progress.mastery}%`}}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversation Starters */}
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">💬 Conversation Starters</h3>
        <div className="space-y-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="text-xs">"I noticed you're learning about money! Can you show me the different coins?"</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <p className="text-xs">"You've been practicing sharing. Tell me about a time you shared today."</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <p className="text-xs">"Let's read a book together and talk about the characters' feelings."</p>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">🏆 Recent Achievements</h3>
        <div className="space-y-2">
          {userProgress.badges.slice(-3).map(badgeId => (
            <div key={badgeId} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
              <span className="text-lg">{badges[badgeId]?.emoji}</span>
              <div>
                <div className="text-xs font-semibold">{badges[badgeId]?.name}</div>
                <div className="text-xs text-gray-600">{badges[badgeId]?.earned}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Report */}
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">📈 Weekly Report</h3>
        <div className="text-xs text-gray-700 space-y-1">
          <p>• Completed {weeklyChallenge.completed}/5 weekly activities</p>
          <p>• Earned {userProgress.totalXP} XP this week</p>
          <p>• Mastered {userProgress.masteredSkills.length} new skills</p>
          <p>• Maintained a {userProgress.weeklyStreak}-day learning streak</p>
        </div>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="p-3 space-y-3 pb-20">
      <div className="flex items-center mb-3">
        <button onClick={() => setCurrentScreen('home')} className="mr-2 p-1 hover:bg-gray-100 rounded-full">
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">🎓 2nd Grade Skills</h1>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl p-3 text-white">
        <h3 className="font-semibold text-sm mb-2">Your Progress</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold">18</div>
            <div className="text-xs opacity-90">Skills Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">18</div>
            <div className="text-xs opacity-90">Skills Remaining</div>
          </div>
        </div>
      </div>

      {/* Skill Categories */}
      <div className="space-y-2">
        {Object.entries(skillTree).map(([category, skills]) => (
          <div key={category} className="bg-white rounded-xl p-2 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-2 text-xs">{category}</h3>
            <div className="space-y-1">
              {skills.unlocked.map((skill, index) => (
                <button 
                  key={index} 
                  onClick={() => openSkill(skill, true)}
                  className="w-full flex items-center justify-between bg-green-100 hover:bg-green-200 rounded-lg p-2 transition-colors"
                >
                  <span className="text-gray-800 text-xs">{skill}</span>
                  <div className="flex items-center space-x-1">
                    {quizzes[skill] && (
                      <span className="text-xs bg-blue-500 text-white px-1 rounded">Quiz</span>
                    )}
                    <span className="text-green-500 text-sm">✅</span>
                  </div>
                </button>
              ))}
              {skills.locked.map((skill, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                  <span className="text-gray-500 text-xs">{skill}</span>
                  <span className="text-gray-400 text-sm">🔒</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmotions = () => (
    <div className="p-3 space-y-3 pb-20">
      <div className="flex items-center mb-3">
        <button onClick={() => setCurrentScreen('home')} className="mr-2 p-1 hover:bg-gray-100 rounded-full">
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">🌈 Emotion Explorer</h1>
      </div>

      {/* Emotion Wheel */}
      <div className="bg-white rounded-xl p-3 shadow-lg">
        <h2 className="text-sm font-semibold mb-2 text-center">How are you feeling today?</h2>
        <div className="grid grid-cols-2 gap-2">
          {emotions.map((emotion, index) => (
            <button
              key={index}
              className={`${emotion.color} hover:scale-105 transition-transform rounded-lg p-2 text-center`}
            >
              <div className="text-lg mb-1">{emotion.emoji}</div>
              <div className="font-semibold text-gray-700 text-xs">{emotion.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calm Code Exercise */}
      <div className="bg-gradient-to-r from-blue-200 to-green-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold mb-2 text-center">🐉 Dragon Breathing</h3>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-2 rounded-full transition-all duration-3000 ${breathingActive ? (breathPhase === 'inhale' ? 'bg-blue-400 scale-110' : 'bg-green-400 scale-90') : 'bg-blue-300'}`}>
            <div className="w-full h-full flex items-center justify-center text-white text-lg">
              🐉
            </div>
          </div>
          <p className="text-gray-700 mb-2 text-xs">
            {breathingActive ? (breathPhase === 'inhale' ? 'Smell the flowers...' : 'Blow out the candles...') : 'Let\'s practice calm breathing like a dragon!'}
          </p>
          <button
            onClick={() => setBreathingActive(!breathingActive)}
            className={`px-4 py-1 rounded-full text-white font-semibold text-xs ${breathingActive ? 'bg-red-400 hover:bg-red-500' : 'bg-blue-400 hover:bg-blue-500'}`}
          >
            {breathingActive ? 'Stop' : 'Start Breathing'}
          </button>
        </div>
      </div>

      {/* Emotion Learning Cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">📚 Emotion Lessons</h3>
        <div className="bg-yellow-50 rounded-xl p-2">
          <h4 className="font-semibold text-gray-800 text-xs">Stop and Think</h4>
          <p className="text-xs text-gray-600 mt-1">When you feel upset, stop and think about your feelings!</p>
          <button 
            onClick={() => setShowModal('stopThink')}
            className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded-full text-xs"
          >
            Try Now
          </button>
        </div>
        <div className="bg-blue-50 rounded-xl p-2">
          <h4 className="font-semibold text-gray-800 text-xs">Use Your Words</h4>
          <p className="text-xs text-gray-600 mt-1">Tell someone how you feel using words instead of actions</p>
          <button 
            onClick={() => setShowModal('useWords')}
            className="mt-2 bg-blue-400 hover:bg-blue-500 text-white px-2 py-1 rounded-full text-xs"
          >
            Practice
          </button>
        </div>
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="p-3 space-y-3 pb-20">
      <div className="flex items-center mb-3">
        <button onClick={() => setCurrentScreen('home')} className="mr-2 p-1 hover:bg-gray-100 rounded-full">
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">📖 My Inner Journal</h1>
      </div>

      {/* New Entry */}
      <div className="bg-white rounded-xl p-2 shadow-lg">
        <h3 className="font-semibold mb-2 text-xs">✨ New Journal Entry</h3>
        <div className="space-y-2">
          <input 
            placeholder="What made you smile today?"
            className="w-full p-2 border border-gray-200 rounded-lg text-xs"
          />
          <div className="flex space-x-1">
            <button className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
              <Palette className="w-3 h-3" />
              <span className="text-xs">Draw</span>
            </button>
            <button className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
              <Mic className="w-3 h-3" />
              <span className="text-xs">Record</span>
            </button>
            <button className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
              <Camera className="w-3 h-3" />
              <span className="text-xs">Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Recent Memories</h3>
        <div className="bg-yellow-50 rounded-xl p-2">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-gray-800 text-xs">My Fun Day</h4>
            <span className="text-xs text-gray-500">June 26</span>
          </div>
          <p className="text-gray-700 text-xs">I shared my cookies at lunch today and made a new friend! 😊</p>
          <div className="mt-1 text-lg">🌟</div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-3 space-y-3 pb-20">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-gray-800">👤 My Profile</h1>
        <button 
          onClick={() => setUserMode('parent')}
          className="bg-green-500 text-white px-2 py-1 rounded-full text-xs"
        >
          Parent View
        </button>
      </div>
      
      {/* Avatar & Stats */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl p-3 text-white text-center">
        <button 
          onClick={() => setShowModal('avatarSelect')}
          className="w-12 h-12 bg-white bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center text-lg hover:bg-opacity-30 transition-colors"
        >
          {selectedAvatar}
        </button>
        <h2 className="text-sm font-bold">Super Explorer</h2>
        <p className="opacity-90 text-xs">Level {userProgress.level} • {userProgress.totalXP} XP • {userProgress.totalPoints} Points</p>
      </div>

      {/* Achievements */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">🏆 My Badges ({userProgress.badges.length})</h3>
        <div className="grid grid-cols-2 gap-2">
          {userProgress.badges.map(badgeId => (
            <button 
              key={badgeId}
              onClick={() => openBadge(badgeId)}
              className="bg-yellow-100 hover:bg-yellow-200 rounded-lg p-2 text-center transition-colors"
            >
              <div className="text-lg mb-1">{badges[badgeId]?.emoji}</div>
              <div className="text-xs font-semibold">{badges[badgeId]?.name}</div>
              <div className="text-xs text-gray-600">+{badges[badgeId]?.xp} XP</div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-600">{userProgress.completedQuests}</div>
          <div className="text-xs text-gray-600">Quests Completed</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-600">{userProgress.journalEntries}</div>
          <div className="text-xs text-gray-600">Journal Entries</div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    const closeModal = () => {
      setShowModal(null);
      setCurrentQuiz(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold">
              {showModal === 'stopThink' && '🛑 Stop and Think'}
              {showModal === 'useWords' && '🗣️ Use Your Words'}
              {showModal === 'questComplete' && '🎉 Quest Complete!'}
              {showModal === 'badge' && `${badges[currentLesson]?.emoji} ${badges[currentLesson]?.name}`}
              {showModal === 'skill' && '⭐ Skill Practice'}
              {showModal === 'skillOptions' && '📚 Choose Activity'}
              {showModal === 'quiz' && `🧠 ${currentQuiz?.skill} Quiz`}
              {showModal === 'quizResults' && '📊 Quiz Results'}
              {showModal === 'avatarSelect' && '🎭 Choose Avatar'}
            </h3>
            <button onClick={closeModal} className="text-gray-500 text-lg">×</button>
          </div>

          {/* Avatar Selection */}
          {showModal === 'avatarSelect' && (
            <div className="space-y-3">
              <p className="text-center text-xs text-gray-600">Pick your learning buddy!</p>
              <div className="grid grid-cols-4 gap-2">
                {avatars.map(avatar => (
                  <button
                    key={avatar}
                    onClick={() => {
                      setSelectedAvatar(avatar);
                      closeModal();
                    }}
                    className={`text-2xl p-3 rounded-lg transition-colors ${
                      selectedAvatar === avatar ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skill Options */}
          {showModal === 'skillOptions' && (
            <div className="space-y-3">
              <p className="text-center text-xs text-gray-600">What would you like to do?</p>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowModal('skill')}
                  className="w-full bg-blue-100 hover:bg-blue-200 rounded-lg p-3 text-center transition-colors"
                >
                  <div className="text-lg mb-1">📖</div>
                  <div className="font-semibold text-xs">Learn & Practice</div>
                  <div className="text-xs text-gray-600">Review the lesson</div>
                </button>
                <button 
                  onClick={() => startQuiz(currentLesson)}
                  className="w-full bg-green-100 hover:bg-green-200 rounded-lg p-3 text-center transition-colors"
                >
                  <div className="text-lg mb-1">🧠</div>
                  <div className="font-semibold text-xs">Take Quiz</div>
                  <div className="text-xs text-gray-600">Test your knowledge</div>
                </button>
              </div>
            </div>
          )}

          {/* Quiz */}
          {showModal === 'quiz' && currentQuiz && !currentQuiz.completed && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-2">
                  Question {currentQuiz.currentQuestion + 1} of {currentQuiz.questions.length}
                </div>
                <div className="bg-blue-100 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all" 
                    style={{width: `${((currentQuiz.currentQuestion + 1) / currentQuiz.questions.length) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h4 className="font-semibold text-sm mb-3">
                  {currentQuiz.questions[currentQuiz.currentQuestion].question}
                </h4>
              </div>

              <div className="space-y-2">
                {currentQuiz.questions[currentQuiz.currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => answerQuiz(index)}
                    className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="text-xs">{option}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Results */}
          {showModal === 'quizResults' && currentQuiz && (
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">
                {currentQuiz.score === currentQuiz.questions.length ? '🎉' : 
                 currentQuiz.score >= currentQuiz.questions.length / 2 ? '👏' : '💪'}
              </div>
              <h4 className="text-sm font-semibold">
                {currentQuiz.score === currentQuiz.questions.length ? 'Perfect!' : 
                 currentQuiz.score >= currentQuiz.questions.length / 2 ? 'Great Job!' : 'Keep Trying!'}
              </h4>
              <p className="text-xs text-gray-700">
                You got {currentQuiz.score} out of {currentQuiz.questions.length} questions right!
              </p>
              <div className="bg-green-100 rounded-lg p-2">
                <div className="text-lg mb-1">+{currentQuiz.score * 25}</div>
                <div className="text-xs font-semibold">XP Earned!</div>
              </div>
              <button 
                onClick={closeModal}
                className="bg-blue-500 text-white px-3 py-2 rounded-full text-xs"
              >
                Continue Learning! 🚀
              </button>
            </div>
          )}

          {/* Existing modals (stopThink, useWords, etc.) */}
          {showModal === 'stopThink' && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-4xl mb-2">✋</div>
                <p className="text-gray-700 mb-3 text-xs">When you feel upset, remember to:</p>
              </div>
              <div className="space-y-2">
                <div className="bg-red-100 rounded-lg p-2 text-center">
                  <div className="text-lg mb-1">🛑</div>
                  <div className="font-semibold text-xs">STOP</div>
                  <div className="text-xs">Stop what you're doing</div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-2 text-center">
                  <div className="text-lg mb-1">🤔</div>
                  <div className="font-semibold text-xs">THINK</div>
                  <div className="text-xs">Think about your feelings</div>
                </div>
                <div className="bg-green-100 rounded-lg p-2 text-center">
                  <div className="text-lg mb-1">💭</div>
                  <div className="font-semibold text-xs">CHOOSE</div>
                  <div className="text-xs">Choose a good way to handle it</div>
                </div>
              </div>
            </div>
          )}

          {showModal === 'useWords' && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-4xl mb-2">🗣️</div>
                <p className="text-gray-700 mb-3 text-xs">Instead of hitting or yelling, try saying:</p>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <div className="font-semibold text-xs">"I feel mad when..."</div>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <div className="font-semibold text-xs">"I need help with..."</div>
                </div>
                <div className="bg-purple-100 rounded-lg p-2">
                  <div className="font-semibold text-xs">"Can you please..."</div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <div className="font-semibold text-xs">"I don't like it when..."</div>
                </div>
              </div>
            </div>
          )}

          {showModal === 'questComplete' && (
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">🎉</div>
              <h4 className="text-sm font-semibold text-green-600">Amazing Job!</h4>
              <p className="text-gray-700 text-xs">You completed today's sharing quest!</p>
              <div className="bg-green-100 rounded-lg p-2">
                <div className="text-lg mb-1">+50</div>
                <div className="text-xs font-semibold">XP Earned!</div>
              </div>
              <button 
                onClick={closeModal}
                className="bg-green-500 text-white px-3 py-2 rounded-full text-xs"
              >
                Keep Exploring! 🚀
              </button>
            </div>
          )}

          {showModal === 'badge' && currentLesson && badges[currentLesson] && (
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">{badges[currentLesson].emoji}</div>
              <h4 className="text-sm font-semibold">{badges[currentLesson].name}</h4>
              <p className="text-gray-700 text-xs">{badges[currentLesson].description}</p>
              <div className="bg-gray-100 rounded-lg p-2">
                <div className="text-xs text-gray-600">Earned on</div>
                <div className="font-semibold text-xs">{badges[currentLesson].earned}</div>
                <div className="text-xs text-blue-600">+{badges[currentLesson].xp} XP</div>
              </div>
            </div>
          )}

          {showModal === 'skill' && currentLesson && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <h4 className="font-semibold text-sm">{currentLesson}</h4>
              </div>
              <div className="space-y-2">
                {currentLesson === 'Reading Simple Books' && (
                  <div className="bg-blue-100 rounded-lg p-2">
                    <div className="font-semibold text-xs mb-1">Reading Tips:</div>
                    <div className="text-xs">• Sound out words slowly</div>
                    <div className="text-xs">• Look at pictures for clues</div>
                    <div className="text-xs">• Practice every day</div>
                  </div>
                )}
                {currentLesson === 'Counting to 100' && (
                  <div className="bg-orange-100 rounded-lg p-2">
                    <div className="font-semibold text-xs mb-1">Counting Fun:</div>
                    <div className="text-xs">• Count by 1s, 2s, 5s, 10s</div>
                    <div className="text-xs">• Use your fingers</div>
                    <div className="text-xs">• Count objects around you</div>
                  </div>
                )}
                {/* Add other skill lessons here... */}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-1 max-w-md mx-auto">
      <div className="flex justify-around">
        <button 
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center p-1 ${currentScreen === 'home' ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <Home className="w-4 h-4" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('emotions')}
          className={`flex flex-col items-center p-1 ${currentScreen === 'emotions' ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-xs mt-1">Emotions</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('skills')}
          className={`flex flex-col items-center p-1 ${currentScreen === 'skills' ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <Brain className="w-4 h-4" />
          <span className="text-xs mt-1">Skills</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('journal')}
          className={`flex flex-col items-center p-1 ${currentScreen === 'journal' ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <Book className="w-4 h-4" />
          <span className="text-xs mt-1">Journal</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('profile')}
          className={`flex flex-col items-center p-1 ${currentScreen === 'profile' ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <User className="w-4 h-4" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {currentScreen === 'home' && renderHome()}
      {currentScreen === 'emotions' && renderEmotions()}
      {currentScreen === 'skills' && renderSkills()}
      {currentScreen === 'progress' && renderProgress()}
      {currentScreen === 'journal' && renderJournal()}
      {currentScreen === 'profile' && renderProfile()}
      
      {renderBottomNav()}
      {renderModal()}
    </div>
  );
};

export default InnerOdysseyApp;