import {
  getSubAccountTeamMembers,
  saveActivityLogsNotification,
  searchContacts,
  upsertTicket,
} from "@/lib/queries";
import { TicketFormSchema, TicketWithTags } from "@/lib/types";
import { useModal } from "@/providers/ModalProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag, User, Contact } from "@prisma/client";
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TagCreator from "../global/tag-creator";
import { CheckIcon, ChevronsUpDown, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Loading from "../global/Loading";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";

type Props = {
  laneId: string;
  subAccountId: string;
  getNewTicket: (ticket: TicketWithTags[0]) => void;
};

const TicketForm = ({ laneId, subAccountId, getNewTicket }: Props) => {
  const { data: defaultData, setClose } = useModal();
  const [tags, setTags] = useState<Tag[]>([]);
  const [contact, setContact] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [search, setSearch] = useState("");
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState(
    defaultData.ticket?.Assigned?.id || ""
  );

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof TicketFormSchema>>({
    resolver: zodResolver(TicketFormSchema),
    mode: "onChange",
    defaultValues: {
      name: defaultData.ticket?.name || "",
      description: defaultData.ticket?.description || "",
      value: String(defaultData.ticket?.value || 0),
    },
  });

  useEffect(() => {
    if (defaultData.ticket) {
      form.reset({
        name: defaultData.ticket.name || "",
        description: defaultData.ticket?.description || "",
        value: String(defaultData.ticket?.value || 0),
      });
      if (defaultData.ticket.customerId) {
        setContact(defaultData.ticket.customerId);
      }
      const fetchData = async () => {
        if (defaultData.ticket) {
          const rsp = await searchContacts(
            defaultData?.ticket.Customer?.name as string
          );
          console.log(rsp);

          setContactList(rsp);
        }
      };
      fetchData();
    }
  }, [defaultData]);

  const onSubmit = async (values: z.infer<typeof TicketFormSchema>) => {
    if (!laneId) {
      return;
    }
    try {
      const rsp = await upsertTicket(
        {
          ...values,
          laneId,
          id: defaultData.ticket?.id || v4(),
          assignedUserId: assignedTo,
          ...(contact ? { customerId: contact } : {}),
        },
        tags
      );
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a ticket | ${rsp.name}`,
        subaccountId: subAccountId,
      });

      toast({
        title: "Success",
        description: "Saved  details",
      });
      if (rsp) getNewTicket(rsp);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could not save pipeline details",
      });
    }
    setClose();
  };

  const isLoading = form.formState.isLoading;

  useEffect(() => {
    if (subAccountId) {
      const fetchData = async () => {
        const rsp = await getSubAccountTeamMembers(subAccountId);
        if (rsp) {
          setAllTeamMembers(rsp);
        }
      };
      fetchData();
    }
  }, [subAccountId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              disabled={isLoading}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              disabled={isLoading}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              disabled={isLoading}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Value</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Value" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3>Add tags</h3>
            <TagCreator
              subAccountId={subAccountId}
              getSelectedTags={setTags}
              defaultTags={defaultData.ticket?.Tags || []}
            />
            <FormLabel>Assigned To Team Members</FormLabel>
            <Select onValueChange={setAssignedTo} defaultValue={assignedTo}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        Not Assigned
                      </span>
                    </div>
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" src={member.avatarUrl} />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {member.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormLabel>Customers</FormLabel>
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button
                  variant={"outline"}
                  role={"combobox"}
                  className="justify-between"
                >
                  {contact
                    ? contactList.find((c) => c.id === contact)?.name
                    : "Select Customer.."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search Contacts"
                    className="h-9"
                    value={search}
                    onChangeCapture={async (inp) => {
                      // @ts-ignore
                      setSearch(inp.target.value);
                      if (saveTimerRef.current) {
                        clearTimeout(saveTimerRef.current);
                      }
                      saveTimerRef.current = setTimeout(async () => {
                        const rsp = await searchContacts(
                          // @ts-ignore
                          inp.target.value
                        );
                        console.log(contactList);

                        setContactList(rsp);
                        setSearch("");
                      }, 1000);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>No Customer Found.</CommandEmpty>
                    <CommandGroup>
                      {contactList.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.id}
                          onSelect={(cValues) =>
                            setContact(cValues === contact ? "" : cValues)
                          }
                        >
                          {c.name}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              contact === c.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;
