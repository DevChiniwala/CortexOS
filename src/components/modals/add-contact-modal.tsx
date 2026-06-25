import * as React from "react"
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "../ui/dialog"
import { Input, Select } from "../ui/input"
import { Button } from "../ui/button"
import { useContactMutations, useCompanies } from "@/lib/hooks"
import type { NewContact } from "@/lib/types"

interface AddContactModalProps {
  open: boolean
  onClose: () => void
  defaultCompanyId?: number
}

export function AddContactModal({ open, onClose, defaultCompanyId }: AddContactModalProps) {
  const { insertContact } = useContactMutations()
  const { companies } = useCompanies()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const [formData, setFormData] = React.useState<NewContact>({
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    linkedinUrl: "",
    companyId: defaultCompanyId
  })
  const [error, setError] = React.useState("")

  const companyOptions = companies.map(c => ({
    value: String(c.id),
    label: c.companyName
  }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "companyId" ? (value ? Number(value) : undefined) : value
    }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and last name are required")
      return
    }

    setIsSubmitting(true)
    try {
      await insertContact(formData)
      onClose()
      setFormData({ firstName: "", lastName: "", email: "", title: "", linkedinUrl: "", companyId: defaultCompanyId })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name *"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. John"
              autoFocus
            />
            <Input
              label="Last Name *"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Doe"
            />
          </div>
          {error && <p className="text-xs text-danger -mt-2">{error}</p>}

          <Input
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. VP of Engineering"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@acme.com"
          />
          <Select
            label="Associated Company"
            name="companyId"
            value={formData.companyId ? String(formData.companyId) : ""}
            onChange={handleChange}
            options={companyOptions}
            placeholder="-- Select a Company --"
          />
          <Input
            label="LinkedIn URL"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            placeholder="e.g. https://linkedin.com/in/johndoe"
          />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Contact"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
