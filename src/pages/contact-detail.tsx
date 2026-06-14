import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useContacts, useCompanies } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { IconArrowLeft, IconBuilding, IconMail, IconBrain, IconBrandLinkedin, IconMessageCircle } from "@tabler/icons-react"

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { contacts, isLoading: contactsLoading } = useContacts()

  const contact = contacts.find(c => c.id === Number(id))

  if (contactsLoading) {
    return <div className="p-8 text-ink-3">Loading contact details...</div>
  }

  if (!contact) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-medium text-ink">Contact not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/contacts")}>
          Back to Contacts
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/contacts")}>
            <IconArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-display font-semibold tracking-tight text-ink">
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="flex items-center gap-4 text-ink-3 text-sm">
              {contact.title && (
                <span className="font-medium text-ink-2">{contact.title}</span>
              )}
              {contact.companyName && (
                <span 
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => contact.companyId && navigate(`/companies/${contact.companyId}`)}
                >
                  <IconBuilding className="w-4 h-4" /> {contact.companyName}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-1.5">
                  <IconMail className="w-4 h-4" /> {contact.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.open(contact.linkedinUrl || `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(contact.firstName + " " + contact.lastName)}`)}>
            <IconBrandLinkedin className="w-4 h-4 mr-2" /> LinkedIn
          </Button>
          <Button>
            <IconBrain className="w-4 h-4 mr-2" /> Generate Outreach
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Research & Outreach */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalization Intelligence</CardTitle>
              <CardDescription>Individual insights from LinkedIn & web footprint</CardDescription>
            </CardHeader>
            <CardContent>
              {contact.personProfile ? (
                <div className="prose prose-invert prose-sm max-w-none text-ink-2">
                  {contact.personProfile}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-line rounded-xl">
                  <IconBrain className="w-8 h-8 text-ink-3 mb-3 opacity-50" />
                  <h3 className="text-base font-medium text-ink">No Research Data</h3>
                  <p className="text-sm text-ink-3 mt-1 max-w-md">Run the Deep Researcher agent to analyze this person's background, posts, and potential pain points.</p>
                  <Button variant="outline" className="mt-4">
                    Research Contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Generated Outreach</CardTitle>
                <CardDescription>AI-crafted icebreakers and email drafts</CardDescription>
              </div>
              <IconMessageCircle className="w-5 h-5 text-ink-3" />
            </CardHeader>
            <CardContent>
              {contact.conversationTopics ? (
                <div className="p-4 rounded-lg bg-surface-hover border border-line text-sm text-ink-2 whitespace-pre-wrap font-mono">
                  {contact.conversationTopics}
                </div>
              ) : (
                <div className="text-sm text-ink-3 text-center py-8">
                  No outreach generated yet. Run the Conversation Engine agent.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CRM Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-line pb-2">
                <span className="text-ink-3">Status</span>
                <span className="capitalize text-ink-2">{contact.researchStatus.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center border-b border-line pb-2">
                <span className="text-ink-3">Pipeline Stage</span>
                <span className="capitalize text-ink-2">{contact.userStatus || "New"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-line pb-2">
                <span className="text-ink-3">Added On</span>
                <span className="text-ink-2">{new Date(contact.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
