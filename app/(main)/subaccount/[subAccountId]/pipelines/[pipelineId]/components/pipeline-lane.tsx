"use client";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import { TicketWithTags, LaneDetail } from "@/lib/types";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreVertical, PlusCircleIcon, Edit, Trash } from "lucide-react";
import { useModal } from "@/providers/ModalProvider";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/modal/custom-modal";
import LaneForm from "@/components/forms/lane-form";
import { deleteLane, saveActivityLogsNotification } from "@/lib/queries";
import { useToast } from "@/components/ui/use-toast";
import TicketForm from "@/components/forms/ticket-form";
import PipelineTicket from "./pipeline-ticket";

interface PipelineLaneProps {
  setAllTickets: Dispatch<SetStateAction<TicketWithTags>>;
  allTickets: TicketWithTags;
  tickets: TicketWithTags;
  pipelineId: string;
  laneDetails: LaneDetail;
  subaccountId: string;
  index: number;
}

const PipelineLane: React.FC<PipelineLaneProps> = ({
  setAllTickets,
  allTickets,
  tickets,
  pipelineId,
  laneDetails,
  subaccountId,
  index,
}) => {
  const { setOpen } = useModal();
  const router = useRouter();
  const { toast } = useToast();

  const amt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  });

  const randomColor = `#${Math.random().toString(16).slice(2, 8)}`;

  const laneAmt = useMemo(() => {
    console.log(tickets);
    return tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    );
  }, [tickets]);

  const addNewTicket = (ticket: TicketWithTags[0]) => {
    setAllTickets([...allTickets, ticket]);
  };

  const handleCreateTicket = () => {
    setOpen(
      <CustomModal
        title="Create a Ticket"
        subHeading="Tickets are a great way to keep track of tasks"
      >
        <TicketForm
          laneId={laneDetails.id}
          subAccountId={subaccountId}
          getNewTicket={addNewTicket}
        />
      </CustomModal>
    );
  };

  const handleEditLane = () => {
    setOpen(
      <CustomModal title="Edit Lane Details" subHeading="">
        <LaneForm pipelineId={pipelineId} defaultData={laneDetails} />
      </CustomModal>
    );
  };

  const handelDeleteLane = async () => {
    try {
      const rsp = await deleteLane(laneDetails.id);
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a Lane | ${rsp.name}`,
        subaccountId,
      });
      toast({
        title: "Success",
        description: "Deleted Lane",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops..",
        description: "Something went wrong",
      });
    }
  };

  return (
    <Draggable
      draggableId={laneDetails.id.toString()}
      key={laneDetails.id}
      index={index}
    >
      {(provided, snapshot) => {
        if (snapshot.isDragging) {
          const offset = { x: 300, y: 0 };
          //   @ts-ignore
          const x = provided.draggableProps.style?.left - offset.x;
          //   @ts-ignore
          const y = provided.draggableProps.style?.top - offset.y;
          //   @ts-ignore
          provided.draggableProps.style = {
            ...provided.draggableProps.style,
            top: y,
            left: x,
          };
        }
        return (
          <div
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="h-full"
          >
            <AlertDialog>
              <DropdownMenu>
                <div className="bg-slate-200/30 dark:bg-background/20  h-[700px] w-[300px] px-4 relative rounded-lg overflow-visible flex-shrink-0 ">
                  <div
                    {...provided.dragHandleProps}
                    className=" h-14 backdrop-blur-lg dark:bg-background/40 bg-slate-200/60  absolute top-0 left-0 right-0 z-10 "
                  >
                    <div className="h-full flex items-center p-4 justify-between cursor-grab border-b-[1px] ">
                      {/* {laneDetails.order} */}
                      <div className="flex items-center w-full gap-2">
                        <div
                          className={cn("w-4 h-4 rounded-full")}
                          style={{ background: randomColor }}
                        />
                        <span className="font-bold text-sm">
                          {laneDetails.name}
                        </span>
                      </div>
                      <div className="flex items-center flex-row">
                        <Badge className="bg-white text-black">
                          {amt.format(laneAmt)}
                        </Badge>
                        <DropdownMenuTrigger>
                          <MoreVertical className="text-muted-foreground cursor-pointer" />
                        </DropdownMenuTrigger>
                      </div>
                    </div>
                  </div>

                  <Droppable
                    droppableId={laneDetails.id.toString()}
                    key={laneDetails.id}
                    type="ticket"
                  >
                    {(provided) => (
                      <div className=" max-h-[700px] overflow-scroll pt-12 ">
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="mt-2"
                        >
                          {tickets.map((ticket, index) => (
                            <PipelineTicket
                              allTickets={allTickets}
                              setAllTickets={setAllTickets}
                              subaccountId={subaccountId}
                              ticket={ticket}
                              key={ticket.id.toString()}
                              index={index}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>

                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger className="w-full">
                      <DropdownMenuItem className="flex items-center gap-2 w-full">
                        <Trash size={15} />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleEditLane}
                    >
                      <Edit size={15} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={handleCreateTicket}
                    >
                      <PlusCircleIcon size={15} />
                      Create Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive"
                      onClick={handelDeleteLane}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </DropdownMenu>
            </AlertDialog>
          </div>
        );
      }}
    </Draggable>
  );
};

export default PipelineLane;
