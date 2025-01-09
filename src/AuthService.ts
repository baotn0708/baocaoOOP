import { GameDifficulty } from './Diff';

interface UserData {
    username: string;
    createdAt: number;
    records: {
      [GameDifficulty.EASY]: number | null;
      [GameDifficulty.NORMAL]: number | null;
      [GameDifficulty.HARD]: number | null;
    };
  }
  
  // Old data format
  interface LegacyUserData {
    username: string;
    fastLapTime?: number;
    createdAt?: number;
  }

export class AuthService {
  private static instance: AuthService | null = null;
  private currentUser: string | null = null;
  private currentDifficulty: GameDifficulty = GameDifficulty.NORMAL;
  private readonly USERS_KEY = 'racing_users';

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public login(username: string): void {
    this.currentUser = username;
    const users = this.getUsers();
    
    if (!users[username]) {
      users[username] = {
        username,
        createdAt: Date.now(),
        records: {
          [GameDifficulty.EASY]: null,
          [GameDifficulty.NORMAL]: null,
          [GameDifficulty.HARD]: null
        }
      };
    }
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }
  public setDifficulty(difficulty: GameDifficulty): void {
    this.currentDifficulty = difficulty;
  }

  public getUserFastLap(): number | null {
    if (!this.currentUser || !this.currentDifficulty) return null;
    
    const users = this.getUsers();
    if (!users[this.currentUser]?.records) return null;
    
    return users[this.currentUser].records[this.currentDifficulty] ?? null;
  }

  public updateUserFastLap(time: number): void {
    if (!this.currentUser || !this.currentDifficulty) return;
    
    const users = this.getUsers();
    if (!users[this.currentUser]) {
      this.login(this.currentUser);
      return;
    }

    users[this.currentUser].records[this.currentDifficulty] = time;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  public getAllUsers(): UserData[] {
    const users = this.getUsers();
    return Object.values(users).filter(user => user && user.username);
  }
  private getUsers(): Record<string, UserData> {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      const users = stored ? JSON.parse(stored) : {};
      
      // Ensure all users have proper structure
      Object.keys(users).forEach(username => {
        if (!users[username].records) {
          users[username].records = {
            [GameDifficulty.EASY]: null,
            [GameDifficulty.NORMAL]: null,
            [GameDifficulty.HARD]: null
          };
        }
        if (!users[username].createdAt) {
          users[username].createdAt = Date.now();
        }
      });
      
      // Save fixed structure back to storage
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return users;
    } catch (error) {
      console.error('Error loading users:', error);
      return {};
    }
  }
  public logout(): void {
    this.currentUser = null;
    this.currentDifficulty = GameDifficulty.NORMAL;
  }
}