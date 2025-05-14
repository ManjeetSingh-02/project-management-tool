import { asyncHandler } from "../../utils/async-handler.js";
import { Project } from "./project.models.js";
import { APIError } from "../../utils/api/apiError.js";
import { APIResponse } from "../../utils/api/apiResponse.js";
import { ProjectMember } from "./projectmember.models.js";
import { UserRolesEnum } from "../../utils/constants.js";
import { User } from "../user/user.models.js";

export const getProjects = asyncHandler(async (req, res) => {
  // get all projects in which the user is assigned
  const allUserProjects = await ProjectMember.find({ user: req.user.id }).select("project role");
  if (!allUserProjects.length)
    throw new APIError(400, "Get All Projects Error", "No projects found");

  // get all projects details
  const allProjects = await Promise.all(
    allUserProjects.map(async userProject => {
      // get project details
      const project = await Project.findById(userProject.project).select(
        "-createdAt -updatedAt -createdBy -__v",
      );

      // return project details with user role
      return {
        ...project._doc,
        role: userProject.role,
      };
    }),
  );

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

  // check if project exists
  const existingProject = await Project.findOne({ _id: id }).select("-createdAt -updatedAt -__v");
  if (!existingProject) throw new APIError(400, "Update Project Error", "Project not found");

  // get data
  const { name, description } = req.body;

  // update project data
  existingProject.name = name;
  existingProject.description = description;

  // update project in db
  await existingProject.save();

  // success status to user
  return res.status(200).json(
    new APIResponse(200, "Project updated successfully", {
      ...existingProject._doc,
      role: req.user.role,
    }),
  );
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
  const existingProject = await Project.findOne({ _id: id });
  if (!existingProject) throw new APIError(400, "Get Project Members Error", "Project not found");

  // get project members
  const projectMembers = await ProjectMember.find({ project: id });
  if (!projectMembers) throw new APIError(400, "Get Project Members Error", "No members found");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project members fetched successfully", projectMembers));
});

export const addMemberToProject = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: id });
  if (!existingProject) throw new APIError(400, "Add Member to Project Error", "Project not found");

  // get data
  const { memberId, role } = req.body;

  // check if user exists
  const existingUser = await User.findById(memberId);
  if (!existingUser) throw new APIError(400, "Add Member to Project Error", "User not found");

  // check if user is already a member of the project
  const existingMember = await ProjectMember.findOne({ user: memberId, project: id });
  if (existingMember)
    throw new APIError(400, "Add Member to Project Error", "Member already exists in project");

  // create new project member in db
  const newProjectMember = await ProjectMember.create({
    user: memberId,
    project: id,
    role,
  });
  if (!newProjectMember)
    throw new APIError(400, "Add Member to Project Error", "New project member addition failed");

  // success status to user
  return res
    .status(201)
    .json(new APIResponse(201, "Project member added successfully", newProjectMember));
});

export const deleteMemberFromProject = asyncHandler(async (req, res) => {
  // get id and memberId from params
  const { id, memberId } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: id });
  if (!existingProject) throw new APIError(400, "Update Member Role Error", "Project not found");

  // check if project member exists
  const existingProjectMember = await ProjectMember.findOne({
    project: id,
    user: memberId,
  });
  if (!existingProjectMember)
    throw new APIError(400, "Update Member Role Error", "Project member not found");

  // check if someone is trying to delete the creator
  if (existingProject.createdBy.toString() === memberId)
    throw new APIError(400, "Delete Member Error", "Cannot delete project creator");

  // check if user is admin of the project and trying to delete other admin (leave project)
  if (
    existingProjectMember.role === UserRolesEnum.PROJECT_ADMIN &&
    existingProjectMember.user.toString() !== req.user.id.toString()
  )
    throw new APIError(400, "Delete Member Error", "Cannot delete a project admin");

  // delete project member from db
  await existingProjectMember.deleteOne();

  // success status to user
  return res.status(200).json(new APIResponse(200, "Project member deleted successfully"));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  // get id and memberId from params
  const { id, memberId } = req.params;

  // check if project exists
  const existingProject = await Project.findOne({ _id: id });
  if (!existingProject) throw new APIError(400, "Update Member Role Error", "Project not found");

  // check if project member exists
  const existingProjectMember = await ProjectMember.findOne({
    project: id,
    user: memberId,
  });
  if (!existingProjectMember)
    throw new APIError(400, "Update Member Role Error", "Project member not found");

  // get data
  const { role } = req.body;

  // check if user is trying to update their own role
  if (existingProjectMember.user.toString() === req.user.id.toString())
    throw new APIError(400, "Update Member Role Error", "Cannot update your own role");

  // check if user is trying to update the creator's role
  if (existingProject.createdBy.toString() === memberId)
    throw new APIError(400, "Update Member Role Error", "Cannot update project creator's role");

  // check if a project_admin user is trying to update other project_admin's role
  if (
    req.user.role === UserRolesEnum.PROJECT_ADMIN &&
    existingProjectMember.role === UserRolesEnum.PROJECT_ADMIN
  )
    throw new APIError(
      400,
      "Update Member Role Error",
      "Only admin can update other project_admin's role",
    );

  // check if role is same as existing role
  if (existingProjectMember.role === role)
    throw new APIError(400, "Update Member Role Error", "Project member already has this role");

  // update project member role
  existingProjectMember.role = role;

  // update project member in db
  await existingProjectMember.save();

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project member role updated successfully", existingProjectMember));
});
