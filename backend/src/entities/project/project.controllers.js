import { asyncHandler } from "../../utils/async-handler.js";
import { Project } from "./project.models.js";
import { APIError } from "../../utils/api/apiError.js";
import { APIResponse } from "../../utils/api/apiResponse.js";

export const getProjects = async (req, res) => {};

export const getProjectById = async (req, res) => {};

export const createProject = asyncHandler(async (req, res) => {
  // get data
  const { name, description } = req.body;

  // check if project already exists
  const existingProject = await Project.findOne({ name });
  if (existingProject) throw new APIError(400, "Project Creation Error", "Project already exists");

  // create new project in db
  const newProject = await Project.create({ name, description, createdBy: req.user.id });
  if (!newProject) throw new APIError(400, "Project Creation Error", "Project creation failed");

  // success status to user
  return res.status(201).json(new APIResponse(201, "Project created successfully"));
});

export const updateProject = async (req, res) => {};

export const deleteProject = async (req, res) => {};

export const getProjectMembers = async (req, res) => {};

export const addMemberToProject = async (req, res) => {};

export const deleteMemberFromProject = async (req, res) => {};

export const updateMemberRole = async (req, res) => {};
