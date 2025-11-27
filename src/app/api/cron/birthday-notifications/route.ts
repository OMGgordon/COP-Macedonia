import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { getTodaysBirthdays, getUpcomingBirthdays } from '@/lib/birthdays'
import { Member } from '@/lib/types'
import { BirthdayNotificationEmail } from '@/components/emails/birthday-notification'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if required environment variables are set
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not set')
      return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 })
    }

    // Fetch all members from Supabase
    const supabase = await createClient()
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    if (!members || members.length === 0) {
      console.log('No members found in database')
      return NextResponse.json({ 
        message: 'No members to check',
        todayCount: 0,
        upcomingCount: 0
      })
    }

    // Get today's and upcoming birthdays
    const todaysBirthdays = getTodaysBirthdays(members as Member[])
    const upcomingBirthdays = getUpcomingBirthdays(members as Member[], 7)

    console.log(`Found ${todaysBirthdays.length} birthdays today`)
    console.log(`Found ${upcomingBirthdays.length} upcoming birthdays`)

    // Only send email if there are birthdays to report
    if (todaysBirthdays.length === 0 && upcomingBirthdays.length === 0) {
      return NextResponse.json({ 
        message: 'No birthdays to report',
        todayCount: 0,
        upcomingCount: 0
      })
    }

    // Generate email HTML
    const emailHtml = BirthdayNotificationEmail({
      todaysBirthdays,
      upcomingBirthdays,
    })

    // Determine email subject
    let subject = '🎂 Birthday Reminders'
    if (todaysBirthdays.length > 0) {
      subject = `🎉 ${todaysBirthdays.length} Birthday${todaysBirthdays.length > 1 ? 's' : ''} Today!`
    } else if (upcomingBirthdays.length > 0) {
      subject = `📅 ${upcomingBirthdays.length} Upcoming Birthday${upcomingBirthdays.length > 1 ? 's' : ''}`
    }

    // Send email using Resend
    const { data, error: emailError } = await resend.emails.send({
      from: 'COP Macedonia Assembly <onboarding@resend.dev>', // You'll need to verify your domain or use Resend's test domain
      to: [process.env.ADMIN_EMAIL],
      subject: subject,
      html: emailHtml,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json({ error: 'Failed to send email', details: emailError }, { status: 500 })
    }

    console.log('Email sent successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Birthday notifications sent',
      todayCount: todaysBirthdays.length,
      upcomingCount: upcomingBirthdays.length,
      emailId: data?.id,
    })

  } catch (error) {
    console.error('Error in birthday notification cron:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
