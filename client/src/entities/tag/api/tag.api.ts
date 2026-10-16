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

type UpdateTagResponse = {
  updateTag: {
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

const UPDATE_TAG_MUTATION = `
  mutation UpdateTag($id: ID!, $input: UpdateTagInput!) {
    updateTag(id: $id, input: $input) {
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
    const response = await graphqlClient.request<TagsQueryResponse>(TAGS_QUERY);

    return response.tags.data.map(toTag);
  },

  async createTag(name: string): Promise<Tag> {
    const response = await graphqlClient.request<CreateTagResponse>(
      CREATE_TAG_MUTATION,
      { input: { name } },
    );

    return toTag(response.createTag.data);
  },

  async updateTag(id: number, name: string): Promise<Tag> {
    const response = await graphqlClient.request<UpdateTagResponse>(
      UPDATE_TAG_MUTATION,
      { id, input: { name } },
    );

    return toTag(response.updateTag.data);
  },
};

function toTag(tag: Tag): Tag {
  return { ...tag, id: Number(tag.id) };
}
