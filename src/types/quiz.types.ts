export interface Option {
    id: number;
    question_id: number;
    text: string;
    is_correct: boolean;
}

export interface Question {
    id: number;
    quiz_id: number;
    text: string;
    options: Option[];
}

export interface QuizAttempt {
    id: number;
    score: number;
    started_at: string;
    completed_at: string;
    passed: boolean;
}

export interface QuizType {
    id: number;
    title: string;
    created_by: number;
    isQuizPassed: boolean;
    duration_time: number; // in seconds
    questions: Question[];
    isFinal: boolean;
    quiz_attempts?: QuizAttempt[]; // Added quiz_attempts property
}
