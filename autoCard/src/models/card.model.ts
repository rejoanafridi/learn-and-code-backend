import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an enum for status for better type safety
export enum CardStatus {
  Todo = 'todo',
  InProgress = 'inprogress',
  Done = 'done',
}

// Define an enum for priority
export enum CardPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface ICard extends Document {
  title: string;
  description?: string;
  status: CardStatus;
  priority: CardPriority;
  dueDate?: Date;
  createdAt: Date; // Automatically added by timestamps
  updatedAt: Date; // Automatically added by timestamps
}

const cardSchema: Schema<ICard> = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CardStatus), // Use enum values
      default: CardStatus.Todo,
    },
    priority: {
      type: String,
      enum: Object.values(CardPriority), // Use enum values
      default: CardPriority.Medium,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Example index (if needed)
// cardSchema.index({ status: 1, priority: 1 });

const Card: Model<ICard> = mongoose.model<ICard>('Card', cardSchema);

export default Card;
