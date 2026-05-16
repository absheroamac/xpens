import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSpaces() {
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const { data, error } = await supabase
    .from('spaces')
    .select(`
      *,
      space_members!inner(user_id)
    `)
    .eq('space_members.user_id', user.id)
    
  if (error) throw error
  return data
}

export async function getCategories(spaceId: string) {
  if (!spaceId) return []
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const { data: member } = await supabase
    .from('space_members')
    .select('id')
    .eq('space_id', spaceId)
    .eq('user_id', user.id)
    .single()
    
  if (!member) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('space_id', spaceId)
  if (error) throw error
  
  // Also get expenses to calculate 'spent'
  const { data: expenses } = await supabase
    .from('expenses')
    .select('category_id, amount')
    .eq('space_id', spaceId)

  // Calculate spent per category
  return data.map(cat => {
    const spent = expenses
      ?.filter(e => e.category_id === cat.id)
      .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    
    return {
      ...cat,
      spent
    }
  })
}

export async function getExpenses(spaceId: string) {
  if (!spaceId) return []
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const { data: member } = await supabase
    .from('space_members')
    .select('id')
    .eq('space_id', spaceId)
    .eq('user_id', user.id)
    .single()
    
  if (!member) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_splits(user_id, amount)
    `)
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createSpace(name: string) {
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  const { data: space, error } = await supabase
    .from('spaces')
    .insert({
      name,
      invite_code: inviteCode,
      currency: 'INR',
      created_by: user.id
    })
    .select()
    .single()
    
  if (error) {
    console.error("SUPABASE INSERT ERROR:", error)
    throw error
  }

  // Add creator as member
  const { error: memberError } = await supabase
    .from('space_members')
    .insert({
      space_id: space.id,
      user_id: user.id,
      role: 'admin'
    })

  if (memberError) throw memberError

  return space
}

export async function joinSpace(inviteCode: string) {
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const { data: space, error: spaceError } = await supabase
    .from('spaces')
    .select('id')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()

  if (spaceError || !space) throw new Error("Space not found. Check the invite code.")

  const { data: existing } = await supabase
    .from('space_members')
    .select('id')
    .eq('space_id', space.id)
    .eq('user_id', user.id)
    .single()

  if (existing) throw new Error("You're already a member of this space.")

  const { error: memberError } = await supabase
    .from('space_members')
    .insert({ space_id: space.id, user_id: user.id, role: 'member' })

  if (memberError) throw memberError

  return space
}

export async function updateSpace({ spaceId, name }: { spaceId: string, name: string }) {
  const { data, error } = await supabase
    .from('spaces')
    .update({ name })
    .eq('id', spaceId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createCategory({ spaceId, name, budget }: { spaceId: string, name: string, budget: number }) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      space_id: spaceId,
      name,
      budget
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createExpense({ spaceId, categoryId, amount, note }: { spaceId: string, categoryId: string, amount: number, note: string }) {
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      space_id: spaceId,
      category_id: categoryId,
      amount,
      note,
      paid_by: user.id
    })
    .select()
    .single()
    
  if (error) throw error

  // Fetch all members of the space to split the expense equally
  const { data: members, error: membersError } = await supabase
    .from('space_members')
    .select('user_id')
    .eq('space_id', spaceId)

  if (membersError) throw membersError

  if (members && members.length > 0) {
    const splitAmount = amount / members.length
    const splits = members.map(m => ({
      expense_id: expense.id,
      user_id: m.user_id,
      amount: splitAmount
    }))
    
    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert(splits)

    if (splitError) throw splitError
  } else {
    // Fallback if no members found for some reason
    const { error: splitError } = await supabase
      .from('expense_splits')
      .insert({
        expense_id: expense.id,
        user_id: user.id,
        amount
      })

    if (splitError) throw splitError
  }

  return expense
}

export async function getProfile() {
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (error) throw error
  return data
}

export async function updateProfile(name: string) {
  const user = await getUser()
  if (!user) throw new Error("Not logged in")

  const { data, error } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}
