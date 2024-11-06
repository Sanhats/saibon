import React, { useState, useEffect } from 'react';
import { Droplet, Sun, Scissors, Cloud, Wind, Heart, TreePine, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

const TREE_TYPES = {
  pine: {
    name: 'Pino',
    growthRate: 0.8,
    waterNeeds: 0.7,
    sunNeeds: 1.2,
    color: '#2d5a27',
    foliageShape: 'triangular',
  },
  maple: {
    name: 'Arce',
    growthRate: 1.2,
    waterNeeds: 1,
    sunNeeds: 0.8,
    color: '#c41e3a',
    foliageShape: 'round',
  },
  juniper: {
    name: 'Junípero',
    growthRate: 0.9,
    waterNeeds: 0.6,
    sunNeeds: 1,
    color: '#1b4d3e',
    foliageShape: 'irregular',
  },
};

const BONSAI_STYLES = {
  'formal-upright': {
    name: 'Formal Vertical',
    trunkAngle: 0,
    difficulty: 1,
  },
  'informal-upright': {
    name: 'Informal Vertical',
    trunkAngle: 15,
    difficulty: 2,
  },
  'slanting': {
    name: 'Inclinado',
    trunkAngle: 30,
    difficulty: 2,
  },
  'cascade': {
    name: 'Cascada',
    trunkAngle: 90,
    difficulty: 3,
  },
  'semi-cascade': {
    name: 'Semi-cascada',
    trunkAngle: 45,
    difficulty: 3,
  },
};

const WEATHER_TYPES = {
  sunny: {
    name: 'Soleado',
    sunlightBonus: 20,
    waterLoss: 1.2,
    icon: Sun,
  },
  cloudy: {
    name: 'Nublado',
    sunlightBonus: -10,
    waterLoss: 0.8,
    icon: Cloud,
  },
  rainy: {
    name: 'Lluvioso',
    sunlightBonus: -20,
    waterLoss: 0.5,
    waterBonus: 10,
    icon: Droplet,
  },
  windy: {
    name: 'Ventoso',
    waterLoss: 1.5,
    icon: Wind,
  },
};

const BonsaiGame = () => {
  const [gameState, setGameState] = useState({
    water: 50,
    health: 100,
    sunlight: 50,
    growth: 0,
    lastWatered: new Date(),
    season: 'spring',
    age: 0,
    style: 'formal-upright',
    treeType: 'pine',
    branches: [],
    lastPruned: new Date(),
    weather: 'sunny',
    achievements: [],
    experience: 0,
  });

  const [notification, setNotification] = useState('');
  const [showStyleSelect, setShowStyleSelect] = useState(false);
  const [showTreeSelect, setShowTreeSelect] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);

  useEffect(() => {
    if (gameState.branches.length === 0) {
      initializeBranches();
    }
    startWeatherCycle();
  }, []);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const apiKey = 'f9d5b158ead38dbd75afad7c3e19352f';
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}&units=metric`
        );
        setCurrentWeather(response.data);
      } catch (error) {
        console.error('Error al obtener la ubicación y el clima:', error);
        setCurrentWeather(null);
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      let sunlightBonus = 0;
      if (hour >= 6 && hour < 18) {
        sunlightBonus = 20;
      } else {
        sunlightBonus = -20;
      }

      let waterLossMultiplier = 1;
      let sunlightBonusMultiplier = 1;
      if (currentWeather) {
        const { weather, wind, main } = currentWeather;
        const { description } = weather[0];

        if (description.includes('rain')) {
          waterLossMultiplier = 0.5;
          sunlightBonusMultiplier = 0.8;
        } else if (description.includes('cloud')) {
          sunlightBonusMultiplier = 0.6;
        } else if (description.includes('sun')) {
          waterLossMultiplier = 1.2;
          sunlightBonusMultiplier = 1.2;
        }

        if (wind.speed > 10) {
          waterLossMultiplier = 1.5;
        }

        if (main.temp < 10) {
          waterLossMultiplier = 0.8;
          sunlightBonusMultiplier = 0.8;
        } else if (main.temp > 30) {
          waterLossMultiplier = 1.2;
          sunlightBonusMultiplier = 0.9;
        }
      }

      setGameState((prevState) => ({
        ...prevState,
        water: Math.max(0, prevState.water - prevState.water * 0.005 * waterLossMultiplier),
        sunlight: Math.max(0, Math.min(100, prevState.sunlight + (sunlightBonus * sunlightBonusMultiplier) / 10)),
        growth: prevState.growth + (prevState.health > 50 ? 0.1 * waterLossMultiplier * sunlightBonusMultiplier : 0),
      }));
    }, 60000);

    return () => clearInterval(timer);
  }, [currentWeather]);

  const initializeBranches = () => {
    const style = BONSAI_STYLES[gameState.style];
    const branchCount = style.difficulty + 2;

    const initialBranches = Array(branchCount)
      .fill(null)
      .map((_, i) => ({
        id: i,
        length: Math.random() * 20 + 10,
        angle: style.trunkAngle + (-45 + i * (90 / (branchCount - 1))),
        health: 100,
      }));

    setGameState((prev) => ({ ...prev, branches: initialBranches }));
  };

  const startWeatherCycle = () => {
    const weatherInterval = setInterval(() => {
      const weatherTypes = Object.keys(WEATHER_TYPES);
      const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

      setGameState((prev) => ({
        ...prev,
        weather: newWeather,
      }));

      setNotification(`El clima ha cambiado a ${WEATHER_TYPES[newWeather].name}`);
    }, 60000);

    return () => clearInterval(weatherInterval);
  };


  // Simulación principal
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prevState => {
        const weatherEffects = WEATHER_TYPES[prevState.weather];
        const treeProperties = TREE_TYPES[prevState.treeType];
        
        const waterLoss = calculateWaterLoss(prevState, weatherEffects, treeProperties);
        const newHealth = calculateHealth(prevState, treeProperties);
        const newGrowth = calculateGrowth(prevState, treeProperties);
        
        return {
          ...prevState,
          water: Math.max(0, prevState.water - waterLoss),
          health: newHealth,
          growth: newGrowth,
          age: prevState.age + 5,
          sunlight: Math.max(0, Math.min(100, prevState.sunlight + (weatherEffects.sunlightBonus || 0) / 10)),
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const calculateWaterLoss = (state, weather, treeProps) => {
    const baseWaterLoss = 0.5;
    const weatherMultiplier = weather.waterLoss || 1;
    const treeMultiplier = treeProps.waterNeeds;
    const seasonMultiplier = state.season === 'summer' ? 1.5 : 1;
    
    return baseWaterLoss * weatherMultiplier * treeMultiplier * seasonMultiplier;
  };

  const calculateHealth = (state, treeProps) => {
    const healthLoss = (state.water < 20 || state.sunlight < 20) ? 5 : 0;
    return Math.max(0, state.health - healthLoss);
  };

  const calculateGrowth = (state, treeProps) => {
    if (state.health < 50) return state.growth;
    
    const baseGrowth = 0.1;
    const treeMultiplier = treeProps.growthRate;
    const waterFactor = state.water > 30 && state.water < 80 ? 1 : 0.5;
    const sunlightFactor = state.sunlight > 40 && state.sunlight < 90 ? 1 : 0.5;
    
    return state.growth + (baseGrowth * treeMultiplier * waterFactor * sunlightFactor);
  };

  const waterTree = () => {
    setGameState(prev => ({
      ...prev,
      water: Math.min(100, prev.water + 20),
      lastWatered: new Date()
    }));
    setNotification('Has regado el árbol.');
  };

  const provideSunlight = () => {
    setGameState(prev => ({
      ...prev,
      sunlight: Math.min(100, prev.sunlight + 10)
    }));
    setNotification('Has expuesto el árbol a la luz solar.');
  };

  const pruneTree = () => {
    const newBranches = gameState.branches.map(branch => ({
      ...branch,
      health: Math.max(0, branch.health - 10)
    }));
    setGameState(prev => ({
      ...prev,
      branches: newBranches,
      lastPruned: new Date(),
      health: Math.max(0, prev.health - 5) // La poda reduce ligeramente la salud
    }));
    setNotification('Has podado el árbol.');
  };
  const changeTreeStyle = (newStyle) => {
    if (gameState.growth < BONSAI_STYLES[newStyle].difficulty * 10) {
      setNotification('El árbol necesita crecer más para adoptar este estilo');
      return;
    }

    setGameState(prev => ({
      ...prev,
      style: newStyle,
      health: Math.max(0, prev.health - 10), // El cambio de estilo estresa al árbol
    }));

    initializeBranches();
    setShowStyleSelect(false);
    setNotification(`Estilo cambiado a ${BONSAI_STYLES[newStyle].name}`);
  };

  const changeTreeType = (newType) => {
    if (gameState.age < 10) {
      setNotification('Espera a que el árbol sea más maduro para cambiar su tipo');
      return;
    }

    setGameState(prev => ({
      ...prev,
      treeType: newType,
      health: 80, // El trasplante reduce la salud inicialmente
      growth: Math.max(0, prev.growth - 10),
    }));

    setShowTreeSelect(false);
    setNotification(`Tipo de árbol cambiado a ${TREE_TYPES[newType].name}`);
  };


  const renderBonsaiTree = () => {
    const scale = 1 + gameState.growth / 100;
    const treeProps = TREE_TYPES[gameState.treeType];
    const style = BONSAI_STYLES[gameState.style];
    const healthColor = treeProps.color;
    
    const backFoliage = generateFoliagePoints(gameState.age, gameState.health, gameState.treeType, style, 'back');
    const middleFoliage = generateFoliagePoints(gameState.age * 0.9, gameState.health, gameState.treeType, style, 'middle');
    const frontFoliage = generateFoliagePoints(gameState.age * 0.85, gameState.health, gameState.treeType, style, 'front');
    
    const renderFoliageLayer = (points, depth) => {
      const depthStyles = {
        back: {
          opacity: 0.7,
          scale: 1.1,
          zIndex: 0,
          blur: '1px',
          offsetX: -5,
        },
        middle: {
          opacity: 0.85,
          scale: 1,
          zIndex: 2,
          blur: '0px',
          offsetX: 0,
        },
        front: {
          opacity: 1,
          scale: 0.9,
          zIndex: 4,
          blur: '0px',
          offsetX: 5,
        }
      };
      
      const style = depthStyles[depth];
      
      return points.map((point, index) => (
        <div
          key={`${depth}-${index}`}
          className="absolute rounded-full transition-all duration-500"
          style={{
            backgroundColor: healthColor,
            width: `${point.size * style.scale}px`,
            height: `${point.size * style.scale}px`,
            left: '50%',
            bottom: '0',
            transform: `translate(${point.x + style.offsetX}px, ${point.y}px)`,
            opacity: point.opacity * style.opacity,
            filter: `blur(${style.blur})`,
            zIndex: style.zIndex,
            boxShadow: depth === 'front' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
          }}
        />
      ));
    };
    
    return (
      <div className="w-64 h-96 relative">
        {/* Maceta */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-16">
          <div className="w-full h-full bg-gradient-to-b from-orange-600 to-orange-700 rounded-b-lg shadow-lg"></div>
          <div className="w-full h-2 bg-orange-800 rounded-t-lg shadow-md"></div>
        </div>
  
        {/* Contenedor principal del árbol */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-64 h-80">
          {/* Tronco - Ahora posicionado correctamente */}
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-32 transition-all duration-500"
            style={{
              background: "linear-gradient(to right, #654321, #8B4513, #654321)",
              borderRadius: "4px",
              transform: `rotate(${style.trunkAngle}deg)`,
              transformOrigin: 'bottom',
              boxShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              zIndex: 1,
            }}
          >
            {/* Textura del tronco */}
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(0,0,0,0.1) 2px,
                  rgba(0,0,0,0.1) 4px
                )`,
                borderRadius: "4px",
              }}
            />
          </div>

          {/* Contenedor del follaje con capas */}
          <div 
            className="absolute w-96 h-96"
            style={{
              left: '50%',
              bottom: '32px', // Ajustado para que el follaje se conecte con el tronco
              transform: `rotate(${style.trunkAngle}deg) translate(-50%, 0) scale(${scale})`,
              transformOrigin: 'bottom',
            }}
          >
            {/* Capa de follaje trasera */}
            <div className="absolute w-full h-full" style={{ zIndex: 0 }}>
              {renderFoliageLayer(backFoliage, 'back')}
            </div>
  
            {/* Capa de follaje media */}
            <div className="absolute w-full h-full" style={{ zIndex: 2 }}>
              {renderFoliageLayer(middleFoliage, 'middle')}
            </div>
  
            {/* Capa de follaje frontal */}
            <div className="absolute w-full h-full" style={{ zIndex: 3 }}>
              {renderFoliageLayer(frontFoliage, 'front')}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const generateFoliagePoints = (age, health, treeType, style, depth) => {
    const treeProps = TREE_TYPES[treeType];
    const healthFactor = health / 100;
    const basePoints = Math.min(age * 3, 150);
    const numPoints = Math.floor(basePoints * healthFactor);
    const points = [];
    
    // Ajustar dimensiones según la profundidad
    const depthFactors = {
      back: { width: 1.2, height: 1.1, offset: -10 },
      middle: { width: 1, height: 1, offset: 0 },
      front: { width: 0.9, height: 0.9, offset: 10 }
    };
    
    const factor = depthFactors[depth];
    const maxWidth = Math.min(60 + age * 1.5, 180) * factor.width;
    const maxHeight = Math.min(70 + age * 2, 220) * factor.height;
    
    // Comenzar desde un punto más bajo en el tronco
    const trunkHeight = 32;
    const startFromTrunk = trunkHeight * 0.3; // Comenzar desde el 30% del tronco
    const trunkAngle = style.trunkAngle * (Math.PI / 180);
    const startX = Math.sin(trunkAngle) * startFromTrunk + factor.offset;
    const startY = -Math.cos(trunkAngle) * startFromTrunk;
    
    switch (treeProps.foliageShape) {
      case 'triangular':
        for (let i = 0; i < numPoints; i++) {
          const heightPercent = i / numPoints;
          const currentLayerWidth = maxWidth * (1.2 - heightPercent);
          const angle = (i * 137.5 + (depth === 'back' ? 30 : depth === 'front' ? -30 : 0)) * (Math.PI / 180);
          
          const radius = currentLayerWidth * (Math.random() * 0.8 + 0.2);
          const x = startX + Math.cos(angle) * radius;
          const y = startY - heightPercent * maxHeight;
          
          points.push({
            x,
            y,
            size: 10 + Math.random() * 8 * (1 - heightPercent * 0.5),
            opacity: 0.7 + Math.random() * 0.3,
          });
        }
        break;
        
      case 'round':
        for (let i = 0; i < numPoints; i++) {
          const angle = (i * 137.5 + (depth === 'back' ? 20 : depth === 'front' ? -20 : 0)) * (Math.PI / 180);
          const radiusFactor = Math.sin((i / numPoints) * Math.PI) * 1.2;
          const radius = maxWidth * radiusFactor * (Math.random() * 0.8 + 0.2);
          
          const x = startX + Math.cos(angle) * radius;
          const y = startY - Math.sin(angle) * maxHeight * 0.85;
          
          points.push({
            x,
            y,
            size: 12 + Math.random() * 10,
            opacity: 0.6 + Math.random() * 0.4,
          });
        }
        break;
        
      case 'irregular':
        for (let i = 0; i < numPoints; i++) {
          const angle = (i * 137.5 + (depth === 'back' ? 25 : depth === 'front' ? -25 : 0)) * (Math.PI / 180);
          const heightVar = Math.random() * maxHeight * 1.2;
          const widthVar = Math.random() * maxWidth * 1.1;
          
          const x = startX + Math.cos(angle) * widthVar * 0.8;
          const y = startY - heightVar * 0.9;
          
          points.push({
            x,
            y,
            size: 9 + Math.random() * 9,
            opacity: 0.5 + Math.random() * 0.5,
          });
        }
        break;
    }
    
    return points;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-white/90 shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-emerald-800 text-center">
            Bonsái Virtual
          </CardTitle>
          <div className="flex justify-center space-x-2 text-sm text-gray-600">
            <span>{TREE_TYPES[gameState.treeType].name}</span>
            <span>•</span>
            <span>{BONSAI_STYLES[gameState.style].name}</span>
            <span>•</span>
            <span>{gameState.age.toFixed(1)} años</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Área del Bonsai */}
          <div className="relative h-[400px] bg-gradient-to-b from-sky-50 to-emerald-50 rounded-xl p-8 flex items-center justify-center">
            {renderBonsaiTree()}
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-gray-700">Salud</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${gameState.health}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{gameState.health}%</span>
            </div>

            <div className="stat-card bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center space-x-2 mb-2">
                <Droplet className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-700">Agua</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${gameState.water}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{gameState.water.toFixed(1)}%</span>
            </div>

            <div className="stat-card bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-700">Luz Solar</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${gameState.sunlight}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{gameState.sunlight.toFixed(1)}%</span>
            </div>
          </div>

          {/* Notificaciones */}
          {notification && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <AlertDescription className="text-emerald-800">{notification}</AlertDescription>
            </Alert>
          )}

          {/* Controles Principales */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={waterTree}
              className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-105"
            >
              <Droplet className="w-4 h-4 mr-2" />
              Regar
            </Button>
            <Button
              onClick={provideSunlight}
              className="bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-200 transform hover:scale-105"
            >
              <Sun className="w-4 h-4 mr-2" />
              Luz Solar
            </Button>
            <Button
              onClick={pruneTree}
              className="bg-green-500 hover:bg-green-600 text-white transition-all duration-200 transform hover:scale-105"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Podar
            </Button>
          </div>

          {/* Opciones Avanzadas */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setShowStyleSelect(!showStyleSelect)}
              variant="outline"
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Cambiar Estilo
            </Button>
            <Button
              onClick={() => setShowTreeSelect(!showTreeSelect)}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <TreePine className="w-4 h-4 mr-2" />
              Cambiar Tipo
            </Button>
          </div>

          {/* Selectores de Estilo y Tipo */}
          {showStyleSelect && (
            <div className="bg-yellow-50 p-4 rounded-xl">
              <h4 className="font-semibold mb-3 text-yellow-800">Seleccionar nuevo estilo:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(BONSAI_STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => changeTreeStyle(key)}
                    className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showTreeSelect && (
            <div className="bg-green-50 p-4 rounded-xl">
              <h4 className="font-semibold mb-3 text-green-800">Seleccionar nuevo tipo:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(TREE_TYPES).map(([key, tree]) => (
                  <button
                    key={key}
                    onClick={() => changeTreeType(key)}
                    className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                  >
                    {tree.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Información del Clima */}
          {currentWeather && (
            <div className="bg-sky-50 p-4 rounded-xl">
              <h4 className="font-semibold mb-3 text-sky-800">Clima Actual</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-700">
                    {currentWeather.main.temp}°C
                  </div>
                  <div className="text-sm text-sky-600">Temperatura</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-700">
                    {currentWeather.main.humidity}%
                  </div>
                  <div className="text-sm text-sky-600">Humedad</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-700">
                    {currentWeather.wind.speed}
                  </div>
                  <div className="text-sm text-sky-600">Viento (m/s)</div>
                </div>
                <div className="text-center">
                  <div className="capitalize text-lg font-medium text-sky-700">
                    {currentWeather.weather[0].description}
                  </div>
                  <div className="text-sm text-sky-600">Condición</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style >{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default BonsaiGame;