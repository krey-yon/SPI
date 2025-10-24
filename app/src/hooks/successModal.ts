"use client"

import { useState, useCallback } from "react"

interface RewardConfig {
  amount: number
  currency?: string
  message?: string
}

export function useRewardNotification() {
  const [rewards, setRewards] = useState<(RewardConfig & { id: string })[]>([])

  const showReward = useCallback((config: RewardConfig) => {
    const id = Math.random().toString(36).substring(7)
    setRewards((prev) => [...prev, { ...config, id }])
  }, [])

  const removeReward = useCallback((id: string) => {
    setRewards((prev) => prev.filter((reward) => reward.id !== id))
  }, [])

  return {
    rewards,
    showReward,
    removeReward,
  }
}
