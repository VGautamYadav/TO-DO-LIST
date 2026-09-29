import { toISODateString } from '../utils/dateUtils';

const today = toISODateString(new Date());

const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = toISODateString(yesterdayDate);

const twoDaysAgoDate = new Date();
twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
const twoDaysAgo = toISODateString(twoDaysAgoDate);

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = toISODateString(tomorrowDate);

const nextWeekDate = new Date();
nextWeekDate.setDate(nextWeekDate.getDate() + 4);
const nextWeek = toISODateString(nextWeekDate);

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Finish Java assignment',
    description: 'Implement binary search tree operations and write test cases for edge cases.',
    category: 'college',
    priority: 'high',
    dueDate: today,
    dueTime: '20:00',
    reminder: '30m',
    repeat: 'none',
    pinned: true,
    completed: false,
    completedAt: null,
    tags: ['college', 'java', 'urgent'],
    subtasks: [
      { id: 'sub-1-1', title: 'Implement insert and delete BST nodes', completed: true },
      { id: 'sub-1-2', title: 'Write in-order & pre-order traversals', completed: true },
      { id: 'sub-1-3', title: 'Add JUnit test suite', completed: false },
      { id: 'sub-1-4', title: 'Generate PDF lab report', completed: false },
    ],
    notes: 'Professor mentioned tree balance questions might be on the upcoming exam.',
    createdAt: new Date().toISOString(),
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), text: 'Task created' }
    ]
  },
  {
    id: 'task-2',
    title: 'Work on portfolio',
    description: 'Polish modern portfolio with glassmorphism UI, interactive project cards, and live contact form.',
    category: 'personal',
    priority: 'medium',
    dueDate: today,
    dueTime: '22:00',
    reminder: '15m',
    repeat: 'none',
    pinned: true,
    completed: false,
    completedAt: null,
    tags: ['portfolio', 'coding', 'project'],
    subtasks: [
      { id: 'sub-2-1', title: 'Finish hero section', completed: true },
      { id: 'sub-2-2', title: 'Add projects gallery', completed: true },
      { id: 'sub-2-3', title: 'Add downloadable resume', completed: true },
      { id: 'sub-2-4', title: 'Add contact form validation', completed: false },
      { id: 'sub-2-5', title: 'Deploy website to Vercel', completed: false },
    ],
    notes: 'Target 3 / 5 subtasks completed initially to showcase subtask progress meter.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), text: 'Task created' }
    ]
  },
  {
    id: 'task-3',
    title: 'Go to gym - Push day',
    description: 'Bench press, incline dumbbell press, lateral raises, triceps pushdowns.',
    category: 'health',
    priority: 'low',
    dueDate: today,
    dueTime: '18:30',
    reminder: '1h',
    repeat: 'weekdays',
    pinned: false,
    completed: false,
    completedAt: null,
    tags: ['health', 'fitness', 'routine'],
    subtasks: [
      { id: 'sub-3-1', title: 'Warm-up & dynamic stretching (10 mins)', completed: false },
      { id: 'sub-3-2', title: 'Heavy compound sets', completed: false },
      { id: 'sub-3-3', title: 'Cooldown & hydration', completed: false },
    ],
    notes: 'Hydrate well before session. Aim for 80kg bench.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), text: 'Task created' }
    ]
  },
  {
    id: 'task-4',
    title: 'Prepare algorithm presentation',
    description: 'Slides for Graph Shortest Path algorithms (Dijkstra vs Bellman-Ford).',
    category: 'college',
    priority: 'high',
    dueDate: twoDaysAgo,
    dueTime: '15:00',
    reminder: 'at_due',
    repeat: 'none',
    pinned: false,
    completed: false,
    completedAt: null,
    tags: ['college', 'algorithms', 'exam'],
    subtasks: [
      { id: 'sub-4-1', title: 'Draw animation diagrams for Dijkstra', completed: true },
      { id: 'sub-4-2', title: 'Explain negative cycle detection', completed: false }
    ],
    notes: 'Needs quick reschedule!',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), text: 'Task created' }
    ]
  },
  {
    id: 'task-5',
    title: 'Review cloud architecture notes',
    description: 'Microservices, message queues, and distributed caching patterns.',
    category: 'coding',
    priority: 'medium',
    dueDate: today,
    dueTime: '11:00',
    reminder: 'none',
    repeat: 'none',
    pinned: false,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    tags: ['coding', 'study'],
    subtasks: [
      { id: 'sub-5-1', title: 'Read Redis caching patterns', completed: true },
      { id: 'sub-5-2', title: 'Kafka vs RabbitMQ trade-offs', completed: true }
    ],
    notes: 'Completed in the morning session.',
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    history: [
      { action: 'created', timestamp: new Date(Date.now() - 3600000 * 15).toISOString(), text: 'Task created' },
      { action: 'completed', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), text: 'Task completed' }
    ]
  },
  {
    id: 'task-6',
    title: 'Morning mindfulness & meditation',
    description: '15 minutes guided breathing and daily reflection.',
    category: 'health',
    priority: 'low',
    dueDate: today,
    dueTime: '07:30',
    reminder: 'none',
    repeat: 'daily',
    pinned: false,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    tags: ['health', 'morning'],
    subtasks: [],
    notes: 'Felt very energized afterward.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    history: [
      { action: 'completed', timestamp: new Date(Date.now() - 3600000 * 7).toISOString(), text: 'Task completed' }
    ]
  },
  {
    id: 'task-7',
    title: 'Pay monthly broadband bill',
    description: 'High-speed fiber connection renewal.',
    category: 'finance',
    priority: 'medium',
    dueDate: tomorrow,
    dueTime: '12:00',
    reminder: '1d',
    repeat: 'monthly',
    pinned: false,
    completed: false,
    completedAt: null,
    tags: ['finance', 'bills'],
    subtasks: [],
    notes: 'Check for autopay discount.',
    createdAt: new Date().toISOString(),
    history: [
      { action: 'created', timestamp: new Date().toISOString(), text: 'Task created' }
    ]
  },
  {
    id: 'task-8',
    title: 'Weekly grocery restock',
    description: 'Oatmeal, almond milk, Greek yogurt, fruits, coffee beans.',
    category: 'shopping',
    priority: 'low',
    dueDate: nextWeek,
    dueTime: '16:00',
    reminder: '1h',
    repeat: 'weekly',
    pinned: false,
    completed: false,
    completedAt: null,
    tags: ['shopping', 'home'],
    subtasks: [
      { id: 'sub-8-1', title: 'Greek yogurt & berries', completed: false },
      { id: 'sub-8-2', title: 'Fresh coffee beans', completed: false },
      { id: 'sub-8-3', title: 'Almond milk', completed: false }
    ],
    notes: 'Look for organic options.',
    createdAt: new Date().toISOString(),
    history: [
      { action: 'created', timestamp: new Date().toISOString(), text: 'Task created' }
    ]
  }
];

