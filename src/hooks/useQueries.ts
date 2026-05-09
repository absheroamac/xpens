import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSpaces, createSpace, updateSpace, getCategories, createCategory, getExpenses, createExpense, getProfile, updateProfile } from '@/services/api'

export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: getSpaces
  })
}

export function useCreateSpace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
    }
  })
}

export function useUpdateSpace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
    }
  })
}

export function useCategories(spaceId: string) {
  return useQuery({
    queryKey: ['categories', spaceId],
    queryFn: () => getCategories(spaceId),
    enabled: !!spaceId
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.spaceId] })
    }
  })
}

export function useExpenses(spaceId: string) {
  return useQuery({
    queryKey: ['expenses', spaceId],
    queryFn: () => getExpenses(spaceId),
    enabled: !!spaceId
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.spaceId] })
      queryClient.invalidateQueries({ queryKey: ['categories', variables.spaceId] })
    }
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}
