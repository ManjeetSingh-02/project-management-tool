import { asyncHandler } from "../../utils/async-handler.js";
import { Project } from "./project.models.js";
import { APIError } from "../../utils/api/apiError.js";
import { APIResponse } from "../../utils/api/apiResponse.js";
import { ProjectMember } from "./projectmember.models.js";
import { UserRolesEnum } from "../../utils/constants.js";

export const getProjects = asyncHandler(async (req, res) => {
  // get all projects
  const allProjects = await Project.find({ createdBy: req.user.id }).select(
    "-createdAt -updatedAt -createdBy -__v",
  );
  if (!allProjects) throw new APIError(400, "Get All Projects Error", "No projects found");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Projects fetched successfully", allProjects));
});

export const getProjectById = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: id, createdBy: req.user.id }).select(
    "-createdAt -updatedAt -createdBy -__v",
  );
  if (!existingProject) throw new APIError(400, "Get Project Error", "Project not found");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project fetched successfully", existingProject));
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

  // check if project exists
  const existingProject = await Project.findOne({ _id: id, createdBy: req.user.id }).select(
    "-createdAt -updatedAt -createdBy -__v",
  );
  if (!existingProject) throw new APIError(400, "Update Project Error", "Project not found");

  // get data
  const { name, description } = req.body;

  // update project data
  existingProject.name = name;
  existingProject.description = description;

  // update project in db
  await existingProject.save();

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project updated successfully", existingProject));
});

export const deleteProject = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: id, createdBy: req.user.id });
  if (!existingProject) throw new APIError(400, "Delete Project Error", "Project not found");

  // delete project from db
  await existingProject.deleteOne();

  // delete project members from db
  const projectMembers = await ProjectMember.find({ project: id });
  projectMembers.forEach(async member => await member.deleteOne());

  // success status to user
  return res.status(200).json(new APIResponse(200, "Project deleted successfully"));
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: id, createdBy: req.user.id });
  if (!existingProject) throw new APIError(400, "Get Project Members Error", "Project not found");

  // get project members
  const projectMembers = await ProjectMember.find({ project: id });
  if (!projectMembers) throw new APIError(400, "Get Project Members Error", "No members found");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project members fetched successfully", projectMembers));
});

export const addMemberToProject = async (req, res) => {};

export const deleteMemberFromProject = async (req, res) => {};

export const updateMemberRole = async (req, res) => {};
