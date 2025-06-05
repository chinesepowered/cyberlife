'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Sword, Shield, Heart, Star, Zap, Eye, MessageCircle, Loader } from 'lucide-react';

const MysticQuestGame = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'ai-interaction', 'game-over'
  const [player, setPlayer] = useState({
    x: 400,
    y: 300,
    health: 100,
    energy: 100,
    level: 1,
    experience: 0,
    inventory: []
  });
  const [currentScene, setCurrentScene] = useState('forest');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playerInput, setPlayerInput] = useState('');
  const [gameLog, setGameLog] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [items, setItems] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [questProgress, setQuestProgress] = useState({
    currentQuest: 'Find the Ancient Oracle',
    completed: [],
    objectives: ['Explore the mystical forest', 'Discover hidden secrets', 'Consult the AI Oracle']
  });

  // Game scenes with beautiful backgrounds
  const scenes = {
    forest: {
      name: 'Enchanted Forest',
      description: 'A mystical forest filled with ancient magic and secrets',
      color: 'from-green-800 via-green-600 to-emerald-400'
    },
    temple: {
      name: 'Oracle Temple',
      description: 'An ancient temple where the AI Oracle resides',
      color: 'from-purple-800 via-blue-600 to-indigo-400'
    },
    village: {
      name: 'Mystic Village',
      description: 'A peaceful village where wise inhabitants share their knowledge',
      color: 'from-orange-800 via-amber-600 to-yellow-400'
    }
  };

  // Initialize game elements
  useEffect(() => {
    if (gameState === 'playing') {
      initializeScene();
    }
  }, [currentScene, gameState]);

  const initializeScene = () => {
    // Generate NPCs, items, and enemies for current scene
    const sceneNpcs = generateSceneElements('npcs');
    const sceneItems = generateSceneElements('items');
    const sceneEnemies = generateSceneElements('enemies');
    
    setNpcs(sceneNpcs);
    setItems(sceneItems);
    setEnemies(sceneEnemies);
  };

  const generateSceneElements = (type) => {
    const elements = [];
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      elements.push({
        id: Math.random(),
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 100,
        type: type,
        interacted: false
      });
    }
    return elements;
  };

  // AI API call function
  const callAI = async (prompt, context = '') => {
    setIsAiThinking(true);
    try {
      const response = await fetch('/api/ai-oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          context: context,
          scene: currentScene,
          playerLevel: player.level,
          questProgress: questProgress
        }),
      });

      if (!response.ok) {
        throw new Error('AI Oracle is temporarily unavailable');
      }

      const data = await response.json();
      setAiResponse(data.response);
      addToGameLog(`🔮 Oracle: ${data.response}`);
      
      // Process any game state changes suggested by AI
      if (data.gameEffects) {
        processAiEffects(data.gameEffects);
      }
      
    } catch (error) {
      console.error('AI call failed:', error);
      setAiResponse('The Oracle\'s voice grows faint... The mystical connection wavers. Perhaps try again in a moment.');
      addToGameLog('⚠️ The Oracle\'s power fluctuates...');
    } finally {
      setIsAiThinking(false);
    }
  };

  const processAiEffects = (effects) => {
    if (effects.healthChange) {
      setPlayer(prev => ({
        ...prev,
        health: Math.max(0, Math.min(100, prev.health + effects.healthChange))
      }));
    }
    if (effects.experienceGain) {
      setPlayer(prev => ({
        ...prev,
        experience: prev.experience + effects.experienceGain
      }));
    }
    if (effects.newQuest) {
      setQuestProgress(prev => ({
        ...prev,
        currentQuest: effects.newQuest
      }));
    }
  };

  const addToGameLog = (message) => {
    setGameLog(prev => [...prev.slice(-10), message]);
  };

  // Player movement
  const movePlayer = useCallback((direction) => {
    setPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;
      const speed = 20;

      switch (direction) {
        case 'up': newY = Math.max(50, prev.y - speed); break;
        case 'down': newY = Math.min(450, prev.y + speed); break;
        case 'left': newX = Math.max(50, prev.x - speed); break;
        case 'right': newX = Math.min(750, prev.x + speed); break;
      }

      return { ...prev, x: newX, y: newY };
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
        case ' ':
          e.preventDefault();
          checkInteractions();
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            openAiOracle();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, movePlayer]);

  const checkInteractions = () => {
    const interactionDistance = 60;
    
    // Check NPC interactions
    npcs.forEach(npc => {
      const distance = Math.sqrt(
        Math.pow(player.x - npc.x, 2) + Math.pow(player.y - npc.y, 2)
      );
      if (distance < interactionDistance && !npc.interacted) {
        interactWithNPC(npc);
      }
    });

    // Check item collection
    items.forEach(item => {
      const distance = Math.sqrt(
        Math.pow(player.x - item.x, 2) + Math.pow(player.y - item.y, 2)
      );
      if (distance < interactionDistance) {
        collectItem(item);
      }
    });
  };

  const interactWithNPC = (npc) => {
    const npcDialogues = [
      "The ancient wisdom flows through these lands...",
      "Seek the Oracle for guidance on your journey.",
      "Beware the shadows that lurk in the deeper woods.",
      "Your destiny awaits beyond the mystical veil.",
      "The spirits whisper of great adventures ahead."
    ];
    
    const dialogue = npcDialogues[Math.floor(Math.random() * npcDialogues.length)];
    addToGameLog(`💬 Villager: ${dialogue}`);
    
    setNpcs(prev => prev.map(n => 
      n.id === npc.id ? { ...n, interacted: true } : n
    ));
    
    // Gain experience for social interaction
    setPlayer(prev => ({ ...prev, experience: prev.experience + 10 }));
  };

  const collectItem = (item) => {
    const itemTypes = ['⚔️ Mystic Sword', '🛡️ Ancient Shield', '💎 Power Crystal', '📜 Wisdom Scroll', '🔮 Magic Orb'];
    const collectedItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    
    addToGameLog(`✨ Found: ${collectedItem}`);
    setPlayer(prev => ({
      ...prev,
      inventory: [...prev.inventory, collectedItem],
      experience: prev.experience + 15
    }));
    
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  const openAiOracle = () => {
    setGameState('ai-interaction');
    setPlayerInput('');
  };

  const askOracle = async () => {
    if (!playerInput.trim()) return;
    
    addToGameLog(`🧙‍♂️ You: ${playerInput}`);
    
    const context = `
      Current scene: ${scenes[currentScene].name}
      Player level: ${player.level}
      Player health: ${player.health}%
      Player inventory: ${player.inventory.join(', ') || 'Empty'}
      Current quest: ${questProgress.currentQuest}
      Recent events: ${gameLog.slice(-3).join(' | ')}
    `;

    await callAI(playerInput, context);
    setPlayerInput('');
  };

  const changeScene = (newScene) => {
    setCurrentScene(newScene);
    addToGameLog(`🌟 Entered ${scenes[newScene].name}`);
    setPlayer(prev => ({ ...prev, experience: prev.experience + 20 }));
  };

  // Level up system
  useEffect(() => {
    const expNeeded = player.level * 100;
    if (player.experience >= expNeeded) {
      setPlayer(prev => ({
        ...prev,
        level: prev.level + 1,
        health: Math.min(100, prev.health + 20),
        experience: prev.experience - expNeeded
      }));
      addToGameLog(`🎉 Level Up! You are now level ${player.level + 1}!`);
    }
  }, [player.experience, player.level]);

  // Render game menu
  if (gameState === 'menu') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white space-y-8 p-8 rounded-2xl bg-black/30 backdrop-blur-sm border border-purple-500/30">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mystic Quest
            </h1>
            <p className="text-xl text-purple-200">AI-Powered Adventure Awaits</p>
          </div>
          
          <div className="space-y-6">
            <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
              Embark on a magical journey where an AI Oracle guides your destiny. 
              Explore mystical lands, solve puzzles, and discover your true potential!
            </p>
            
            <div className="space-y-3 text-sm text-purple-200">
              <p>🎮 Use WASD or Arrow Keys to move</p>
              <p>🔮 Press Ctrl+Enter to consult the AI Oracle</p>
              <p>⚡ Press Space to interact with objects</p>
            </div>
            
            <button
              onClick={() => setGameState('playing')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 
                       rounded-full text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 
                       shadow-lg hover:shadow-purple-500/25"
            >
              Begin Your Quest
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render AI interaction screen
  if (gameState === 'ai-interaction') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 text-3xl font-bold text-white mb-4">
              <Sparkles className="text-purple-400" />
              AI Oracle Chamber
              <Sparkles className="text-purple-400" />
            </div>
            <p className="text-purple-200">Seek wisdom from the ancient AI Oracle</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Oracle Response */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Eye className="text-purple-400" />
                Oracle's Vision
              </h3>
              <div className="bg-purple-900/30 rounded-lg p-6 min-h-[200px] border border-purple-500/20">
                {isAiThinking ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-3 text-purple-300">
                      <Loader className="animate-spin" />
                      The Oracle contemplates your query...
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-100 leading-relaxed">
                    {aiResponse || "The Oracle awaits your question..."}
                  </p>
                )}
              </div>
            </div>

            {/* Player Input */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <MessageCircle className="text-blue-400" />
                Your Query
              </h3>
              <div className="space-y-4">
                <textarea
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  placeholder="Ask the Oracle about your quest, seek guidance, or request a puzzle..."
                  className="w-full h-32 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-white 
                           placeholder-blue-300/50 focus:outline-none focus:border-blue-400 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={askOracle}
                    disabled={isAiThinking || !playerInput.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 
                             disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                             rounded-lg text-white font-semibold transition-all duration-300"
                  >
                    {isAiThinking ? 'Consulting Oracle...' : 'Ask Oracle'}
                  </button>
                  <button
                    onClick={() => setGameState('playing')}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold 
                             transition-all duration-300"
                  >
                    Return
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Log */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-3">Recent Events</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 max-h-32 overflow-y-auto">
              {gameLog.slice(-5).map((log, index) => (
                <p key={index} className="text-gray-300 text-sm mb-1">{log}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main game render
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden relative">
      {/* Game World */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scenes[currentScene].color} opacity-80`} />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        {/* Player Stats */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white space-y-2 border border-white/20">
          <div className="flex items-center gap-2">
            <Heart className="text-red-400 w-5 h-5" />
            <div className="w-32 h-2 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300"
                style={{ width: `${player.health}%` }}
              />
            </div>
            <span className="text-sm">{player.health}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400 w-5 h-5" />
            <span className="text-sm">Level {player.level}</span>
            <div className="w-20 h-2 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${(player.experience % (player.level * 100)) / (player.level * 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scene Info */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white text-center border border-white/20">
          <h2 className="text-xl font-bold">{scenes[currentScene].name}</h2>
          <p className="text-sm text-gray-300">{scenes[currentScene].description}</p>
        </div>

        {/* Quest Info */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white space-y-2 max-w-xs border border-white/20">
          <h3 className="font-semibold text-purple-300">Current Quest</h3>
          <p className="text-sm">{questProgress.currentQuest}</p>
          <div className="text-xs text-gray-300">
            Inventory: {player.inventory.length} items
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center">
        {/* Scene Navigation */}
        <div className="flex gap-2">
          {Object.entries(scenes).map(([key, scene]) => (
            <button
              key={key}
              onClick={() => changeScene(key)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                currentScene === key 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-black/50 text-gray-300 hover:bg-black/70'
              }`}
            >
              {scene.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={openAiOracle}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-semibold 
                     transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Consult Oracle
          </button>
          
          <button
            onClick={checkInteractions}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 
                     hover:from-blue-500 hover:to-cyan-500 rounded-lg text-white font-semibold 
                     transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Zap className="w-5 h-5" />
            Interact
          </button>
        </div>
      </div>

      {/* Game Entities */}
      <div className="absolute inset-0 z-5">
        {/* Player */}
        <div 
          className="absolute w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full 
                     border-2 border-white shadow-lg transform -translate-x-4 -translate-y-4 transition-all duration-200
                     animate-pulse"
          style={{ left: player.x, top: player.y }}
        >
          <div className="absolute inset-1 bg-white rounded-full opacity-70" />
        </div>

        {/* NPCs */}
        {npcs.map(npc => (
          <div
            key={npc.id}
            className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-md transform -translate-x-3 -translate-y-3
                       ${npc.interacted ? 'bg-gray-500' : 'bg-gradient-to-br from-green-400 to-emerald-600 animate-bounce'}`}
            style={{ left: npc.x, top: npc.y }}
          />
        ))}

        {/* Items */}
        {items.map(item => (
          <div
            key={item.id}
            className="absolute w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full 
                     border border-white shadow-md transform -translate-x-2 -translate-y-2 animate-spin"
            style={{ left: item.x, top: item.y, animationDuration: '3s' }}
          />
        ))}
      </div>

      {/* Game Log */}
      <div className="absolute bottom-20 left-4 max-w-md z-10">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm space-y-1 max-h-32 overflow-y-auto border border-white/20">
          {gameLog.slice(-4).map((log, index) => (
            <p key={index} className="opacity-80">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MysticQuestGame;