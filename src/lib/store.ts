import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface SequenceStep {
  id: string;
  stepType: "email" | "linkedin";
  subject?: string;
  body: string;
  delay: number;
  order: number;
}

export interface Sequence {
  id: string;
  role: string;
  steps: SequenceStep[];
}

interface HelixState {
  // Session management
  sessionId: string | null;

  // Chat state
  messages: Message[];
  isLoading: boolean;

  // Sequences state
  sequences: Sequence[];
  activeSequenceId: string | null;

  // Actions
  addMessage: (content: string, sender: "user" | "ai") => void;
  setLoading: (isLoading: boolean) => void;
  addSequence: (role: string) => void;
  setActiveSequence: (sequenceId: string) => void;
  addSequenceStep: (sequenceId: string, step: Partial<SequenceStep>) => void;
  updateSequenceStep: (
    sequenceId: string,
    stepId: string,
    updates: Partial<SequenceStep>
  ) => void;
  removeSequenceStep: (sequenceId: string, stepId: string) => void;
  getActiveSequence: () => Sequence | undefined;
}

// Initialize with a default session ID and welcome message
const useHelixStore = create<HelixState>((set, get) => ({
  sessionId: uuidv4(),

  messages: [
    {
      id: uuidv4(),
      sender: "ai",
      content:
        "Hi, I'm Helix! I'll help you create recruiting outreach sequences. What role are you hiring for?",
      timestamp: new Date(),
    },
  ],

  isLoading: false,

  sequences: [],
  activeSequenceId: null,

  addMessage: (content, sender) => {
    const newMessage = {
      id: uuidv4(),
      sender,
      content,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),

  addSequence: (role) => {
    const newSequence = {
      id: uuidv4(),
      role,
      steps: [],
    };
    set((state) => ({
      sequences: [...state.sequences, newSequence],
      activeSequenceId: newSequence.id,
    }));
    return newSequence.id;
  },

  setActiveSequence: (sequenceId) => set({ activeSequenceId: sequenceId }),

  addSequenceStep: (sequenceId, stepData) => {
    const newStep: SequenceStep = {
      id: uuidv4(),
      stepType: stepData.stepType || "email",
      subject: stepData.subject || "",
      body: stepData.body || "",
      delay: stepData.delay || 0,
      order: stepData.order || 0,
    };

    set((state) => ({
      sequences: state.sequences.map((seq) => {
        if (seq.id === sequenceId) {
          return {
            ...seq,
            steps: [...seq.steps, newStep],
          };
        }
        return seq;
      }),
    }));
  },

  updateSequenceStep: (sequenceId, stepId, updates) => {
    set((state) => ({
      sequences: state.sequences.map((seq) => {
        if (seq.id === sequenceId) {
          return {
            ...seq,
            steps: seq.steps.map((step) => {
              if (step.id === stepId) {
                return { ...step, ...updates };
              }
              return step;
            }),
          };
        }
        return seq;
      }),
    }));
  },

  removeSequenceStep: (sequenceId, stepId) => {
    set((state) => ({
      sequences: state.sequences.map((seq) => {
        if (seq.id === sequenceId) {
          return {
            ...seq,
            steps: seq.steps.filter((step) => step.id !== stepId),
          };
        }
        return seq;
      }),
    }));
  },

  getActiveSequence: () => {
    const { sequences, activeSequenceId } = get();
    return sequences.find((seq) => seq.id === activeSequenceId);
  },
}));

export default useHelixStore;
