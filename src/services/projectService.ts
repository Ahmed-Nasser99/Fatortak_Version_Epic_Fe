import { apiClient } from "./api";
import {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";

export const projectService = {
  // Get all projects with pagination and filtering
  getProjects: async (
    pagination: PaginationDto,
    filters?: ProjectFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.name) params.name = filters.name;
      if (filters.status) params.status = filters.status;
      if (filters.clientName) params.clientName = filters.clientName;
    }

    return apiClient.get<PagedResponseDto<ProjectDto>>("/api/projects", params);
  },

  // Get project by ID
  getProject: async (id: string) => {
    return apiClient.get<ProjectDto>(`/api/projects/${id}`);
  },

  // Create new project
  createProject: async (data: CreateProjectDto) => {
    return apiClient.post<ProjectDto>("/api/projects", data);
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectDto) => {
    return apiClient.put<ProjectDto>(`/api/projects/${id}`, data);
  },

  // Delete project
  deleteProject: async (id: string) => {
    return apiClient.delete<boolean>(`/api/projects/${id}`);
  },

  // Update project status
  updateProjectStatus: async (id: string, status: any) => {
    return apiClient.post<ProjectDto>(`/api/projects/${id}/status`, { status });
  },
};
