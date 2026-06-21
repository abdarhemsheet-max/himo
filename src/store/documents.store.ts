import { create } from "zustand";
import type { Document } from "@/types/documents";
import { mockDocuments } from "@/lib/mock/documents";

let _nextId = 100;
const uid = () => `doc_${++_nextId}_${Date.now()}`;

interface DocumentsState {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id">) => void;
  loadMockData: () => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loadMockData: () => {
    set({ documents: mockDocuments });
  },
  addDocument: (doc) => {
    const newDoc: Document = { id: uid(), ...doc };
    set({ documents: [...get().documents, newDoc] });
  },
}));
