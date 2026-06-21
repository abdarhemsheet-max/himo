import { Document } from "@/types/documents";

export const mockDocuments: Document[] = [
  { id: "doc1", name: "جواز السفر", type: "pdf", tags: ["official", "personal"], issueDate: "2022-01-15", expiryDate: "2027-01-15", size: "2.4 MB" },
  { id: "doc2", name: "عقد عمل مع شركة التقنيات", type: "pdf", tags: ["work", "official"], issueDate: "2026-03-01", expiryDate: "2026-09-01", size: "1.8 MB" },
  { id: "doc3", name: "شهادة بكالوريوس", type: "pdf", tags: ["official", "education"], issueDate: "2020-06-20", expiryDate: "2030-06-20", size: "3.1 MB" },
  { id: "doc4", name: "عقد إيجار", type: "pdf", tags: ["official", "personal"], issueDate: "2026-01-01", expiryDate: "2026-12-31", size: "1.2 MB" },
  { id: "doc5", name: "فاتورة اشتراك iCloud", type: "pdf", tags: ["finance"], issueDate: "2026-06-01", expiryDate: "2026-07-01", size: "0.5 MB" },
  { id: "doc6", name: "شهادة دورة React", type: "pdf", tags: ["education", "work"], issueDate: "2026-05-15", expiryDate: "2028-05-15", size: "0.8 MB" },
];
