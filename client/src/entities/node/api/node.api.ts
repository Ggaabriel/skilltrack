import { graphqlClient } from "@/shared/api";

import type { CourseNode, CreateNodeInput, UpdateNodeInput } from "./types";

type NodesResponse = {
  nodes: { data: CourseNode[] };
};

type NodeResponse = {
  createNode?: { data: CourseNode };
  updateNode?: { data: CourseNode };
  deleteNode?: { data: boolean };
};

const NODE_SCALAR_FIELDS = `
  id
  title
  content
  position
  courseId
  parentId
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
    return response.nodes.data;
  },

  async createNode(input: CreateNodeInput): Promise<CourseNode> {
    const response = await graphqlClient.request<NodeResponse>(
      CREATE_NODE_MUTATION,
      { input },
    );
    return response.createNode!.data;
  },

  async updateNode(id: string, input: UpdateNodeInput): Promise<CourseNode> {
    const response = await graphqlClient.request<NodeResponse>(
      UPDATE_NODE_MUTATION,
      { id, input },
    );
    return response.updateNode!.data;
  },

  async deleteNode(id: string): Promise<void> {
    await graphqlClient.request<NodeResponse>(DELETE_NODE_MUTATION, { id });
  },
};
