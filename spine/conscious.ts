export class ConsciousWorkspace {
  private capacity: number;
  private items: any[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  integrate(items: any[]): void {
    this.items = [...this.items, ...items].slice(-this.capacity);
  }

  snapshot(): any[] {
    return [...this.items];
  }

  apply(_decisions: any[]): void {
    // intentionally empty for now
  }
}
