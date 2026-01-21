import { Message } from '../types';

// This file is no longer used for initial state, but can be kept for reference or future seeding.
// The initial state is now managed by chatService.ts, which checks localStorage.
export const initialMessageHistory: Record<number, Message[]> = {};
