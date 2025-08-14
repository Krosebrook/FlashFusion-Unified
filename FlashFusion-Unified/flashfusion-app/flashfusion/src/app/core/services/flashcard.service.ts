import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, limit, startAfter, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from, combineLatest } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Flashcard, Deck, DeckSettings, StudySession, ReviewResult, UserProgress, DifficultyLevel, LearningPhase, SpacedRepetitionAlgorithm, ResponseQuality } from '../models';
import { AuthService } from './auth.service';
import { SpacedRepetitionService } from './spaced-repetition.service';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private spacedRepetitionService = inject(SpacedRepetitionService);

  private decksSubject = new BehaviorSubject<Deck[]>([]);
  private flashcardsSubject = new BehaviorSubject<Flashcard[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  readonly decks$ = this.decksSubject.asObservable();
  readonly flashcards$ = this.flashcardsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // Deck Operations
  async createDeck(deckData: Omit<Deck, 'id' | 'userId' | 'created' | 'updated' | 'cardCount'>): Promise<Deck> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const now = new Date();
      const defaultSettings: DeckSettings = {
        maxNewCardsPerDay: 20,
        maxReviewCardsPerDay: 100,
        showAnswerTimer: false,
        algorithm: SpacedRepetitionAlgorithm.SM2,
        difficultyModifiers: [],
        autoAdvance: false,
        shuffleCards: true
      };

      const deck: Omit<Deck, 'id'> = {
        ...deckData,
        userId,
        cardCount: 0,
        created: now,
        updated: now,
        settings: { ...defaultSettings, ...deckData.settings }
      };

      const docRef = await addDoc(collection(this.firestore, 'decks'), deck);
      const newDeck: Deck = { ...deck, id: docRef.id };

      // Update local state
      const currentDecks = this.decksSubject.value;
      this.decksSubject.next([...currentDecks, newDeck]);

      return newDeck;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create deck';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateDeck(deckId: string, updates: Partial<Deck>): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const deckRef = doc(this.firestore, 'decks', deckId);
      const updateData = {
        ...updates,
        updated: new Date()
      };

      await updateDoc(deckRef, updateData);

      // Update local state
      const currentDecks = this.decksSubject.value;
      const updatedDecks = currentDecks.map(deck =>
        deck.id === deckId ? { ...deck, ...updateData } : deck
      );
      this.decksSubject.next(updatedDecks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update deck';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteDeck(deckId: string): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      // Delete all flashcards in the deck first
      const flashcardsQuery = query(
        collection(this.firestore, 'flashcards'),
        where('deckId', '==', deckId)
      );
      const flashcardsSnapshot = await getDocs(flashcardsQuery);
      
      const deletePromises = flashcardsSnapshot.docs.map(docSnap =>
        deleteDoc(doc(this.firestore, 'flashcards', docSnap.id))
      );
      await Promise.all(deletePromises);

      // Delete the deck
      await deleteDoc(doc(this.firestore, 'decks', deckId));

      // Update local state
      const currentDecks = this.decksSubject.value;
      const filteredDecks = currentDecks.filter(deck => deck.id !== deckId);
      this.decksSubject.next(filteredDecks);

      // Remove flashcards from local state
      const currentFlashcards = this.flashcardsSubject.value;
      const filteredFlashcards = currentFlashcards.filter(card => card.deckId !== deckId);
      this.flashcardsSubject.next(filteredFlashcards);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete deck';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadUserDecks(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const decksQuery = query(
        collection(this.firestore, 'decks'),
        where('userId', '==', userId),
        orderBy('updated', 'desc')
      );

      const snapshot = await getDocs(decksQuery);
      const decks: Deck[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created: doc.data()['created']?.toDate() || new Date(),
        updated: doc.data()['updated']?.toDate() || new Date()
      })) as Deck[];

      this.decksSubject.next(decks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load decks';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // Flashcard Operations
  async createFlashcard(cardData: Omit<Flashcard, 'id' | 'userId' | 'created' | 'updated' | 'interval' | 'repetitions' | 'easeFactor' | 'learningPhase'>): Promise<Flashcard> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const now = new Date();
      const flashcard: Omit<Flashcard, 'id'> = {
        ...cardData,
        userId,
        created: now,
        updated: now,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        learningPhase: LearningPhase.NEW,
        isArchived: false
      };

      const docRef = await addDoc(collection(this.firestore, 'flashcards'), flashcard);
      const newFlashcard: Flashcard = { ...flashcard, id: docRef.id };

      // Update deck card count
      await this.updateDeckCardCount(cardData.deckId);

      // Update local state
      const currentFlashcards = this.flashcardsSubject.value;
      this.flashcardsSubject.next([...currentFlashcards, newFlashcard]);

      return newFlashcard;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create flashcard';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateFlashcard(cardId: string, updates: Partial<Flashcard>): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const cardRef = doc(this.firestore, 'flashcards', cardId);
      const updateData = {
        ...updates,
        updated: new Date()
      };

      await updateDoc(cardRef, updateData);

      // Update local state
      const currentFlashcards = this.flashcardsSubject.value;
      const updatedFlashcards = currentFlashcards.map(card =>
        card.id === cardId ? { ...card, ...updateData } : card
      );
      this.flashcardsSubject.next(updatedFlashcards);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update flashcard';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteFlashcard(cardId: string): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const currentFlashcards = this.flashcardsSubject.value;
      const cardToDelete = currentFlashcards.find(card => card.id === cardId);
      
      await deleteDoc(doc(this.firestore, 'flashcards', cardId));

      if (cardToDelete) {
        // Update deck card count
        await this.updateDeckCardCount(cardToDelete.deckId);
      }

      // Update local state
      const filteredFlashcards = currentFlashcards.filter(card => card.id !== cardId);
      this.flashcardsSubject.next(filteredFlashcards);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete flashcard';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadDeckFlashcards(deckId: string): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const flashcardsQuery = query(
        collection(this.firestore, 'flashcards'),
        where('deckId', '==', deckId),
        where('isArchived', '==', false),
        orderBy('created', 'desc')
      );

      const snapshot = await getDocs(flashcardsQuery);
      const flashcards: Flashcard[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created: doc.data()['created']?.toDate() || new Date(),
        updated: doc.data()['updated']?.toDate() || new Date(),
        lastReviewed: doc.data()['lastReviewed']?.toDate(),
        nextReview: doc.data()['nextReview']?.toDate()
      })) as Flashcard[];

      this.flashcardsSubject.next(flashcards);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load flashcards';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  // Study Session Operations
  async reviewFlashcard(cardId: string, quality: ResponseQuality, responseTime: number): Promise<void> {
    const currentFlashcards = this.flashcardsSubject.value;
    const card = currentFlashcards.find(c => c.id === cardId);
    
    if (!card) throw new Error('Flashcard not found');

    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      // Calculate next review using spaced repetition
      const result = this.spacedRepetitionService.calculateNextReview(card, quality);
      
      // Determine learning phase
      let learningPhase: LearningPhase;
      if (result.repetitions === 0) {
        learningPhase = LearningPhase.RELEARNING;
      } else if (result.repetitions < 3) {
        learningPhase = LearningPhase.LEARNING;
      } else {
        learningPhase = LearningPhase.REVIEW;
      }

      // Update flashcard
      const updates: Partial<Flashcard> = {
        lastReviewed: new Date(),
        nextReview: result.nextReview,
        interval: result.interval,
        repetitions: result.repetitions,
        easeFactor: result.easeFactor,
        learningPhase,
        updated: new Date()
      };

      await this.updateFlashcard(cardId, updates);

      // Record review result
      await this.recordReviewResult({
        cardId,
        sessionId: '', // Would be provided by study session
        responseTime,
        quality,
        wasCorrect: quality >= 3,
        difficulty: card.difficulty,
        timestamp: new Date(),
        previousInterval: card.interval,
        newInterval: result.interval,
        newEaseFactor: result.easeFactor
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to review flashcard';
      this.errorSubject.next(errorMessage);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async recordReviewResult(result: ReviewResult): Promise<void> {
    await addDoc(collection(this.firestore, 'reviewResults'), result);
  }

  private async updateDeckCardCount(deckId: string): Promise<void> {
    const flashcardsQuery = query(
      collection(this.firestore, 'flashcards'),
      where('deckId', '==', deckId),
      where('isArchived', '==', false)
    );
    
    const snapshot = await getDocs(flashcardsQuery);
    const cardCount = snapshot.size;

    await updateDoc(doc(this.firestore, 'decks', deckId), {
      cardCount,
      updated: new Date()
    });
  }

  // Utility methods
  getDeckById(deckId: string): Deck | undefined {
    return this.decksSubject.value.find(deck => deck.id === deckId);
  }

  getFlashcardById(cardId: string): Flashcard | undefined {
    return this.flashcardsSubject.value.find(card => card.id === cardId);
  }

  getDueFlashcards(deckId?: string): Flashcard[] {
    const now = new Date();
    let flashcards = this.flashcardsSubject.value;
    
    if (deckId) {
      flashcards = flashcards.filter(card => card.deckId === deckId);
    }
    
    return flashcards.filter(card => {
      if (!card.nextReview) return true;
      return card.nextReview <= now;
    });
  }

  getNewFlashcards(deckId?: string): Flashcard[] {
    let flashcards = this.flashcardsSubject.value;
    
    if (deckId) {
      flashcards = flashcards.filter(card => card.deckId === deckId);
    }
    
    return flashcards.filter(card => card.learningPhase === LearningPhase.NEW);
  }

  getStudyQueue(deckId: string, maxCards: number = 50): Flashcard[] {
    const deckFlashcards = this.flashcardsSubject.value.filter(card => card.deckId === deckId);
    return this.spacedRepetitionService.getOptimalReviewQueue(deckFlashcards, maxCards);
  }
}