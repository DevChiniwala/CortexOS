import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllContacts,
  getContact,
  getAdjacentContacts,
  insertContact,
  updateContactUserStatus,
  deleteContacts,
  getAllCompanies,
} from "@/lib/ipc";
import { queryKeys, STALE_TIME_ENTITY } from "@/lib/sync";
import { optimisticDelete } from "@/lib/sync/optimistic";
import type { NewContact, ContactWithCompany } from "@/lib/types";

export function useContacts() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.contacts.all,
    queryFn: getAllContacts,
    staleTime: STALE_TIME_ENTITY,
  });

  return {
    contacts: data ?? [],
    isLoading,
    refresh: refetch,
  };
}

export function useCompaniesForSelect() {
  const { data, refetch } = useQuery({
    queryKey: ["company", "list", "select"],
    queryFn: getAllCompanies,
  });

  return {
    companies: data ?? [],
    refresh: refetch,
  };
}

export function useContactDetail(contactId: number) {
  const contactQuery = useQuery({
    queryKey: queryKeys.contacts.detail(contactId),
    queryFn: () => getContact(contactId),
    enabled: !!contactId,
  });

  const adjacentQuery = useQuery({
    queryKey: queryKeys.contacts.adjacent(contactId),
    queryFn: () => getAdjacentContacts(contactId),
    enabled: !!contactId,
  });

  const isLoading = contactQuery.isLoading || adjacentQuery.isLoading;

  const refresh = async () => {
    await Promise.all([contactQuery.refetch(), adjacentQuery.refetch()]);
  };

  return {
    contact: contactQuery.data ?? undefined,
    adjacentContacts: adjacentQuery.data ?? undefined,
    isLoading,
    error: contactQuery.error || adjacentQuery.error,
    refresh,
  };
}

export function useContactMutations() {
  const queryClient = useQueryClient();

  const insertContactMutation = useMutation({
    mutationFn: (data: NewContact) => insertContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });

  const updateContactStatusMutation = useMutation({
    mutationFn: ({ contactId, status }: { contactId: number; status: string }) =>
      updateContactUserStatus(contactId, status),
    // Optimistic: reflect status change immediately
    onMutate: async ({ contactId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all });
      const previous = queryClient.getQueryData<ContactWithCompany[]>(queryKeys.contacts.all);

      if (previous) {
        queryClient.setQueryData<ContactWithCompany[]>(
          queryKeys.contacts.all,
          previous.map((c) =>
            c.id === contactId ? { ...c, userStatus: status } : c
          )
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.contacts.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });

  const deleteContactsMutation = useMutation({
    mutationFn: (contactIds: number[]) => deleteContacts(contactIds),
    onMutate: async (contactIds) => {
      const rollback = optimisticDelete<ContactWithCompany>(
        queryClient,
        [...queryKeys.contacts.all],
        contactIds
      );
      return { rollback };
    },
    onError: (_err, _vars, context) => {
      context?.rollback.rollback();
    },
    onSettled: (_data, _err, _vars, context) => {
      context?.rollback.settle();
    },
  });

  return {
    insertContact: async (data: NewContact) => insertContactMutation.mutateAsync(data),
    updateContactStatus: async (contactId: number, status: string) =>
      updateContactStatusMutation.mutateAsync({ contactId, status }),
    deleteContacts: async (contactIds: number[]) =>
      deleteContactsMutation.mutateAsync(contactIds),
  };
}
