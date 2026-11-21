export class Bucket {
  limit: number = -1;
  remaining: number = 1;
  reset: number = -1;
  resetAfter: number = -1;

  async wait(): Promise<void> {
    const now = Date.now();
    
    if (this.reset !== -1 && now >= this.reset) {
      this.remaining = this.limit;
      this.reset = -1;
    }

    if (this.remaining <= 0 && this.reset !== -1 && now < this.reset) {
      const delay = Math.max(0, this.reset - now);
      await this.sleep(delay);
      this.remaining = this.limit;
      this.reset = -1;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
