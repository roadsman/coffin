export class RateLimitPredictor {
  private history: Array<{ timestamp: number; remaining: number }> = [];
  private maxHistory = 10;

  record(remaining: number) {
    this.history.push({
      timestamp: Date.now(),
      remaining
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  predict(requestsNeeded: number): number {
    if (this.history.length < 2) {
      return 0;
    }

    const recent = this.history.slice(-5);
    const intervals: number[] = [];
    
    for (let i = 1; i < recent.length; i++) {
      const timeDiff = recent[i].timestamp - recent[i - 1].timestamp;
      const remainingDiff = recent[i - 1].remaining - recent[i].remaining;
      
      if (remainingDiff > 0) {
        intervals.push(timeDiff / remainingDiff);
      }
    }

    if (intervals.length === 0) {
      return 0;
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.ceil(avgInterval * requestsNeeded);
  }

  shouldWait(remaining: number, threshold: number = 5): boolean {
    return remaining <= threshold;
  }

  clear() {
    this.history = [];
  }
}
