// Mimicking the requested SQL Schema in TypeScript interfaces

export enum QuestionType {
  MATH = 'Mathematics',
  CODING = 'Programming',
  TRANSLATION = 'Translation',
  GENERAL = 'General Knowledge',
  UNKNOWN = 'Unknown'
}

// Corresponds to ai_question table
export interface AiQuestion {
  id: string;
  userId: string;
  content: string; // Text content
  imageUri?: string; // Base64 or URL
  audioUri?: string; // Base64
  questionType: QuestionType;
  answer: string;
  explanationSteps: string[];
  relatedKnowledgePoints: string[];
  timestamp: number;
  sender: 'user' | 'ai';
}

// Corresponds to ai_knowledge table
export interface AiKnowledge {
  id: string;
  subject: string;
  rootNode: KnowledgeNode; // JSON structure for the mind map
  weakPoints: string[]; // List of concepts user struggles with
}

export interface KnowledgeNode {
  name: string;
  children?: KnowledgeNode[];
  isWeakPoint?: boolean;
}

// Corresponds to ai_learning_plan table
export interface AiLearningPlan {
  id: string;
  userId: string;
  goal: string;
  currentLevel: string;
  startDate: number;
  endDate: number;
  dailyTasks: DailyTask[];
  progress: number; // 0-100
}

export interface DailyTask {
  day: string; // e.g., "Day 1" or "2023-10-27"
  topics: string[];
  completed: boolean;
}

// Corresponds to ai_resource table
export interface AiResource {
  id: string;
  knowledgeId?: string; // FK
  title: string;
  type: 'Book' | 'Video' | 'Article' | 'Exercise';
  url: string;
  description: string;
  isSaved: boolean;
}
