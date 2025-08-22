// Azure Speech Service Configuration
export const AZURE_SPEECH_CONFIG = {
    subscriptionKey1: 'AHTvEPSqER9ahxRD4nOkLDzeaPxwBaP4yVGHKX8UJqpov3GGQTJDJQQJ99BHACYeBjFXJ3w3AAAYACOGVXJi',
    subscriptionKey2: '1KPaW7otmHvGJXgu5e1QdZJOqgBFOR5VUILGy1TNXayogsee0yrsJQQJ99BHACYeBjFXJ3w3AAAYACOGIcU7',
    region: 'eastus',
    endpoint: 'https://eastus.api.cognitive.microsoft.com/'
  };
  
  // Minion Colors Theme
  export const MINION_COLORS = {
    primary: '#FFD700',     // Gold/Yellow
    secondary: '#FF6B35',   // Orange
    accent: '#FF4081',      // Pink
    background: '#F5F5F5',  // Light Gray
    text: '#2E2E2E',        // Dark Gray
    success: '#4CAF50',     // Green
    warning: '#FF9800',     // Amber
    error: '#F44336',       // Red
    white: '#FFFFFF',
    black: '#000000'
  };
  
  // Voice Commands Configuration
  export const VOICE_COMMANDS = [
    {
      phrase: 'forward',
      command: 'FORWARD',
      description: 'Move robot forward'
    },
    {
      phrase: 'backward',
      command: 'BACKWARD',
      description: 'Move robot backward'
    },
    {
      phrase: 'back',
      command: 'BACKWARD',
      description: 'Move robot backward'
    },
    {
      phrase: 'left',
      command: 'LEFT',
      description: 'Turn robot left'
    },
    {
      phrase: 'right',
      command: 'RIGHT',
      description: 'Turn robot right'
    },
    {
      phrase: 'stop',
      command: 'STOP',
      description: 'Stop robot movement'
    },
    {
      phrase: 'halt',
      command: 'STOP',
      description: 'Stop robot movement'
    },
    {
      phrase: 'game mode',
      command: 'MODE_GAME',
      description: 'Switch to game mode'
    },
    {
      phrase: 'play mode',
      command: 'MODE_PLAY',
      description: 'Switch to play mode'
    },
    {
      phrase: 'entertainment mode',
      command: 'MODE_ENTERTAINMENT',
      description: 'Switch to entertainment mode'
    },
    {
      phrase: 'dance',
      command: 'DANCE',
      description: 'Make robot dance'
    },
    {
      phrase: 'spin',
      command: 'SPIN',
      description: 'Make robot spin'
    },
    {
      phrase: 'faster',
      command: 'SPEED_UP',
      description: 'Increase robot speed'
    },
    {
      phrase: 'slower',
      command: 'SPEED_DOWN',
      description: 'Decrease robot speed'
    }
  ];
  
  // Connection timeout settings
  export const CONNECTION_TIMEOUTS = {
    BLUETOOTH_SCAN: 10000,      // 10 seconds
    BLUETOOTH_CONNECT: 15000,   // 15 seconds
    SPEECH_INIT: 10000,         // 10 seconds
    COMMAND_SEND: 5000          // 5 seconds
  };
  
  // Robot command constants
  export const ROBOT_COMMANDS = {
    // Movement commands
    FORWARD: 'FORWARD',
    BACKWARD: 'BACKWARD',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    STOP: 'STOP',
    
    // Mode commands
    MODE_GAME: 'MODE_GAME',
    MODE_PLAY: 'MODE_PLAY',
    MODE_ENTERTAINMENT: 'MODE_ENTERTAINMENT',
    
    // Action commands
    DANCE: 'DANCE',
    SPIN: 'SPIN',
    SPEED_UP: 'SPEED_UP',
    SPEED_DOWN: 'SPEED_DOWN'
  } as const;