import { getAuthUserDetails } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import React from "react";
import MenuOptions from "./menu-options";

interface SidebarProps {
  id: string;
  type: "agency" | "subaccount";
}

const Sidebar: React.FC<SidebarProps> = async ({ id, type }) => {
  const user = await getAuthUserDetails();

  if (!user) return null;
  if (!user.Agency) return;

  const details =
    type === "agency"
      ? user.Agency
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id);

  const isWhiteLabelAgency = user.Agency.whiteLabel;
  if (!details) return;

  let sidebarLogo = user.Agency.agencyLogo;

  if (!isWhiteLabelAgency) {
    if (type === "agency") {
      sidebarLogo =
        user.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }
  const sidebarOptions =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)
          ?.SidebarOption || [];

  const subaccounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subaccount.id && permission.access
    )
  );
  return (
    <>
      <MenuOptions
        defaultOpen={true}
        subAccounts={subaccounts}
        sidebarOpt={sidebarOptions}
        sidebarLogo={sidebarLogo}
        details={details}
        user={user}
        id={id}
      />
      <MenuOptions
        subAccounts={subaccounts}
        sidebarOpt={sidebarOptions}
        sidebarLogo={sidebarLogo}
        details={details}
        user={user}
        id={id}
      />
    </>
  );
};

export default Sidebar;