export const INITIAL_HABITS = [
  {
    id: 'habit-1',
    name: 'Drink 3L water',
    icon: 'Droplets',
    emoji: '💧',
    frequency: 'daily',
    streak: 8,
    longestStreak: 14,
    completedDates: [today, yesterday, twoDaysAgo],
    createdAt: new Date().toISOString()
  },
  {
    id: 'habit-2',
    name: 'Code for 1 hour',
    icon: 'Code',
    emoji: '💻',
    frequency: 'daily',
    streak: 12,
    longestStreak: 21,
    completedDates: [today, yesterday, twoDaysAgo],
    createdAt: new Date().toISOString()
  },
  {
    id: 'habit-3',
    name: 'Exercise & workout',
    icon: 'Dumbbell',
    emoji: '🏋️',
    frequency: 'daily',
    streak: 5,
    longestStreak: 9,
    completedDates: [yesterday, twoDaysAgo],
    createdAt: new Date().toISOString()
  },
  {
    id: 'habit-4',
    name: 'Read 20 pages',
    icon: 'BookOpen',
    emoji: '📖',
    frequency: 'daily',
    streak: 6,
    longestStreak: 15,
    completedDates: [today, yesterday],
    createdAt: new Date().toISOString()
  },
  {
    id: 'habit-5',
    name: 'Sleep by 11:30 PM',
    icon: 'Moon',
    emoji: '🌙',
    frequency: 'daily',
    streak: 4,
    longestStreak: 10,
    completedDates: [yesterday],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS = {
  theme: 'dark', // 'dark', 'light', 'system'
  notificationsEnabled: true,
  reminderSound: true,
  defaultPriority: 'medium',
  defaultCategory: 'personal',
  userDisplayName: 'Alex',
};
