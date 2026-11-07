import { graphqlClient } from "@/shared/api";

import type {
  CourseNode,
  CreateNodeInput,
  MoveNodeInput,
  UpdateNodeInput,
} from "./types";

type NodesResponse = {
  nodes: { data: CourseNode[] };
};

type NodeResponse = {
  createNode?: { data: CourseNode };
  updateNode?: { data: CourseNode };
  updateNodeTags?: { data: CourseNode };
  updateNodeSkills?: { data: CourseNode };
  moveNode?: { data: CourseNode };
  deleteNode?: { data: boolean };
};

const NODE_SCALAR_FIELDS = `
  id
  title
  content
  position
  courseId
  parentId
  tags { id name }
  skills { id name }
  createdAt
  updatedAt
`;

// GraphQL selection sets cannot be recursive. Requesting several levels keeps
// the API's arbitrary-depth tree usable without introducing a second endpoint.
function nodeFields(depth: number): string {
  if (depth === 0) return NODE_SCALAR_FIELDS;

  return `${NODE_SCALAR_FIELDS} children { ${nodeFields(depth - 1)} }`;
}

const NODE_FIELDS = nodeFields(12);

function normalizeNode(node: CourseNode): CourseNode {
  return {
    ...node,
    tags: node.tags.map((tag) => ({ ...tag, id: Number(tag.id) })),
    skills: node.skills.map((skill) => ({ ...skill, id: Number(skill.id) })),
    children: (node.children ?? []).map(normalizeNode),
  };
}

const NODES_QUERY = `
  query Nodes($courseId: Int!) {
    nodes(courseId: $courseId) {
      data { ${NODE_FIELDS} }
    }
  }
`;

const CREATE_NODE_MUTATION = `
  mutation CreateNode($input: CreateNodeInput!) {
    createNode(input: $input) { data { ${NODE_FIELDS} } }
  }
`;

const UPDATE_NODE_MUTATION = `
  mutation UpdateNode($id: ID!, $input: UpdateNodeInput!) {
    updateNode(id: $id, input: $input) { data { ${NODE_FIELDS} } }
  }
`;

const UPDATE_NODE_TAGS_MUTATION = `
  mutation UpdateNodeTags($id: ID!, $tagIds: [Int!]!) {
    updateNodeTags(id: $id, tagIds: $tagIds) {
      data { ${NODE_FIELDS} }
    }
  }
`;

const UPDATE_NODE_SKILLS_MUTATION = `
  mutation UpdateNodeSkills($id: ID!, $skillIds: [Int!]!) {
    updateNodeSkills(id: $id, skillIds: $skillIds) {
      data { ${NODE_FIELDS} }
    }
  }
`;

const MOVE_NODE_MUTATION = `
  mutation MoveNode($id: ID!, $input: MoveNodeInput!) {
    moveNode(id: $id, input: $input) { data { ${NODE_FIELDS} } }
  }
`;

const DELETE_NODE_MUTATION = `
  mutation DeleteNode($id: ID!) {
    deleteNode(id: $id) { data }
  }
`;

export const nodeApi = {
  async getNodes(courseId: number): Promise<CourseNode[]> {
    const response = await graphqlClient.request<NodesResponse>(NODES_QUERY, {
      courseId,
    });
    return response.nodes.data.map(normalizeNode);
  },

  async createNode(input: CreateNodeInput): Promise<CourseNode> {
    const response = await graphqlClient.request<NodeResponse>(
      CREATE_NODE_MUTATION,
      { input },
    );
    return normalizeNode(response.createNode!.data);
  },

  async updateNode(id: string, input: UpdateNodeInput): Promise<CourseNode> {
    const response = await graphqlClient.request<NodeResponse>(
      UPDATE_NODE_MUTATION,
      { id, input },
    );
    return normalizeNode(response.updateNode!.data);
  },

  async updateNodeTags(id: string, tagIds: number[]): Promise<CourseNode> {
    const response = await graphqlClient.request<NodeResponse>(
      UPDATE_NODE_TAGS_MUTATION,
      { id, tagIds },
    );
    return normalizeNode(response.updateNodeTags!.data);
  },

  async updateNodeSkills(id: string, skillIds: number[]): Promise<CourseNode> {
    const response = await graphqlClient.request<NodeResponse>(
      UPDATE_NODE_SKILLS_MUTATION,
      { id, skillIds },
    );
    return normalizeNode(response.updateNodeSkills!.data);
  },

  async moveNode(id: string, input: MoveNodeInput): Promise<CourseNode> {
    const response = await graphqlClient.request<NodeResponse>(
      MOVE_NODE_MUTATION,
      { id, input },
    );
    return normalizeNode(response.moveNode!.data);
  },

  async deleteNode(id: string): Promise<void> {
    await graphqlClient.request<NodeResponse>(DELETE_NODE_MUTATION, { id });
  },
};
