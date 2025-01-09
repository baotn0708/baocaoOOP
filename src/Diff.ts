export enum GameDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

export interface DifficultySettings {
  fogDensity: number;
  drawDistance: number;
  totalCars: number;
}

export const DIFFICULTY_SETTINGS: Record<GameDifficulty, DifficultySettings> = {
  [GameDifficulty.EASY]: {
    fogDensity: 5,
    drawDistance: 300,
    totalCars: 5
  },
  [GameDifficulty.NORMAL]: {
    fogDensity: 20,
    drawDistance: 220,
    totalCars: 100
  },
  [GameDifficulty.HARD]: {
    fogDensity: 50,
    drawDistance: 100,
    totalCars: 200
  }
};