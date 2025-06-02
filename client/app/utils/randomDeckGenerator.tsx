"use client";
import shuffleArray from './shuffleArray';
import packOfCards from './packOfCards';


const deck = packOfCards();

export default function randomDeckGenerator(): string[] {
    const shuffledDeck = shuffleArray(deck);

  return shuffledDeck;
}

