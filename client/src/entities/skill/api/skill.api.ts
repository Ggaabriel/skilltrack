import { graphqlClient } from "@/shared/api";

export type Skill = {
  id: number;
  name: string;
};

type SkillsQueryResponse = {
  skills: {
    ok: boolean;
    status: number;
    message: string;
    data: Skill[];
  };
};

const SKILLS_QUERY = `
  query Skills {
    skills {
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
type CreateSkillResponse = {
  createSkill: {
    ok: boolean;
    status: number;
    message: string;
    data: Skill;
  };
};

const CREATE_SKILL_MUTATION = `
  mutation CreateSkill($input: CreateSkillInput!) {
    createSkill(input: $input) {
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
export const skillApi = {
  async getSkills(): Promise<Skill[]> {
    const response =
      await graphqlClient.request<SkillsQueryResponse>(SKILLS_QUERY);

    return response.skills.data;
  },
  async createSkill(name: string): Promise<Skill> {
  const response =
    await graphqlClient.request<CreateSkillResponse>(
      CREATE_SKILL_MUTATION,
      { input: { name } },
    );

  return response.createSkill.data;
},
};