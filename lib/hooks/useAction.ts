'use client'

import { useState, useCallback, useTransition } from 'react'
import { toast } from 'sonner'

type ActionState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
}

type UseActionOptions<T> = {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
}

/**
 * Hook for handling server action calls with loading states and error handling
 */
export function useAction<TInput, TOutput>(
  action: (input: TInput) => Promise<{ success: boolean; error?: string; data?: TOutput } | TOutput>,
  options?: UseActionOptions<TOutput>
) {
  const [state, setState] = useState<ActionState<TOutput>>({
    data: null,
    error: null,
    isLoading: false
  })
  const [isPending, startTransition] = useTransition()

  const execute = useCallback(async (input: TInput) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await action(input)
      
      // Handle both { success, data/error } and direct return formats
      if (typeof result === 'object' && result !== null && 'success' in result) {
        if (result.success) {
          const data = 'data' in result ? result.data as TOutput : result as unknown as TOutput
          setState({ data, error: null, isLoading: false })
          
          if (options?.successMessage) {
            toast.success(options.successMessage)
          }
          options?.onSuccess?.(data)
          return { success: true, data }
        } else {
          const error = result.error || options?.errorMessage || 'Ismeretlen hiba történt'
          setState({ data: null, error, isLoading: false })
          toast.error(error)
          options?.onError?.(error)
          return { success: false, error }
        }
      } else {
        // Direct return value
        setState({ data: result as TOutput, error: null, isLoading: false })
        if (options?.successMessage) {
          toast.success(options.successMessage)
        }
        options?.onSuccess?.(result as TOutput)
        return { success: true, data: result as TOutput }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : options?.errorMessage || 'Hálózati hiba történt'
      setState({ data: null, error: message, isLoading: false })
      toast.error(message)
      options?.onError?.(message)
      return { success: false, error: message }
    }
  }, [action, options])

  // Transition-based execution for non-blocking UI
  const executeWithTransition = useCallback((input: TInput) => {
    startTransition(async () => {
      await execute(input)
    })
  }, [execute])

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false })
  }, [])

  return {
    ...state,
    isLoading: state.isLoading || isPending,
    execute,
    executeWithTransition,
    reset
  }
}

/**
 * Hook for form submission with validation
 */
export function useFormAction<TInput extends Record<string, any>, TOutput>(
  action: (input: TInput) => Promise<{ success: boolean; error?: string; data?: TOutput }>,
  options?: UseActionOptions<TOutput> & {
    resetOnSuccess?: boolean
  }
) {
  const { execute, isLoading, error, data, reset } = useAction(action, options)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TInput, string>>>({})

  const handleSubmit = useCallback(
    async (formData: TInput | FormData) => {
      setFieldErrors({})

      // Convert FormData to object if needed
      const data: TInput = formData instanceof FormData 
        ? Object.fromEntries(formData.entries()) as TInput
        : formData

      const result = await execute(data)
      
      if (result.success && options?.resetOnSuccess) {
        reset()
      }

      return result
    },
    [execute, options?.resetOnSuccess, reset]
  )

  const setFieldError = useCallback((field: keyof TInput, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearFieldError = useCallback((field: keyof TInput) => {
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  return {
    handleSubmit,
    isLoading,
    error,
    data,
    fieldErrors,
    setFieldError,
    clearFieldError,
    reset: () => {
      reset()
      setFieldErrors({})
    }
  }
}
