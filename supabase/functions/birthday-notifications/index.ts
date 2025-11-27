// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Member {
  id: string
  full_name: string
  date_of_birth: string
  phone: string
  email: string | null
  age?: number
}

function getTodaysBirthdays(members: Member[]): Member[] {
  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  return members.filter(member => {
    const birthDate = new Date(member.date_of_birth)
    const birthMonth = birthDate.getMonth() + 1
    const birthDay = birthDate.getDate()
    
    return birthMonth === todayMonth && birthDay === todayDay
  }).map(member => ({
    ...member,
    age: new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()
  }))
}

function getUpcomingBirthdays(members: Member[], days: number = 7): Member[] {
  const today = new Date()
  const upcoming: Member[] = []

  for (const member of members) {
    const birthDate = new Date(member.date_of_birth)
    const thisYear = today.getFullYear()
    
    // Create this year's birthday
    const thisBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate())
    
    // If birthday already passed this year, check next year
    if (thisBirthday < today) {
      thisBirthday.setFullYear(thisYear + 1)
    }
    
    // Calculate days until birthday
    const daysUntil = Math.ceil((thisBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    // Include if within range and not today
    if (daysUntil > 0 && daysUntil <= days) {
      upcoming.push({
        ...member,
        age: thisBirthday.getFullYear() - birthDate.getFullYear()
      })
    }
  }

  return upcoming.sort((a, b) => {
    const aDate = new Date(a.date_of_birth)
    const bDate = new Date(b.date_of_birth)
    const aMonth = aDate.getMonth()
    const bMonth = bDate.getMonth()
    const aDay = aDate.getDate()
    const bDay = bDate.getDate()
    
    if (aMonth !== bMonth) return aMonth - bMonth
    return aDay - bDay
  })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}`
}

function generateEmailHtml(todaysBirthdays: Member[], upcomingBirthdays: Member[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Birthday Notifications</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎂 Birthday Reminders</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">COP, Macedonia Assembly</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${todaysBirthdays.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: white; margin: 0; font-size: 22px;">🎉 Celebrating Today!</h2>
          </div>
          ${todaysBirthdays.map(member => `
            <div style="background: #fef2f2; border-left: 4px solid #ec4899; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
              <div style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">
                ${member.full_name}
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                🎂 Turns ${member.age}! | 📞 ${member.phone}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${upcomingBirthdays.length > 0 ? `
        <div>
          <div style="background: #1e3a8a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: white; margin: 0; font-size: 22px;">📅 Coming Soon (Next 7 Days)</h2>
          </div>
          ${upcomingBirthdays.map(member => `
            <div style="background: #f3f4f6; border-left: 4px solid #1e3a8a; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
              <div style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">
                ${member.full_name}
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                🎂 ${formatDate(member.date_of_birth)} | 📞 ${member.phone}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>This is an automated notification from COP, Macedonia Assembly</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL')

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL not configured')
    }

    // Fetch all members
    const { data: members, error: fetchError } = await supabase
      .from('members')
      .select('*')
      .order('full_name', { ascending: true })

    if (fetchError) {
      throw new Error(`Failed to fetch members: ${fetchError.message}`)
    }

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No members found', todayCount: 0, upcomingCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get birthdays
    const todaysBirthdays = getTodaysBirthdays(members)
    const upcomingBirthdays = getUpcomingBirthdays(members, 7)

    console.log(`Found ${todaysBirthdays.length} birthdays today`)
    console.log(`Found ${upcomingBirthdays.length} upcoming birthdays`)

    // Only send email if there are birthdays
    if (todaysBirthdays.length === 0 && upcomingBirthdays.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No birthdays to report', todayCount: 0, upcomingCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate email
    const emailHtml = generateEmailHtml(todaysBirthdays, upcomingBirthdays)
    
    let subject = '🎂 Birthday Reminders'
    if (todaysBirthdays.length > 0) {
      subject = `🎉 ${todaysBirthdays.length} Birthday${todaysBirthdays.length > 1 ? 's' : ''} Today!`
    } else if (upcomingBirthdays.length > 0) {
      subject = `📅 ${upcomingBirthdays.length} Upcoming Birthday${upcomingBirthdays.length > 1 ? 's' : ''}`
    }

    // Log the admin email for debugging
    console.log('Sending email to:', adminEmail)
    console.log('Today birthdays:', todaysBirthdays)
    console.log('Upcoming birthdays:', upcomingBirthdays)

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'COP Macedonia Assembly <notifications@yourdomain.com>',
        to: adminEmail,
        subject: subject,
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const emailResult = await resendResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Birthday notifications sent',
        todayCount: todaysBirthdays.length,
        upcomingCount: upcomingBirthdays.length,
        emailId: emailResult.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
