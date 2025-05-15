import { asyncHandler } from "../../utils/async-handler.js";
import { Project } from "./project.models.js";
import { APIError } from "../../utils/api/apiError.js";
import { APIResponse } from "../../utils/api/apiResponse.js";
import { ProjectMember } from "./projectmember/projectmember.models.js";
import { ProjectNote } from "./note/note.models.js";
import { UserRolesEnum } from "../../utils/constants.js";

export const getProjects = asyncHandler(async (req, res) => {
  // get all projects in which the user is assigned
  const allProjects = await ProjectMember.find({ user: req.user.id })
    .select("project role -_id")
    .populate("project", "_id name description createdBy");
  if (!allProjects.length) throw new APIError(400, "Get All Projects Error", "No projects found");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Projects fetched successfully", allProjects));
});

export const getProjectById = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: projectId })
    .select("-createdAt -updatedAt -__v")
    .populate("createdBy", "_id username email");
  if (!existingProject) throw new APIError(400, "Get Project Error", "Project not found");

  // success status to user
  return res.status(200).json(
    new APIResponse(200, "Project fetched successfully", {
      ...existingProject._doc,
      role: req.user.role,
    }),
  );
});

export const createProject = asyncHandler(async (req, res) => {
  // get data
  const { name, description } = req.body;

  // check if project already exists
  const existingProject = await Project.findOne({ name });
  if (existingProject) throw new APIError(400, "Project Creation Error", "Project already exists");

  // create new project in db
  const newProject = await Project.create({ name, description, createdBy: req.user.id });
  if (!newProject) throw new APIError(400, "Project Creation Error", "Project creation failed");

  // create project member in db
  const defaultProjectMember = await ProjectMember.create({
    user: req.user.id,
    project: newProject._id,
    role: UserRolesEnum.ADMIN,
  });
  if (!defaultProjectMember)
    throw new APIError(400, "Project Creation Error", "Project default member creation failed");

  // success status to user
  return res.status(201).json(
    new APIResponse(201, "Project created successfully", {
      project: {
        _id: newProject._id,
        name: newProject.name,
        description: newProject.description,
        createdAt: newProject.createdAt,
      },
    }),
  );
});

export const updateProject = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get data
  const { name, description } = req.body;

  // check if a project with same name having different id exists
  const existingProject = await Project.findOne({
    name,
    _id: {
      $ne: projectId,
    },
  });
  if (existingProject)
    throw new APIError(
      400,
      "Update Project Error",
      "Another project with same name already exists",
    );

  // update project details in db
  const updatedProject = await Project.findByIdAndUpdate(id, { name, description }, { new: true })
    .select("-createdAt -updatedAt -__v")
    .populate("createdBy", "_id username email");
  if (!updatedProject)
    throw new APIError(400, "Update Project Error", "Project details updation failed");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Project updated successfully", updatedProject));
});

export const deleteProject = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // delete project members notes from db
  await ProjectNote.deleteMany({ project: projectId });

  // delete projectmembers from db
  await ProjectMember.deleteMany({ project: projectId });

  // delete project from db
  await Project.findOneAndDelete({ _id: projectId, createdBy: req.user.id });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Project deleted successfully"));
});
