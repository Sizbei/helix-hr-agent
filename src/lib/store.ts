import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type MessageSender = "user" | "ai";

export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
}

export type StepType = "email" | "linkedin";

export interface SequenceStep {
  id: string;
  stepType: StepType;
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
  sessionId: string;

  // Chat state
  messages: Message[];
  isLoading: boolean;

  // Sequences state
  sequences: Sequence[];
  activeSequenceId: string | null;

  // Actions
  addMessage: (content: string, sender: MessageSender) => void;
  setLoading: (isLoading: boolean) => void;

  addSequence: (role: string) => string;
  removeSequence: (sequenceId: string) => void;
  setActiveSequence: (sequenceId: string) => void;
  getActiveSequence: () => Sequence | undefined;

  addSequenceStep: (sequenceId: string, step: Omit<SequenceStep, "id">) => void;
  updateSequenceStep: (
    sequenceId: string,
    stepId: string,
    updates: Partial<SequenceStep>
  ) => void;
  removeSequenceStep: (sequenceId: string, stepId: string) => void;

  // For API integration
  setSessionId: (sessionId: string) => void;
}

const useHelixStore = create<HelixState>((set, get) => ({
  // Initialize with a unique session ID
  sessionId: uuidv4(),

  // Start with a single welcome message
  messages: [
    {
      id: uuidv4(),
      sender: "ai",
      content:
        "Hi, I'm Helix! I can help you create recruiting outreach sequences. What role are you hiring for?",
      timestamp: new Date(),
    },
  ],

  isLoading: false,
  sequences: [],
  activeSequenceId: null,

  // Message actions
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

  // Sequence actions
  addSequence: (role) => {
    // Check for existing sequence with same role (case-insensitive)
    const existingSequence = get().sequences.find(
      (seq) => seq.role.toLowerCase() === role.toLowerCase()
    );

    // If sequence exists, just set it as active and return its id
    if (existingSequence) {
      set({ activeSequenceId: existingSequence.id });
      return existingSequence.id;
    }

    // Otherwise create new sequence
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

  removeSequence: (sequenceId) => {
    set((state) => {
      const newSequences = state.sequences.filter(
        (seq) => seq.id !== sequenceId
      );
      let newActiveId = state.activeSequenceId;

      // Update active sequence if we removed the active one
      if (state.activeSequenceId === sequenceId) {
        newActiveId = newSequences.length > 0 ? newSequences[0].id : null;
      }

      return {
        sequences: newSequences,
        activeSequenceId: newActiveId,
      };
    });
  },

  setActiveSequence: (sequenceId) => set({ activeSequenceId: sequenceId }),

  getActiveSequence: () => {
    const { sequences, activeSequenceId } = get();
    return sequences.find((seq) => seq.id === activeSequenceId);
  },

  // Sequence step actions
  addSequenceStep: (sequenceId, stepData) => {
    const newStep: SequenceStep = {
      id: uuidv4(),
      ...stepData,
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

  // Session management
  setSessionId: (sessionId) => set({ sessionId }),
}));

export default useHelixStore;
