import { Injectable } from '@angular/core';
import { SpacedRepetitionParams, SpacedRepetitionResult, ResponseQuality, SpacedRepetitionAlgorithm, Flashcard } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SpacedRepetitionService {

  /**
   * Calculate next review parameters using SM-2 algorithm
   */
  calculateSM2(params: SpacedRepetitionParams): SpacedRepetitionResult {
    const { interval, repetitions, easeFactor, quality } = params;
    
    let newInterval: number;
    let newRepetitions: number;
    let newEaseFactor: number;

    // Calculate new ease factor
    newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    if (quality < 3) {
      // Incorrect response - reset repetitions and set short interval
      newRepetitions = 0;
      newInterval = 1;
    } else {
      // Correct response
      newRepetitions = repetitions + 1;
      
      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReview
    };
  }

  /**
   * Calculate next review parameters using FSRS (Free Spaced Repetition Scheduler)
   * Simplified implementation - full FSRS is more complex
   */
  calculateFSRS(params: SpacedRepetitionParams): SpacedRepetitionResult {
    const { interval, repetitions, easeFactor, quality } = params;
    
    // FSRS parameters (simplified)
    const requestRetention = 0.9;
    const maximumInterval = 36500; // 100 years in days
    const weights = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];

    let newInterval: number;
    let newRepetitions: number;
    let newEaseFactor: number = easeFactor;

    if (quality < 3) {
      // Failed review
      newRepetitions = 0;
      newInterval = Math.max(1, Math.round(interval * 0.2));
    } else {
      // Successful review
      newRepetitions = repetitions + 1;
      
      // Calculate stability based on quality and previous interval
      const stability = this.calculateStability(interval, quality, repetitions, weights);
      
      // Calculate interval based on desired retention
      newInterval = Math.min(maximumInterval, Math.round(stability * Math.log(requestRetention) / Math.log(0.9)));
      newInterval = Math.max(1, newInterval);
      
      // Update ease factor based on performance
      newEaseFactor = Math.max(1.3, easeFactor + (quality - 3) * 0.1);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReview
    };
  }

  private calculateStability(interval: number, quality: ResponseQuality, repetitions: number, weights: number[]): number {
    // Simplified stability calculation
    if (repetitions === 0) {
      return weights[0] + weights[1] * (quality - 1);
    }
    
    const difficultyFactor = weights[2] * (quality - 3);
    const stabilityFactor = weights[3] * Math.pow(interval, weights[4]);
    
    return Math.max(0.1, stabilityFactor + difficultyFactor);
  }

  /**
   * Calculate next review using specified algorithm
   */
  calculateNextReview(card: Flashcard, quality: ResponseQuality, algorithm: SpacedRepetitionAlgorithm = SpacedRepetitionAlgorithm.SM2): SpacedRepetitionResult {
    const params: SpacedRepetitionParams = {
      interval: card.interval,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      quality
    };

    switch (algorithm) {
      case SpacedRepetitionAlgorithm.FSRS:
        return this.calculateFSRS(params);
      case SpacedRepetitionAlgorithm.SM2:
      default:
        return this.calculateSM2(params);
    }
  }

  /**
   * Get optimal review queue based on due dates and priorities
   */
  getOptimalReviewQueue(cards: Flashcard[], maxCards: number = 50): Flashcard[] {
    const now = new Date();
    
    // Filter cards that are due for review
    const dueCards = cards.filter(card => {
      if (!card.nextReview) return true;
      return card.nextReview <= now;
    });

    // Sort by priority: overdue cards first, then by ease factor (harder cards first)
    const sortedCards = dueCards.sort((a, b) => {
      const aOverdue = a.nextReview ? Math.max(0, now.getTime() - a.nextReview.getTime()) : 0;
      const bOverdue = b.nextReview ? Math.max(0, now.getTime() - b.nextReview.getTime()) : 0;
      
      // First, sort by how overdue they are
      if (aOverdue !== bOverdue) {
        return bOverdue - aOverdue;
      }
      
      // Then by difficulty (lower ease factor = harder card)
      return a.easeFactor - b.easeFactor;
    });

    return sortedCards.slice(0, maxCards);
  }

  /**
   * Calculate study session statistics
   */
  calculateSessionStats(cards: Flashcard[], responses: ResponseQuality[]): {
    accuracy: number;
    averageQuality: number;
    easyCards: number;
    hardCards: number;
    totalTime: number;
  } {
    if (cards.length === 0 || responses.length === 0) {
      return {
        accuracy: 0,
        averageQuality: 0,
        easyCards: 0,
        hardCards: 0,
        totalTime: 0
      };
    }

    const correctResponses = responses.filter(q => q >= 3).length;
    const accuracy = correctResponses / responses.length;
    const averageQuality = responses.reduce((sum, q) => sum + q, 0) / responses.length;
    const easyCards = responses.filter(q => q >= 4).length;
    const hardCards = responses.filter(q => q <= 2).length;

    return {
      accuracy,
      averageQuality,
      easyCards,
      hardCards,
      totalTime: 0 // Would be calculated based on actual session timing
    };
  }

  /**
   * Predict retention rate for a card
   */
  predictRetention(card: Flashcard, daysFromNow: number = 0): number {
    const daysSinceLastReview = card.lastReviewed 
      ? (Date.now() - card.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    
    const totalDays = daysSinceLastReview + daysFromNow;
    
    // Exponential decay model based on ease factor and interval
    const decayRate = 1 / (card.easeFactor * card.interval);
    const retention = Math.exp(-decayRate * totalDays);
    
    return Math.max(0, Math.min(1, retention));
  }

  /**
   * Suggest optimal study schedule
   */
  suggestStudySchedule(cards: Flashcard[], targetDailyCards: number = 20): {
    newCards: number;
    reviewCards: number;
    estimatedTime: number;
  } {
    const now = new Date();
    const dueForReview = cards.filter(card => 
      card.nextReview && card.nextReview <= now
    ).length;
    
    const newCards = Math.max(0, targetDailyCards - dueForReview);
    const reviewCards = Math.min(dueForReview, targetDailyCards);
    
    // Estimate 30 seconds per new card, 15 seconds per review card
    const estimatedTime = (newCards * 30 + reviewCards * 15) / 60; // in minutes
    
    return {
      newCards,
      reviewCards,
      estimatedTime
    };
  }

  /**
   * Calculate learning progress metrics
   */
  calculateProgress(cards: Flashcard[]): {
    totalCards: number;
    newCards: number;
    learningCards: number;
    matureCards: number;
    averageEaseFactor: number;
    retentionRate: number;
  } {
    const totalCards = cards.length;
    const newCards = cards.filter(c => c.repetitions === 0).length;
    const learningCards = cards.filter(c => c.repetitions > 0 && c.repetitions < 3).length;
    const matureCards = cards.filter(c => c.repetitions >= 3).length;
    
    const averageEaseFactor = cards.length > 0
      ? cards.reduce((sum, c) => sum + c.easeFactor, 0) / cards.length
      : 2.5;
    
    // Simple retention calculation based on cards reviewed in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyReviewed = cards.filter(c => 
      c.lastReviewed && c.lastReviewed >= thirtyDaysAgo
    );
    
    const retentionRate = recentlyReviewed.length > 0
      ? recentlyReviewed.filter(c => c.easeFactor >= 2.5).length / recentlyReviewed.length
      : 1;

    return {
      totalCards,
      newCards,
      learningCards,
      matureCards,
      averageEaseFactor,
      retentionRate
    };
  }
}