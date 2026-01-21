
import { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: 1,
    authorId: 2, // Rahul Sharma
    text: "Just had an amazing weekend getaway to the mountains! Nothing beats the fresh air and stunning views. Feeling recharged and ready for the week ahead. 🏔️ #travel #mountains #weekendvibes",
    imageUrl: "https://picsum.photos/seed/post1/600/400",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    likes: [1, 3, 5],
    viewCount: 245,
    comments: [
      { 
        id: 101, 
        authorId: 3, 
        text: "Wow, that looks breathtaking!", 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        likes: [],
        replies: []
      },
      { 
        id: 102, 
        authorId: 1, 
        text: "So beautiful! I love hiking too.", 
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        likes: [2],
        replies: [
            {
                id: 1021,
                authorId: 2,
                text: "We should plan a trip sometime!",
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                likes: [],
                replies: []
            }
        ]
      }
    ]
  },
  {
    id: 2,
    authorId: 4, // Simran Kaur
    text: "Spent the afternoon sketching by the lake. It's my favorite way to unwind and let creativity flow. What do you all do to relax?",
    imageUrl: "https://picsum.photos/seed/post2/600/400",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    likes: [2, 6, 7],
    viewCount: 189,
    comments: []
  },
  {
    id: 3,
    authorId: 6, // John Pinto
    text: "Experimented with a new pasta recipe tonight and it turned out delicious! 👨‍🍳 There's something so therapeutic about cooking.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    likes: [1, 4],
    viewCount: 92,
    comments: [
        { 
            id: 103, 
            authorId: 5, 
            text: "Looks amazing, chef! Can you share the recipe?", 
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            likes: [6],
            replies: []
        }
    ]
  }
];
