export type BlockSource = "template" | "user";

export interface Block {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  locked: boolean;
  editable: boolean;
  source: BlockSource;
  [key: string]: any;
}

export interface Page {
  id: string;
  number: number;
  blocks: Block[];
}
