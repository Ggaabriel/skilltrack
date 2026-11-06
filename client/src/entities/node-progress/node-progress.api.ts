import { graphqlClient } from "@/shared/api";

export type NodeProgress = {
  id: string;
  nodeId: string;
  percentage: number;
  completedAt: string | null;
};

export type CourseProgressSummary = {
  id: string;
  title: string;
  type: string;
  author: {
    id: string;
    name: string;
    picturePath: string | null;
  };
  totalNodes: number;
  completedNodes: number;
  percentage: number;
};

type NodeProgressListResponse = {
  nodeProgress: {
    data: NodeProgress[];
  };
};

type SetNodeProgressResponse = {
  setNodeProgress: {
    ok: boolean;
    message: string;
    data: NodeProgress;
  };
};

type CourseProgressListResponse = {
  myCourseProgress: {
    data: CourseProgressSummary[];
  };
};

type ResetCourseProgressResponse = {
  resetCourseProgress: {
    ok: boolean;
    message: string;
    data: boolean;
  };
};

type RemoveCourseProgressResponse = {
  removeCourseProgress: {
    ok: boolean;
    message: string;
    data: boolean;
  };
};

const NODE_PROGRESS_QUERY = `
  query NodeProgress($courseId: Int!) {
    nodeProgress(courseId: $courseId) {
      data {
        id
        nodeId
        percentage
        completedAt
      }
    }
  }
`;

const SET_NODE_PROGRESS_MUTATION = `
  mutation SetNodeProgress($input: SetNodeProgressInput!) {
    setNodeProgress(input: $input) {
      ok
      message
      data {
        id
        nodeId
        percentage
        completedAt
      }
    }
  }
`;

const COURSE_PROGRESS_QUERY = `
  query MyCourseProgress {
    myCourseProgress {
      data {
        id
        title
        type
        author {
          id
          name
          picturePath
        }
        totalNodes
        completedNodes
        percentage
      }
    }
  }
`;

const RESET_COURSE_PROGRESS_MUTATION = `
  mutation ResetCourseProgress($courseId: Int!) {
    resetCourseProgress(courseId: $courseId) {
      ok
      message
      data
    }
  }
`;

const REMOVE_COURSE_PROGRESS_MUTATION = `
  mutation RemoveCourseProgress($courseId: Int!) {
    removeCourseProgress(courseId: $courseId) {
      ok
      message
      data
    }
  }
`;

export const nodeProgressApi = {
  async getForCourse(courseId: number) {
    const response = await graphqlClient.request<NodeProgressListResponse>(
      NODE_PROGRESS_QUERY,
      { courseId },
    );
    return response.nodeProgress.data;
  },

  async setForNode(nodeId: number, percentage: number) {
    const response = await graphqlClient.request<SetNodeProgressResponse>(
      SET_NODE_PROGRESS_MUTATION,
      { input: { nodeId, percentage } },
    );
    if (!response.setNodeProgress.ok) {
      throw new Error(
        response.setNodeProgress.message || "Failed to save learning progress.",
      );
    }
    return response.setNodeProgress.data;
  },

  async getCourseProgressSummaries() {
    const response = await graphqlClient.request<CourseProgressListResponse>(
      COURSE_PROGRESS_QUERY,
    );
    return response.myCourseProgress.data;
  },

  async resetForCourse(courseId: number) {
    const response = await graphqlClient.request<ResetCourseProgressResponse>(
      RESET_COURSE_PROGRESS_MUTATION,
      { courseId },
    );
    if (!response.resetCourseProgress.ok) {
      throw new Error(
        response.resetCourseProgress.message ||
          "Failed to reset course progress.",
      );
    }
    return response.resetCourseProgress.data;
  },

  async removeFromProgress(courseId: number) {
    const response = await graphqlClient.request<RemoveCourseProgressResponse>(
      REMOVE_COURSE_PROGRESS_MUTATION,
      { courseId },
    );
    if (!response.removeCourseProgress.ok) {
      throw new Error(
        response.removeCourseProgress.message ||
          "Failed to remove course from your progress.",
      );
    }
    return response.removeCourseProgress.data;
  },
};
