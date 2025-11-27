import { BirthdayMember, formatBirthday } from '@/lib/birthdays'

interface BirthdayNotificationEmailProps {
  todaysBirthdays: BirthdayMember[]
  upcomingBirthdays: BirthdayMember[]
}

export function BirthdayNotificationEmail({
  todaysBirthdays,
  upcomingBirthdays,
}: BirthdayNotificationEmailProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Birthday Reminders</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎂 Birthday Reminders</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">${today}</p>
            </td>
          </tr>

          ${todaysBirthdays.length > 0 ? `
          <!-- Today's Birthdays -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #d97706;">
                <h2 style="margin: 0 0 15px 0; color: #78350f; font-size: 22px; display: flex; align-items: center;">
                  🎉 Celebrating Today!
                </h2>
                ${todaysBirthdays.map(member => `
                <div style="background: #ffffff; padding: 15px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #fbbf24;">
                  <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #1f2937;">${member.full_name}</p>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    📅 ${formatBirthday(member.date_of_birth)}
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
                    📞 ${member.phone}
                    ${member.email ? `<br>📧 ${member.email}` : ''}
                  </p>
                </div>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          ${upcomingBirthdays.length > 0 ? `
          <!-- Upcoming Birthdays -->
          <tr>
            <td style="padding: ${todaysBirthdays.length > 0 ? '0' : '30px'} 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #1e3a8a;">
                <h2 style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 22px;">
                  📅 Coming Up (Next 7 Days)
                </h2>
                ${upcomingBirthdays.map(member => {
                  const daysUntil = Math.ceil((new Date(new Date().getFullYear(), new Date(member.date_of_birth).getMonth(), new Date(member.date_of_birth).getDate()).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
                  return `
                <div style="background: #ffffff; padding: 15px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #60a5fa;">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #1f2937;">${member.full_name}</p>
                      <p style="margin: 0; font-size: 14px; color: #6b7280;">
                        📅 ${formatBirthday(member.date_of_birth)}
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
                        📞 ${member.phone}
                        ${member.email ? `<br>📧 ${member.email}` : ''}
                      </p>
                    </div>
                    <div style="background: #1e3a8a; color: #ffffff; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; white-space: nowrap;">
                      ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>
                `}).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          ${todaysBirthdays.length === 0 && upcomingBirthdays.length === 0 ? `
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="margin: 0; font-size: 18px; color: #6b7280;">No birthdays today or in the next 7 days.</p>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                COP, Macedonia Assembly - Church Member Directory
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                This is an automated reminder. Please reach out to celebrate with your members!
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
