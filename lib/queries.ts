"use server";

import { clerkClient, currentUser } from "@clerk/nextjs";
import { db } from "./db";
import { redirect } from "next/navigation";
import {
  Agency,
  Lane,
  Plan,
  Prisma,
  Role,
  SubAccount,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import { v4 } from "uuid";
import {
  CreateFunnelFormSchema,
  CreateMediaType,
  CreatePipelineFormSchema,
} from "./types";
import { z } from "zod";

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });
  return userData;
};

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: {
              id: subaccountId,
            },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    });
  }

  if (!userData) {
    console.log("Couldn't find user");
    return;
  }

  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error("You need subaccount or agency Id");
    }
    const response = await db.subAccount.findUnique({
      where: {
        id: subaccountId,
      },
    });
    if (response) {
      foundAgencyId = response.agencyId;
    }
  }

  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: {
            id: subaccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") {
    return null;
  }
  const response = await db.user.create({ data: { ...user } });
  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });

      await db.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.agencyId;
    } else return null;
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return agency ? agency.agencyId : null;
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: {
      id: agencyId,
    },
  });
  return response;
};
export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) {
    return;
  }
  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });
  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });
  return userData;
};

export const upsertAgency = async (agency?: Agency, price?: Plan) => {
  if (!agency?.companyEmail) {
    return null;
  }
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        SidebarOption: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    });
    return agencyDetails;
  } catch (err) {
    console.log(err);
  }
};

export const getNotificationAndUser = async (agencyId: string) => {
  try {
    const rsp = await db.notification.findMany({
      where: {
        agencyId: agencyId,
      },
      include: {
        User: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return rsp;
  } catch (err) {
    console.log(err);
  }
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) {
    return null;
  }
  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: "AGENCY_OWNER",
    },
  });
  if (!agencyOwner) {
    console.log("🔴Erorr could not create subaccount");
    return;
  }
  const permissionId = v4();
  const rsp = await db.subAccount.upsert({
    where: {
      id: subAccount.id,
    },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: {
          name: "Lead Cycle",
        },
      },
      SidebarOption: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAccount.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    },
  });
  return rsp;
};

export const getUserPermissions = async (userId: string) => {
  const rsp = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      Permissions: {
        include: {
          SubAccount: true,
        },
      },
    },
  });
  return rsp;
};

export const updateUser = async (user: Partial<User>) => {
  const rsp = await db.user.update({
    where: {
      email: user.email,
    },
    data: { ...user },
  });
  await clerkClient.users.updateUserMetadata(rsp.id, {
    privateMetadata: {
      role: rsp.role || "SUBACCOUNT_USER",
    },
  });
  await clerkClient.users.updateUserProfileImage(rsp.id, {
    file: await fetch(rsp.avatarUrl).then((res) => res.blob()),
  });
  return rsp;
};

export const changeUserPermission = async (
  permissionId: string,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const rsp = await db.permissions.upsert({
      where: {
        id: permissionId,
      },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    });
    return rsp;
  } catch (err) {
    console.log("🔴Could not change persmission", err);
  }
};

export const getSubAccountDetails = async (subAccountId: string) => {
  const rsp = await db.subAccount.findUnique({
    where: {
      id: subAccountId,
    },
  });
  return rsp;
};

export const deleteSubAccount = async (subAccountId: string) => {
  const rsp = await db.subAccount.delete({
    where: {
      id: subAccountId,
    },
  });
  return rsp;
};

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
};

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      ignoreExisting: true,
      notify: true,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });
    const rsp = await db.invitation.create({
      data: { email, agencyId, role },
    });
    return rsp;
    console.log(invitation);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getMedia = async (subAccountId: string) => {
  const rsp = await db.subAccount.findUnique({
    where: {
      id: subAccountId,
    },
    include: {
      Media: true,
    },
  });
  return rsp;
};

export const deleteMedia = async (mediaId: string) => {
  const rsp = await db.media.delete({
    where: {
      id: mediaId,
    },
  });
  return rsp;
};

export const createMedia = async (
  subAccountId: string,
  mediaFile: CreateMediaType
) => {
  const rsp = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      subAccountId: subAccountId,
    },
  });
  return rsp;
};

export const getPipelineDetails = async (pipelineId: string) => {
  const rsp = await db.pipeline.findFirst({
    where: {
      id: pipelineId,
    },
  });
  return rsp;
};

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const rsp = await db.lane.findMany({
    where: {
      pipelineId: pipelineId,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      Tickets: {
        orderBy: {
          order: "asc",
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  });
  return rsp;
};

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const rsp = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  });
  return rsp;
};

export const upsertFunnel = async (
  subAccountId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema>,
  funnelId: string
) => {
  const rsp = await db.funnel.upsert({
    where: {
      id: funnelId,
    },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId: subAccountId,
    },
  });
  return rsp;
};

export const deletePipeline = async (pipelineId: string) => {
  const rsp = await db.pipeline.delete({
    where: {
      id: pipelineId,
    },
  });
  return rsp;
};

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      })
    );
    await db.$transaction(updateTrans);
    console.log("🟢 Done reordered 🟢");
  } catch (error) {
    console.log(error, "ERROR UPDATE LANES ORDER");
  }
};

export const updateTicketOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    );
    await db.$transaction(updateTrans);
    console.log("🟢 Done reordered 🟢");
  } catch (error) {
    console.log(error, "🔴 ERROR UPDATE TICKET ORDER");
  }
};
export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  });
  return response;
};
export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number;

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    });

    order = lanes.length;
  } else {
    order = lane.order;
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  });

  return response;
};

export const deleteLane = async (LaneId: string) => {
  const rsp = await db.lane.delete({
    where: {
      id: LaneId,
    },
  });
  return rsp;
};

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  });
  return response;
};

export const getSubAccountTeamMembers = async (subAccountId: string) => {
  const rsp = await db.user.findMany({
    where: {
      Agency: {
        SubAccount: {
          some: {
            id: subAccountId,
          },
        },
      },
      role: "SUBACCOUNT_USER",
      Permissions: {
        some: {
          subAccountId: subAccountId,
          access: true,
        },
      },
    },
  });
  return rsp;
};

export const searchContacts = async (searchTerms: string) => {
  const rsp = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  });
  return rsp;
};

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number;
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: {
        laneId: ticket.laneId,
      },
    });
    order = tickets.length;
  } else {
    order = ticket.order;
  }

  const rsp = await db.ticket.upsert({
    where: {
      id: ticket.id,
    },
    update: {
      ...ticket,
      Tags: { set: tags },
    },
    create: {
      ...ticket,
      Tags: {
        connect: tags,
      },
      order,
    },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  });
  return rsp;
};

export const upsertTag = async (
  subAccountId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const rsp = await db.tag.upsert({
    where: {
      id: tag.id || v4(),
      subAccountId: subAccountId,
    },
    update: tag,
    create: { ...tag, subAccountId: subAccountId },
  });
  return rsp;
};

export const getTagsForSubaccount = async (subAccountId: string) => {
  const rsp = await db.subAccount.findUnique({
    where: {
      id: subAccountId,
    },
    select: {
      Tags: true,
    },
  });
  return rsp;
};

export const deleteTag = async (tagId: string) => {
  const rsp = await db.tag.delete({
    where: {
      id: tagId,
    },
  });
  return rsp;
};

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const rsp = await db.contact.upsert({
    where: {
      id: contact.id || v4(),
    },
    update: contact,
    create: contact,
  });
  return rsp;
};

export const deleteTicket = async (ticketId: string) => {
  const rsp = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  });
  return rsp;
};
