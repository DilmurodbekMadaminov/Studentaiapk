
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export enum Language {
  UZ = 'uz',
  EN = 'en',
  RU = 'ru',
  TR = 'tr',
  AR = 'ar',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  ZH = 'zh',
  JA = 'ja',
  KO = 'ko',
  HI = 'hi',
  PT = 'pt',
  IT = 'it'
}

export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  MODERATOR = 'Moderator',
  EDITOR = 'Editor',
  SUPPORT = 'Support'
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  photoURL?: string;
  isAdmin?: boolean;
  role?: AdminRole;
  createdAt?: Date;
  isPro?: boolean;
  proExpiresAt?: string;
  phone?: string;
  telegramUsername?: string;
  telegramId?: string | number;
  authProvider?: 'email' | 'google' | 'telegram' | 'webauthn';
  appliedPromos?: { code: string; type: string; value: number | string; appliedAt: string; expiresAt?: string | null }[];
  balance?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  isError?: boolean;
  groundingLinks?: { uri: string; title: string }[];
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  };
  reactions?: { [emoji: string]: number };
  userReaction?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  category?: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizState {
  selectedSubject?: string | null;
  selectedVariant: number | null;
  currentQuestionIndex: number;
  score: number;
  showResults: boolean;
  userAnswers: (number | null)[];
  isStarted: boolean;
}

export interface Subject {
  id: string;
  name: string;
  variantSize?: number;
  questions: Question[];
  creator?: string;
  description?: string;
  icon?: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
}

export enum AppView {
  HOME = 'home',
  MATH = 'math',
  SETTINGS = 'settings',
  CHAT = 'chat',
  VISUAL_LAB = 'visual_lab',
  VIDEO_GEN = 'video_gen',
  MAPS = 'maps',
  NOTES = 'notes',
  QUIZ = 'quiz',
  MARKETPLACE = 'marketplace',
  PROFILE = 'profile',
  LIVE_TUTOR = 'live_tutor',
  ADMIN = 'admin',
  COMMUNITY = 'community',
  COACH = 'coach',
  PROGRESS = 'progress',
  EDU_SYSTEM = 'edu_system',
  FREELANCE_HUB = 'freelance_hub',
  WALLET = 'wallet',
  EXAM_MODE = 'exam_mode'
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'in' | 'out';
  provider: 'click' | 'payme' | 'visa' | 'internal';
  description: string;
  timestamp: Date;
}

export interface FreelanceMilestone {
  id: string;
  title: string;
  budget: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline?: string;
  escrowStatus?: 'locked' | 'released' | 'none';
}

export interface FreelanceErrand {
  id: string;
  title: string;
  isCompleted: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface FreelanceAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface FreelanceProject {
  id: string;
  title: string;
  client: string;
  budget: string;
  category: 'Programming' | 'Design' | 'Academic' | 'Translation' | string;
  deadline: string;
  level: 'Entry' | 'Intermediate' | 'Expert' | string;
  description: string;
  verified: boolean;
  skills?: string[];
  clientRating?: number;
  clientReviews?: number;
  postedAt?: string;
  clientEmail?: string;
  clientSpentTotal?: string;
  clientLocation?: string;
  budgetType?: 'fixed' | 'hourly';
  status?: 'open' | 'in_progress' | 'completed' | string;
  bidsCount?: number;
  freelancerEmail?: string;
  freelancerName?: string;
  agreedAmount?: string;
  agreedDays?: string;
  deliverableText?: string;
  jobType?: string;
  milestones?: FreelanceMilestone[];
  errands?: FreelanceErrand[];
  attachments?: FreelanceAttachment[];
  contacts?: {
    phone?: string;
    telegram?: string;
    email?: string;
    company?: string;
  };
}

export interface FreelanceChatMessage {
  id: string;
  text: string;
  isSender: boolean;
  time: string;
  senderName?: string;
  senderRole?: 'employer' | 'freelancer' | 'candidate';
  type?: 'text' | 'offer' | 'milestone_release' | 'file' | 'code' | 'voice' | 'image';
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: string;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  };
  reactions?: { [emoji: string]: number };
  userReaction?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  offerData?: {
    budget: string;
    days: string;
    title: string;
    status: 'pending' | 'accepted' | 'rejected';
  };
  milestoneData?: {
    milestoneId: string;
    title: string;
    amount: string;
    status: 'pending' | 'released';
  };
  fileData?: {
    fileName: string;
    fileSize: string;
    fileType: string;
  };
  codeData?: {
    code: string;
    language: string;
  };
}

export interface FreelanceChat {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerName: string;
  freelancerRole: string;
  unreadCount?: number;
  isOnline?: boolean;
  messages: FreelanceChatMessage[];
}

export interface FreelanceBid {
  id: string;
  projectId: string;
  projectTitle: string;
  amount: string;
  days: string;
  proposal: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  freelancerEmail?: string;
  freelancerName?: string;
  candidateName?: string;
  candidateRole?: string;
  telegramUsername?: string;
}

export interface EduSubject {
  _id: string;
  name: string;
  teacher: string;
  credits: number;
  totalHours: number;
  attendedHours: number;
  midtermGrade: number;
  finalGrade: number;
  assignments: EduAssignment[];
}

export interface EduAssignment {
  _id: string;
  title: string;
  deadline: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  score?: number;
  maxScore: number;
  feedback?: string;
}

export interface UserProgress {
  level: 'Beginner' | 'Pro' | 'Expert';
  points: number;
  badges: string[];
  streak: number;
  completedTopics: string[];
}

export interface Order {
  id: string;
  title: string;
  subject: string;
  type: OrderType;
  price: string;
  deadline: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: Date;
  authorName: string;
}

export type OrderType = 'referat' | 'course_work' | 'presentation' | 'problem_solving' | 'other';

export interface SectionLockConfig {
  sectionId: string;
  sectionName: string;
  isLocked: boolean;
  lockReason: string;
  lockMode?: 'ALL' | 'FREE_ONLY';
  updatedAt?: string;
  updatedBy?: string;
}

export type SectionLockMap = Record<string, SectionLockConfig>;
