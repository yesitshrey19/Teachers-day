// Vote answer for a single question
export interface VoteAnswer {
  questionIndex: number;
  answer: string | null; // null = skipped
  isOther: boolean;
}

// Duo vote answer specifically for question 37
export interface DuoVoteAnswer {
  questionIndex: 37;
  faculty1: string;
  faculty2: string;
  isOther: boolean;
}

// Full submission payload
export interface VoteSubmission {
  answers: (VoteAnswer | DuoVoteAnswer)[];
  sessionToken: string;
}

// Aggregated result for a single question
export interface QuestionResult {
  questionIndex: number;
  questionText: string;
  totalVotes: number;
  results: {
    answer: string;
    count: number;
    percentage: number;
  }[];
  leadingAnswer: string;
  otherSubmissions: {
    id: string;
    originalText: string;
    mappedTo: string | null;
    dismissed: boolean;
  }[];
}

// API response types
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidateCodeResponse {
  valid: boolean;
  sessionToken?: string;
}

export interface AdminResultsResponse {
  questions: QuestionResult[];
  pollOpen: boolean;
  totalVoters: number;
}
