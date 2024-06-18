"use client";
import CreatePipelineForm from "@/components/forms/create-pipeline-form";
import CustomModal from "@/components/modal/custom-modal";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useModal } from "@/providers/ModalProvider";
import { Pipeline } from "@prisma/client";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type Props = {
  subAccountId: string;
  pipelines: Pipeline[];
  pipelineId: string;
};

const PipelineInfobar = ({
  subAccountId,
  pipelineId,
  pipelines = [],
}: Props) => {
  const { setOpen: setOpenModal, setClose } = useModal();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(pipelineId);
  console.log(pipelines);

  const handleClickCreatePipeline = () => {
    setOpenModal(
      <CustomModal
        title="Create A Pipeline"
        subHeading="Pipelines allows you to group tickets into lanes and track your business processes all in one place."
      >
        <CreatePipelineForm subAccountId={subAccountId} />
      </CustomModal>
    );
  };

  const current_pipeline = pipelines.filter(
    (pipeline) => pipeline.id === pipelineId
  );

  return (
    <div>
      <div className="flex items-end gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild onClick={() => setOpen(true)}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value
                ? pipelines.find((pipe) => pipe.id === value)?.name
                : "Select a pipeline..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandEmpty>No pipelines found.</CommandEmpty>
                <CommandGroup>
                  {pipelines.map((pipe) => (
                    <Link
                      key={pipe.id}
                      href={`/subaccount/${subAccountId}/pipelines/${pipe.id}`}
                    >
                      <CommandItem
                        key={pipe.id}
                        value={pipe.id}
                        onSelect={(currentValue) => {
                          setValue(currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === pipe.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {pipe.name}
                      </CommandItem>
                    </Link>
                  ))}
                  <Button
                    variant="secondary"
                    className="flex gap-2 w-full mt-4"
                    onClick={handleClickCreatePipeline}
                  >
                    <Plus size={15} />
                    Create Pipeline
                  </Button>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default PipelineInfobar;
