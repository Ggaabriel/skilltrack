export type CourseNode = {
  id: string;
  title: string;
  content: string;
  position: number;
  courseId: string;
  parentId: number | null;
  tags: NodeMetadata[];
  skills: NodeMetadata[];
  children: CourseNode[];
  createdAt: string;
  updatedAt: string;
};

export type NodeMetadata = {
  id: number;
  name: string;
};

export type CreateNodeInput = {
  courseId: number;
  title: string;
  content: string;
  position: number;
  parentId?: number | null;
};

export type UpdateNodeInput = {
  title?: string;
  content?: string;
};

export type MoveNodeInput = {
  parentId: number | null;
  position: number;
};
