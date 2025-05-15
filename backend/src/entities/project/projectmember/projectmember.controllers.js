import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { ProjectMember } from "./projectmember.models.js";
import { UserRolesEnum } from "../../../utils/constants.js";
import { User } from "../../user/user.models.js";
import { ProjectNote } from "../note/note.models.js";
import { Project } from "../project.models.js";

export const getProjectMembers = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

  // get project members
  const projectMembers = await ProjectMember.find({ project: id })
    .select("-project -updatedAt -__v")
    .populate("user", "_id username email");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project members fetched successfully", projectMembers));
});

export const addMemberToProject = asyncHandler(async (req, res) => {
  // get id from params
  const { id } = req.params;

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
  return res.status(201).json(
    new APIResponse(201, "Project member added successfully", {
      member: {
        _id: newProjectMember._id,
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
        },
        role: newProjectMember.role,
        createdAt: newProjectMember.createdAt,
      },
    }),
  );
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
    req.user.role === UserRolesEnum.PROJECT_ADMIN &&
    existingProjectMember.role === UserRolesEnum.PROJECT_ADMIN &&
    existingProjectMember.user.toString() !== req.user.id.toString()
  )
    throw new APIError(400, "Delete Member Error", "Cannot delete a project admin");

  // remove all project notes of the user
  await ProjectNote.deleteMany({
    project: id,
    createdBy: memberId,
  });

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
  })
    .select("-project -__v")
    .populate("user", "_id username email");
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
