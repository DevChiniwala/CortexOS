import * as React from "react"
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "../ui/dialog"
import { Input, Textarea } from "../ui/input"
import { Button } from "../ui/button"
import { useCompanyMutations } from "@/lib/hooks"
import type { NewCompany } from "@/lib/types"

interface AddCompanyModalProps {
  open: boolean
  onClose: () => void
}

export function AddCompanyModal({ open, onClose }: AddCompanyModalProps) {
  const { addCompany } = useCompanyMutations()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState<NewCompany>({
    companyName: "",
    website: "",
    city: "",
    state: "",
    country: ""
  })
  const [error, setError] = React.useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyName.trim()) {
      setError("Company name is required")
      return
    }

    setIsSubmitting(true)
    try {
      await addCompany(formData)
      onClose()
      setFormData({ companyName: "", website: "", city: "", state: "", country: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add company")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>Add Company</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Input
            label="Company Name *"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Acme Corp"
            error={error}
            autoFocus
          />
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="e.g. https://acme.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. San Francisco"
            />
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. CA"
            />
          </div>
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g. USA"
          />
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Company"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
