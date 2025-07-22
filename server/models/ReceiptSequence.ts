import mongoose, { Schema, Document } from 'mongoose';

// Receipt Sequence Interface
export interface IReceiptSequence extends Document {
  year: number;
  lastReceiptNumber: number;
  updatedAt: Date;
}

// Receipt Sequence Schema
const ReceiptSequenceSchema: Schema = new Schema(
  {
    year: {
      type: Number,
      required: true,
      unique: true
    },
    lastReceiptNumber: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: true }
  }
);

export const ReceiptSequence = mongoose.model<IReceiptSequence>('ReceiptSequence', ReceiptSequenceSchema);