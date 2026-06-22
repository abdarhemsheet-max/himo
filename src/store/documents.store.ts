import { create } from "zustand";
import { Document } from "@/types/documents";
import { mockDocuments } from "@/lib/mock/documents";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

let _nextId = 100;
const uid = () => `doc_${++_nextId}_${Date.now()}`;

interface DocumentsState {
  documents: Document[];

  fetchAll: () => Promise<void>;
  seedIfEmpty: () => Promise<void>;
  addDocument: (doc: Omit<Document, "id">) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],

  fetchAll: async () => {
    const { data } = await supabase.from("documents").select("*");
    if (data) set({ documents: data as unknown as Document[] });
  },

  seedIfEmpty: async () => {
    const { data: existing } = await supabase.from("documents").select("id").limit(1);
    if (existing && existing.length > 0) return;
    await supabase.from("documents").insert(
      mockDocuments.map(({ id: _id, ...r }) => ({
        name: r.name, type: r.type, tags: r.tags, issue_date: r.issueDate,
        expiry_date: r.expiryDate, file_url: r.fileUrl || "", size: r.size, description: r.description || "",
      }))
    );
    await get().fetchAll();
  },

  addDocument: async (doc) => {
    const newDoc: Document = { id: uid(), ...doc };
    const prev = get().documents;
    set({ documents: [...prev, newDoc] });

    const { error } = await supabase.from("documents").insert({
      name: doc.name, type: doc.type, tags: doc.tags, issue_date: doc.issueDate,
      expiry_date: doc.expiryDate, file_url: doc.fileUrl || "", size: doc.size, description: doc.description || "",
    });
    if (error) { logger.api.supabase("insert document", error, { name: doc.name }); set({ documents: prev }); }
  },
}));
