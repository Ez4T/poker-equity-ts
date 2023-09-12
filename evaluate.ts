import { evaluateCardsFast, evaluateCards } from 'phe';
import { cardRanks, cardSuits } from './constant.ts';

const decks: string[] = [];

for (let i = 0; i < cardRanks.length; i++) {
  for (let j = 0; j < cardSuits.length; j++) {
    decks.push(cardRanks[i] + cardSuits[j]);
  }
}

function isSuited(card: string): boolean {
  return card.includes('s');
}

function isOffSuited(card: string): boolean {
  return card.includes('o');
}

function isPair(card: string): boolean {
  return card[0] === card[1];
}

function extractCardsFromType(card: string, weight: number): Array<string[]> {
  const cards: Array<string[]> = [];
  if (isPair(card)) {
    for (let i = 0; i < cardSuits.length; i++) {
      for (let j = i + 1; j < cardSuits.length; j++) {
        cards.push([card[0] + cardSuits[i], card[1] + cardSuits[j]]);
      }
    }
  }

  if (isSuited(card)) {
    for (let i = 0; i < cardSuits.length; i++) {
      cards.push([card[0] + cardSuits[i], card[1] + cardSuits[i]]);
    }
  }

  if (isOffSuited(card)) {
    for (let i = 0; i < cardSuits.length; i++) {
      for (let j = 0; j < cardSuits.length; j++) {
        if (cardSuits[i] !== cardSuits[j]) {
          cards.push([card[0] + cardSuits[i], card[1] + cardSuits[j]]);
        }
      }
    }
  }

  if (weight < 100) {
    const cardsToRemove = Math.floor(cards.length * (1 - weight / 100));
    cards.splice(0, cardsToRemove);
  }

  return cards;
}

function getCardsFromRange(range: string[], weight: number[]): Array<string[]> {
  const cards: Array<string[]> = [];
  range.forEach((cardCombo: string, index: number): void => {
    const result = extractCardsFromType(cardCombo, weight[index]);
    cards.push(...result);
  });
  return cards;
}

function randomCardFromRange(range: Array<string[]>): string[] {
  const random = Math.floor(Math.random() * range.length);
  return range[random];
}

// shuffle deck
function shuffle(deck: string[]): string[] {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[random]] = [shuffledDeck[random], shuffledDeck[i]];
  }
  return shuffledDeck;
};

/**
 * 
 * @param handData 
 * 
 * @returns 99 if tie, else return index of winner
 */
export function evaluateRange(handData: Array<[string[], number[]]>): number {
  const allCards: string[] = [];

  // get player cards from range
  const playerRangeCards = handData.map(([range, weight]: [string[], number[]]): Array<string[]> => {
    return getCardsFromRange(range, weight);
  });

  // deal cards to player
  let playersCard: Array<string[]> = [];
  const contains_duplicates = (arr: any) => new Set(arr).size !== arr.length;

  while (true) {
    const allPlayerCards: string[] = [];
    for (let i = 0; i < playerRangeCards.length; i++) {
      const card = randomCardFromRange(playerRangeCards[i]);
      playersCard.push(card);
      allPlayerCards.push(...card);
    }
    if (contains_duplicates(allPlayerCards)) {
      playersCard = [];
      continue;
    }
    allCards.push(...allPlayerCards);
    break;
  }

  // shuffle deck
  const deck = shuffle([...decks].filter((card: string): boolean => !allCards.includes(card)));
  
  // deal cards to board
  const boardCards: string[] = [];
  while (boardCards.length < 5) {
    const card = deck.pop();
    if (!card) {
      throw new Error('Deck is empty');
    }
    boardCards.push(card);
  }

  let result = 0; // 0 is win, 1 is lose, 99 is tie
  const heroHand = playersCard[0];
  const heroHandRank = evaluateCardsFast([...heroHand, ...boardCards]);

  const villainHandsRank = playersCard[1];
  const villainHandRank = evaluateCardsFast([...villainHandsRank, ...boardCards]);

  if (villainHandRank < heroHandRank) {
    result = 1;
    return result;
  }

  if (villainHandRank === heroHandRank) {
    result = 99;
  }

  return result;
}