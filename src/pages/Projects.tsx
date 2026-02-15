import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderKanban,
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useProjects,
  useDeleteProject,
} from "../hooks/useProjects";
import { PaginationDto, ProjectFilterDto, ProjectStatus } from "../types/api";
import { toast } from "react-toastify";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import ProjectModal from "../components/modals/ProjectModal";
import EnhancedDeleteDialog from "../components/ui/enhanced-delete-dialog";
// import { useRoleAccess } from "@/hooks/useRoleAccess"; // Assuming role access is needed later
import { formatDate, formatNumber } from "@/Helpers/localization";

const Projects: React.FC = () => {
   // const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  const filters: ProjectFilterDto = {
    ...(searchTerm && { name: searchTerm }),
  };

  const {
    data: projectsResponse,
    isLoading,
    error,
    refetch,
  } = useProjects(pagination, filters);

  const deleteProjectMutation = useDeleteProject();

  const projects = projectsResponse?.success
    ? projectsResponse.data?.data || []
    : [];
  
  const totalCount = projectsResponse?.success
    ? projectsResponse.data?.totalCount || 0
    : 0;

  const stats = {
      total: totalCount,
      active: projects.filter(p => p.status === ProjectStatus.Active).length,
      completed: projects.filter(p => p.status === ProjectStatus.Completed).length,
  };

  const handleNewProject = () => {
    setEditProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: any) => {
    setEditProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteProjectId(projectId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProjectId) return;

    try {
      const result = await deleteProjectMutation.mutateAsync(deleteProjectId);

      if (result.success) {
        toast.success(
          isRTL
            ? "تم حذف المشروع بنجاح"
            : "Project deleted successfully"
        );
        setDeleteProjectId(null);
        refetch();
      }
    } catch (error) {
      toast.error(
        isRTL ? "فشل في حذف المشروع" : "Failed to delete project"
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const getStatusBadge = (status: ProjectStatus) => {
      switch (status) {
          case ProjectStatus.Active:
              return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{isRTL ? "نشط" : "Active"}</Badge>;
          case ProjectStatus.Completed:
              return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{isRTL ? "مكتمل" : "Completed"}</Badge>;
            case ProjectStatus.NotStarted:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{isRTL ? "لم يبدأ" : "Not Started"}</Badge>;
            case ProjectStatus.OnHold:
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{isRTL ? "معلق" : "On Hold"}</Badge>;
            case ProjectStatus.Cancelled:
                return <Badge className="bg-red-100 text-red-800 border-red-200">{isRTL ? "ملغى" : "Cancelled"}</Badge>;
          default:
              return <Badge variant="secondary">{status}</Badge>;
      }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL ? "خطأ في تحميل المشاريع" : "Error Loading Projects"}
              </h2>
               <Button onClick={() => refetch()} className="w-full">
                {isRTL ? "إعادة المحاولة" : "Retry"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container !max-w-full mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isRTL ? "المشاريع" : "Projects"}
                </h1>
                <p className="text-purple-100 text-lg">
                  {isRTL
                    ? "إدارة مهامك ومشاريعك بكفاءة"
                    : "Manage your tasks and projects efficiently"}
                </p>
              </div>
            </div>

            <Button
              onClick={handleNewProject}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-semibold">
                {isRTL ? "مشروع جديد" : "New Project"}
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-600 font-medium">{isRTL ? "إجمالي المشاريع" : "Total Projects"}</p>
                        <p className="text-2xl font-bold text-blue-900">{formatNumber(stats.total)}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-600 opacity-50" />
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-emerald-600 font-medium">{isRTL ? "مشاريع نشطة" : "Active Projects"}</p>
                        <p className="text-2xl font-bold text-emerald-900">{formatNumber(stats.active)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-600 opacity-50" />
                </CardContent>
            </Card>
             <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-600 font-medium">{isRTL ? "مشاريع مكتملة" : "Completed Projects"}</p>
                        <p className="text-2xl font-bold text-purple-900">{formatNumber(stats.completed)}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-600 opacity-50" />
                </CardContent>
            </Card>
        </div>

        {/* Search */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 ${
                  isRTL ? "right-4" : "left-4"
                } w-5 h-5 text-muted-foreground`}
              />
              <input
                type="text"
                placeholder={
                  isRTL ? "البحث في المشاريع..." : "Search projects..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-3 px-4 ${
                  isRTL ? "pr-12 text-right" : "pl-12"
                } border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {!isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}>
                        {isRTL ? "المشروع" : "Project"}
                      </th>
                      <th className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}>
                        {isRTL ? "العميل" : "Client"}
                      </th>
                      <th className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}>
                         {isRTL ? "الميزانية" : "Budget"}
                      </th>
                        <th className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}>
                         {isRTL ? "الحالة" : "Status"}
                      </th>
                       <th className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}>
                         {isRTL ? "تواريخ" : "Dates"}
                      </th>
                      <th className={`px-6 py-4 text-${isRTL ? "right" : "left"} text-sm font-semibold text-muted-foreground`}>
                        {isRTL ? "إجراءات" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {projects.map((project: any) => (
                      <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold">{project.name}</div>
                          <div className="text-sm text-muted-foreground">{project.description}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{project.customerName || "-"}</td>
                        <td className="px-6 py-4 text-sm font-medium">{project.totalBudget ? formatNumber(project.totalBudget) : "-"}</td>
                        <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex flex-col">
                                {project.startDate && <span>{isRTL ? "من: " : "From: "}{formatDate(project.startDate)}</span>}
                                {project.endDate && <span>{isRTL ? "إلى: " : "To: "}{formatDate(project.endDate)}</span>}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProject(project)}
                              className="text-primary hover:text-primary/80"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View - Simplified */}
             <div className="lg:hidden divide-y divide-border/50">
                {projects.map((project: any) => (
                    <div key={project.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{project.name}</h3>
                                <p className="text-sm text-muted-foreground">{project.customerName}</p>
                            </div>
                            {getStatusBadge(project.status)}
                        </div>
                        <div className="flex justify-between text-sm">
                             <span>{isRTL ? "الميزانية: " : "Budget: "}{project.budget ? formatNumber(project.budget) : "-"}</span>
                        </div>
                         <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                                <Edit className="w-3 h-3" />
                            </Button>
                             <Button variant="outline" size="sm" onClick={() => handleDeleteProject(project.id)} className="text-destructive">
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                ))}
             </div>

              {/* Pagination */}
            <div className="border-t bg-muted/20 px-6 py-4">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                      {isRTL
                        ? `عرض ${formatNumber(projects.length)} من ${formatNumber(totalCount)} مشاريع`
                        : `Showing ${formatNumber(projects.length)} of ${formatNumber(totalCount)} projects`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber <= 1}
                  >
                    {isRTL ? "السابق" : "Previous"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={projects.length < pagination.pageSize} // basic check, ideally use totalPages
                  >
                    {isRTL ? "التالي" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

         {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FolderKanban className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "لا يوجد مشاريع" : "No projects found"}
              </h3>
              <Button
                onClick={handleNewProject}
                className="bg-gradient-to-r from-purple-600 to-purple-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isRTL ? "إضافة أول مشروع" : "Add First Project"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        project={editProject}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
            refetch();
        }}
      />

      <EnhancedDeleteDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleConfirmDelete}
        title={isRTL ? "حذف المشروع" : "Delete Project"}
        description={isRTL ? "هل أنت متأكد من حذف هذا المشروع؟" : "Are you sure you want to delete this project?"}
        itemName={projects.find((p: any) => p.id === deleteProjectId)?.name}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
};

export default Projects;
