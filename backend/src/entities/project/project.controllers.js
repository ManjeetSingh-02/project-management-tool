import { asyncHandler } from "../../utils/async-handler.js";
import { Project } from "./project.models.js";
import { APIError } from "../../utils/api/apiError.js";
import { APIResponse } from "../../utils/api/apiResponse.js";
import { ProjectMember } from "./projectmember/projectmember.models.js";
import { UserRolesEnum } from "../../utils/constants.js";

export const getProjects = asyncHandler(async (req, res) => {
  // get all projects in which the user is assigned
  const allProjects = await ProjectMember.find({ user: req.user.id })
    .select("project role")
    .populate("project", "_id name description createdBy");
  if (!allProjects.length) throw new APIError(400, "Get All Projects Error", "No projects found");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Projects fetched successfully", allProjects));
});

export const getProjectById = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: id }).select("-createdAt -updatedAt -__v");
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
  return res.status(201).json(new APIResponse(201, "Project created successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // get data
  const { name, description } = req.body;

  // update project details in db
  const updatedProject = await Project.findByIdAndUpdate(
    id,
    { name, description },
    { new: true },
  ).select("-createdAt -updatedAt -__v");
  if (!updatedProject)
    throw new APIError(400, "Update Project Error", "Project details updation failed");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Project updated successfully", updatedProject));
});

export const deleteProject = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // delete projectmembers from db
  await ProjectMember.deleteMany({ project: id });

  // delete project from db
  await Project.findOneAndDelete({ _id: id, createdBy: req.user.id });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Project deleted successfully"));
});
