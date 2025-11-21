/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {z} from "zod"; 
import { agentsInsertSchema } from "../../schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea"; 
import {GeneratedAvatar} from "@/components/generated-avatar";
import { Form, FormControl,FormField, FormItem,FormLabel,FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { on } from "events";
import { toast } from "sonner";


interface AgentsFormProps {
    onSucess: () => void;   
    onCancel: () => void;
    initialValues?: AgentGetOne;
}

export const AgentForm = ({
  onCancel, 
  initialValues, 
}: AgentsFormProps) => {
  const trpc = useTRPC();
  const router = useRouter(); 
  const queryClient = useQueryClient(); 

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async() => {
      await queryClient.invalidateQueries(
  trpc.agents.getMany.queryOptions(),
);

       if (initialValues?.id) {
       await  queryClient.invalidateQueries(
           trpc.agents.getOne.queryOptions({ id: initialValues.id }),
     );
   }
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  );

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name || "",
      instructions: initialValues?.instructions || "",
    }
  })

  const isEdit = !!initialValues?.id;
  const isPending = createAgent.isPending; 

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      console.log("TODO: updateAgent")
    } else {
      createAgent.mutate(values);
    }
  };

  return (
  <Form {...form}>
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <GeneratedAvatar
        seed={form.watch("name")}
        variant="botttsNeutral"
        className="border size-16"
      />
      <FormField
        name="name"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
             <FormControl>
              <Input  {...field} placeholder="Name of your agent : ) " />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="instructions"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instructions</FormLabel>
             <FormControl>
              <Textarea  {...field} placeholder="What instructions would u like to give your agent ?.." />
            </FormControl>
             <FormMessage />
          </FormItem>
        )}
        />
        <div className="flex justify-betwween gap-x-3">
  {onCancel && (
    <Button
      variant="ghost"
      disabled={isPending}
      type="button"
      onClick={() => onCancel()}
    >
      Cancel
    </Button>
  )}
  <Button disabled={isPending} type="submit">
    {isEdit ? "Update" : "Create"}
  </Button>
</div>
    </form>
  </Form>
)
};

function onSuccess() {
  throw new Error("Function not implemented.");
}
