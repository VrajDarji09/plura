import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getAuthUserDetails } from "@/lib/queries";
import { SubAccount } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import CreateSubaccountBtn from "./components/create-new-subaccount";
import DeleteBtn from "./components/delete-btn";

type Props = {
  params: {
    agencyId: string;
  };
};

const page = async ({ params }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) {
    return;
  }
  return (
    <AlertDialog>
      <div className="flex flex-col">
        <CreateSubaccountBtn
          user={user}
          id={params.agencyId}
          className="w-[200px] self-end m-6"
        />
        <Command className="rounded-lg bg-transparent">
          <CommandInput placeholder="Search Accounts..." />
          <CommandList>
            <CommandEmpty>No Accounts Found.</CommandEmpty>
            <CommandGroup>
              {!!user.Agency?.SubAccount.length
                ? user.Agency.SubAccount.map((subaccount: SubAccount) => {
                    return (
                      <CommandItem
                        key={subaccount.id}
                        className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                      >
                        <Link
                          href={`/subaccount/${subaccount.id}`}
                          className="flex gap-4 w-full h-full"
                        >
                          <div className="relative w-32">
                            <Image
                              src={subaccount.subAccountLogo}
                              alt="subaccount logo"
                              fill
                              className="rounded-md object-contain bg-muted/50 p-4"
                            />
                          </div>
                          <div className="flex flex-col justify-between">
                            <div className="flex flex-col">
                              {subaccount.name}
                              <span className="text-xs text-muted-foreground">
                                {subaccount.address}
                              </span>
                            </div>
                          </div>
                        </Link>
                        <AlertDialogTrigger asChild>
                          <Button
                            size={"sm"}
                            className="bg-rose-600 w-20 hover:bg-red-600 hover:text-white"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-left">
                              Are your absolutely sure
                            </AlertDialogTitle>
                            <AlertDescription className="text-left">
                              This action cannot be undon. This will delete the
                              subaccount and all data related to the subaccount.
                            </AlertDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex items-center">
                            <AlertDialogCancel className="mb-2">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive">
                              <DeleteBtn subAccountId={subaccount.id} />
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </CommandItem>
                    );
                  })
                : ""}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  );
};

export default page;
