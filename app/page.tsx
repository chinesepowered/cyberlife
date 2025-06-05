'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Heart, Star, Zap, MessageCircle, RefreshCw } from 'lucide-react';

const AI_DUNGEON_GAME = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, victory
  const [player, setPlayer] = useState({ x: 50, y: 300, health: 100, score: 0, level: 1 });
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameContext, setGameContext] = useState('');
  const [treasures, setTreasures] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const [keys, setKeys] = useState({});
  const [roomNumber, setRoomNumber] = useState(1);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PLAYER_SIZE = 20;
  const TREASURE_SIZE = 15;
  const ENEMY_SIZE = 18;

  // Initialize game objects
  const generateRoom = useCallback((level) => {
    const newTreasures = [];
    const newEnemies = [];
    const treasureCount = Math.min(3 + level, 8);
    const enemyCount = Math.min(2 + Math.floor(level / 2), 6);

    // Generate treasures
    for (let i = 0; i < treasureCount; i++) {
      newTreasures.push({
        x: Math.random() * (CANVAS_WIDTH - TREASURE_SIZE),
        y: Math.random() * (CANVAS_HEIGHT - TREASURE_SIZE),
        collected: false,
        type: Math.random() > 0.7 ? 'special' : 'normal'
      });
    }

    // Generate enemies
    for (let i = 0; i < enemyCount; i++) {
      newEnemies.push({
        x: Math.random() * (CANVAS_WIDTH - ENEMY_SIZE),
        y: Math.random() * (CANVAS_HEIGHT - ENEMY_SIZE),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        alive: true
      });
    }

    setTreasures(newTreasures);
    setEnemies(newEnemies);
  }, []);

  // AI API call function
  const callAI = async (prompt) => {
    setIsAiThinking(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: `You are a mystical AI guide in a dungeon exploration game. Keep responses under 50 words, be encouraging and mysterious. Context: ${prompt}` 
        }),
      });
      
      if (!response.ok) {
        throw new Error('AI service unavailable');
      }
      
      const data = await response.json();
      setAiResponse(data.response || 'Hmm, the mystical energies are unclear...');
    } catch (error) {
      setAiResponse('The AI oracle is resting. Try again soon!');
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game logic
  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setPlayer(prev => {
      let newX = prev.x;
      let newY = prev.y;

      // Player movement
      if (keys['ArrowLeft'] || keys['a']) newX = Math.max(0, prev.x - 3);
      if (keys['ArrowRight'] || keys['d']) newX = Math.min(CANVAS_WIDTH - PLAYER_SIZE, prev.x + 3);
      if (keys['ArrowUp'] || keys['w']) newY = Math.max(0, prev.y - 3);
      if (keys['ArrowDown'] || keys['s']) newY = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, prev.y + 3);

      return { ...prev, x: newX, y: newY };
    });

    // Update enemies
    setEnemies(prev => prev.map(enemy => {
      if (!enemy.alive) return enemy;

      let newX = enemy.x + enemy.vx;
      let newY = enemy.y + enemy.vy;

      // Bounce off walls
      if (newX <= 0 || newX >= CANVAS_WIDTH - ENEMY_SIZE) enemy.vx *= -1;
      if (newY <= 0 || newY >= CANVAS_HEIGHT - ENEMY_SIZE) enemy.vy *= -1;

      newX = Math.max(0, Math.min(CANVAS_WIDTH - ENEMY_SIZE, newX));
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - ENEMY_SIZE, newY));

      return { ...enemy, x: newX, y: newY };
    }));

    // Check collisions
    setTreasures(prev => prev.map(treasure => {
      if (treasure.collected) return treasure;

      const dx = player.x - treasure.x;
      const dy = player.y - treasure.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PLAYER_SIZE) {
        setPlayer(p => ({ 
          ...p, 
          score: p.score + (treasure.type === 'special' ? 50 : 10) 
        }));
        
        // Add particles
        setParticles(p => [...p, ...Array.from({length: 5}, (_, i) => ({
          x: treasure.x,
          y: treasure.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 30,
          color: treasure.type === 'special' ? '#ffd700' : '#00ff00'
        }))]);

        return { ...treasure, collected: true };
      }
      return treasure;
    }));

    // Check enemy collisions
    enemies.forEach(enemy => {
      if (!enemy.alive) return;

      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PLAYER_SIZE) {
        setPlayer(p => ({ ...p, health: Math.max(0, p.health - 1) }));
      }
    });

    // Update particles
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 1
    })).filter(p => p.life > 0));

    // Check level completion
    const uncollectedTreasures = treasures.filter(t => !t.collected);
    if (uncollectedTreasures.length === 0) {
      setPlayer(p => ({ ...p, level: p.level + 1 }));
      setRoomNumber(r => r + 1);
      generateRoom(player.level + 1);
      
      // Occasional AI comment on progress
      if (Math.random() < 0.3) {
        const contexts = [
          `Player completed room ${roomNumber}, now at level ${player.level + 1}`,
          `Player has ${player.score} points and is doing well`,
          `Player just cleared a room with ${player.health} health remaining`
        ];
        callAI(contexts[Math.floor(Math.random() * contexts.length)]);
      }
    }

    // Check game over
    if (player.health <= 0) {
      setGameState('menu');
      callAI(`Player died at level ${player.level} with ${player.score} points. Give encouraging words.`);
    }
  }, [gameState, keys, player, treasures, enemies, roomNumber, generateRoom]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(updateGame, 16); // ~60fps
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, updateGame]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'playing') {
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw treasures
      treasures.forEach(treasure => {
        if (treasure.collected) return;

        ctx.save();
        ctx.translate(treasure.x + TREASURE_SIZE/2, treasure.y + TREASURE_SIZE/2);
        ctx.rotate(Date.now() * 0.005);
        
        if (treasure.type === 'special') {
          ctx.fillStyle = '#ffd700';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#00ff00';
          ctx.shadowColor = '#00ff00';
          ctx.shadowBlur = 5;
        }
        
        ctx.fillRect(-TREASURE_SIZE/2, -TREASURE_SIZE/2, TREASURE_SIZE, TREASURE_SIZE);
        ctx.restore();
      });

      // Draw enemies
      enemies.forEach(enemy => {
        if (!enemy.alive) return;

        ctx.save();
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(enemy.x + ENEMY_SIZE/2, enemy.y + ENEMY_SIZE/2, ENEMY_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw player
      ctx.save();
      ctx.translate(player.x + PLAYER_SIZE/2, player.y + PLAYER_SIZE/2);
      ctx.fillStyle = '#00bfff';
      ctx.shadowColor = '#00bfff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_SIZE/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw particles
      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life / 30;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
        ctx.restore();
      });
    }
  }, [gameState, player, treasures, enemies, particles]);

  const startGame = () => {
    setGameState('playing');
    setPlayer({ x: 50, y: 300, health: 100, score: 0, level: 1 });
    setRoomNumber(1);
    generateRoom(1);
    callAI("Player just started a new adventure in the mystical dungeon!");
  };

  const askAI = () => {
    const contexts = [
      `Player is at level ${player.level}, room ${roomNumber}, with ${player.health} health and ${player.score} points`,
      `Player has ${treasures.filter(t => !t.collected).length} treasures left to collect`,
      `Player is facing ${enemies.filter(e => e.alive).length} enemies`
    ];
    callAI(contexts[Math.floor(Math.random() * contexts.length)]);
    setShowAiPanel(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 shadow-2xl border border-purple-500/30">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            AI Dungeon Explorer
          </h1>
          <p className="text-gray-300">Navigate rooms, collect treasures, avoid enemies!</p>
        </div>

        {gameState === 'menu' && (
          <div className="text-center space-y-4">
            <div className="text-gray-300 mb-6">
              <p>Use WASD or Arrow Keys to move</p>
              <p>Collect all treasures to advance to the next room</p>
              <p>Ask your AI companion for guidance!</p>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Sparkles className="inline-block mr-2" size={20} />
              Start Adventure
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            {/* Game Stats */}
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Heart className="mr-1 text-red-400" size={16} />
                  <span>{player.health}/100</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 text-yellow-400" size={16} />
                  <span>{player.score}</span>
                </div>
                <div className="flex items-center">
                  <Zap className="mr-1 text-blue-400" size={16} />
                  <span>Room {roomNumber}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={askAI}
                  disabled={isAiThinking}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white px-3 py-1 rounded-lg transition-all duration-200"
                >
                  {isAiThinking ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <MessageCircle size={16} />
                  )}
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg transition-all duration-200"
                >
                  Menu
                </button>
              </div>
            </div>

            {/* Game Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-purple-400/50 rounded-lg bg-black/50"
            />

            {/* AI Response Panel */}
            {showAiPanel && aiResponse && (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="text-green-400 mt-1" size={16} />
                    <div>
                      <p className="text-green-400 font-semibold">AI Guide</p>
                      <p className="text-gray-300">{aiResponse}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="text-center text-gray-300">
              <p>Treasures remaining: {treasures.filter(t => !t.collected).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AI_DUNGEON_GAME;