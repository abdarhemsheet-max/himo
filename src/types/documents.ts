export interface Document {
  id: string;
  name: string;
  type: string;
  tags: string[];
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  size: string;
  description?: string;
}
