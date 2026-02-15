import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { ProjectDto, CreateProjectDto, ProjectStatus } from "../../types/api";
import { toast } from "react-toastify";
import ClientSelector from "../ui/ClientSelector";

interface ProjectModalProps {
  isOpen: boolean;
  project?: ProjectDto | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSuccess,
}) => {
  const { isRTL, t } = useLanguage();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const isEditing = !!project;

  const [formData, setFormData] = useState<CreateProjectDto>({
    name: project?.name || "",
    description: project?.description || "",
    customerId: project?.customerId || undefined,
    startDate: project?.startDate ? project.startDate.split("T")[0] : "",
    endDate: project?.endDate ? project.endDate.split("T")[0] : "",
    status: project?.status || ProjectStatus.NotStarted,
    budget: project?.totalBudget || 0,
  });

  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        customerId: project.customerId || undefined,
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        endDate: project.endDate ? project.endDate.split("T")[0] : "",
        status: project.status || ProjectStatus.NotStarted,
        budget: project.totalBudget || 0,
      });
    } else {
        setFormData({
            name: "",
            description: "",
            customerId: undefined,
            startDate: "",
            endDate: "",
            status: ProjectStatus.NotStarted,
            budget: 0,
          });
    }
  }, [project, isOpen]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.name) {
      newErrors.name = isRTL ? "اسم المشروع مطلوب" : "Project Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let result;
      if (isEditing && project) {
        result = await updateProjectMutation.mutateAsync({
            id: project.id,
            data: formData
        });
      } else {
        result = await createProjectMutation.mutateAsync(formData);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? (isRTL ? "تم تحديث المشروع بنجاح" : "Project updated successfully")
            : (isRTL ? "تم إنشاء المشروع بنجاح" : "Project created successfully")
        );
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      toast.error(
        isEditing
            ? (isRTL ? "فشل في تحديث المشروع" : "Failed to update project")
            : (isRTL ? "فشل في إنشاء المشروع" : "Failed to create project")
      );
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      customerId: undefined,
      startDate: "",
      endDate: "",
      status: ProjectStatus.NotStarted,
      budget: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing
                ? (isRTL ? "تعديل المشروع" : "Edit Project")
                : (isRTL ? "مشروع جديد" : "New Project")}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "اسم المشروع" : "Project Name"} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: "" });
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } ${isRTL ? "text-right" : "text-left"}`}
                placeholder={isRTL ? "اسم المشروع" : "Project Name"}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Client Selector */}
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "العميل" : "Client"}
              </label>
              <ClientSelector
                value={formData.customerId || ""}
                onChange={(value) =>
                  setFormData({ ...formData, customerId: value })
                }
                placeholder={isRTL ? "اختر العميل" : "Select Client"}
              />
            </div>

            {/* Status */}
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "الحالة" : "Status"}
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProjectStatus })
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                  {Object.values(ProjectStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                  ))}
              </select>
            </div>

             {/* Budget */}
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "الميزانية" : "Budget"}
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: Number(e.target.value) })
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder="0.00"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "تاريخ البدء" : "Start Date"}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "تاريخ الانتهاء" : "End Date"}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? "الوصف" : "Description"}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            />
          </div>

          {/* Buttons */}
          <div
            className={`flex justify-end space-x-4 ${
              isRTL ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              className={`flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {createProjectMutation.isPending || updateProjectMutation.isPending
                  ? (isRTL ? "جاري الحفظ..." : "Saving...")
                  : (isRTL ? "حفظ" : "Save")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
