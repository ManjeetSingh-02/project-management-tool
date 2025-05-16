import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../../utils/api/apiError.js";
import { APIResponse } from "../../../utils/api/apiResponse.js";
import { ProjectMember } from "./projectmember.models.js";
import { UserRolesEnum } from "../../../utils/constants.js";
import { User } from "../../user/user.models.js";
import { ProjectNote } from "../note/note.models.js";

export const getProjectMembers = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get project members
  const projectMembers = await ProjectMember.find({ project: projectId })
    .select("-project -updatedAt -__v")
    .populate("user", "_id username email");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project members fetched successfully", projectMembers));
});

export const addMemberToProject = asyncHandler(async (req, res) => {
  // get projectId from params
  const { projectId } = req.params;

  // get data
  const { memberId, role } = req.body;

  // check if user exists
  const existingUser = await User.findById(memberId);
  if (!existingUser) throw new APIError(400, "Add Member to Project Error", "User not found");

  // check if user is already a member of the project
  const existingMember = await ProjectMember.findOne({ user: memberId, project: projectId });
  if (existingMember)
    throw new APIError(400, "Add Member to Project Error", "Member already exists in project");

  // create new project member in db
  const newProjectMember = await ProjectMember.create({
    user: memberId,
    project: projectId,
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
  // get projectId and memberId from params
  const { projectId, memberId } = req.params;

  // get project member from db
  const existingProjectMember = await ProjectMember.findOne({
    project: projectId,
    user: memberId,
  });

  // remove all project notes of the user
  await ProjectNote.deleteMany({
    project: projectId,
    createdBy: memberId,
  });

  // delete project member from db
  await existingProjectMember.deleteOne();

  // success status to user
  return res.status(200).json(new APIResponse(200, "Project member deleted successfully"));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  // get projectId and memberId from params
  const { projectId, memberId } = req.params;

  // check if project member exists
  const existingProjectMember = await ProjectMember.findOne({
    project: projectId,
    user: memberId,
  })
    .select("-project -__v")
    .populate("user", "_id username email");
  if (!existingProjectMember)
    throw new APIError(400, "Update Member Role Error", "Project member not found");

  // check if project member is admin and trying to update his role
  if (existingProjectMember.role === UserRolesEnum.ADMIN)
    throw new APIError(400, "Update Member Role Error", "Can't update role of project admin");

  // get data
  const { role } = req.body;

  // check if role is same as existing role
  if (existingProjectMember.role === role)
    throw new APIError(400, "Update Member Role Error", "User already has this role");

  // update project member role
  existingProjectMember.role = role;

  // update project member in db
  await existingProjectMember.save();

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Project member role updated successfully", existingProjectMember));
});
