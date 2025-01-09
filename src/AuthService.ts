export class AuthService {
  private static instance: AuthService | null = null;
  private currentUser: string | null = null;
  private readonly USERS_KEY = 'racing_users';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public login(username: string): void {
    this.currentUser = username;
    const users = this.getUsers();
    if (!users.includes(username)) {
      users.push(username);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
    this.updateUserDisplay();
  }

  private getUsers(): string[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  public getCurrentUser(): string | null {
    return this.currentUser;
  }

  private updateUserDisplay(): void {
    let userDisplay = document.getElementById('userDisplay');
    if (!userDisplay) {
      userDisplay = document.createElement('div');
      userDisplay.id = 'userDisplay';
      document.body.appendChild(userDisplay);
    }
    userDisplay.textContent = `Player: ${this.currentUser}`;
  }
}