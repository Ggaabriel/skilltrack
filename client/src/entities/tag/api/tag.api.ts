import { graphqlClient } from "@/shared/api";

export type Tag = {
  id: number;
  name: string;
};

type TagsQueryResponse = {
  tags: {
    ok: boolean;
    status: number;
    message: string;
    data: Tag[];
  };
};

type CreateTagResponse = {
  createTag: {
    ok: boolean;
    status: number;
    message: string;
    data: Tag;
  };
};

const TAGS_QUERY = `
  query Tags {
    tags {
      ok
      status
      message
      data {
        id
        name
      }
    }
  }
`;

const CREATE_TAG_MUTATION = `
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      ok
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const tagApi = {
  async getTags(): Promise<Tag[]> {
    const response =
      await graphqlClient.request<TagsQueryResponse>(TAGS_QUERY);

    return response.tags.data;
  },

  async createTag(name: string): Promise<Tag> {
    const response =
      await graphqlClient.request<CreateTagResponse>(
        CREATE_TAG_MUTATION,
        { input: { name } },
      );

    return response.createTag.data;
  },
};