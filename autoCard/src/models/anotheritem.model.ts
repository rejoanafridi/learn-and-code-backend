import mongoose, { Document, Schema, Types } from 'mongoose'; // Added Types for Schema.Types

// Interface definition based on fields
export interface IAnotheritem extends Document {
  // Standard Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

const anotheritemSchemaDefinition: mongoose.SchemaDefinition = {
};

// If no fields are added, Mongoose will create a schema with only _id.
// Consider adding a default field if fields array is empty, or let Mongoose handle it.
// if (Object.keys(anotheritemSchemaDefinition).length === 0) {
//   console.warn("Schema for Anotheritem is empty. Consider adding fields or a default field.");
//   // Optionally add a default field:
//   // anotheritemSchemaDefinition.name = { type: String, required: true, default: 'Default Name' };
// }

const anotheritemSchema: Schema = new Schema(
  anotheritemSchemaDefinition,
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Example of an index (can be made dynamic based on user input later)
// anotheritemSchema.index({ name: 'text' }); 

export default mongoose.model<IAnotheritem>('Anotheritem', anotheritemSchema);
