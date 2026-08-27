export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulleted"
  | "numbered"
  | "todo"
  | "quote"
  | "code"
  | "callout"
  | "divider"
  | "image";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  imageSrc?: string;
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  cover: string | null;
  coverPosition?: number;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}
