import { invoke } from "@tauri-apps/api/core";
import { isTauriRuntime } from "@/lib/ipc/commands";

export interface ApolloCompany {
  name: string;
  website_url: string | null;
  linkedin_url: string | null;
  primary_domain: string | null;
  short_description: string | null;
  estimated_num_employees: number | null;
}

export async function searchApolloCompanies(query: string): Promise<ApolloCompany[]> {
  if (!isTauriRuntime()) {
    // Mock response for web dev
    return [
      {
        name: `${query} (Mock)`,
        website_url: `https://${query.toLowerCase().replace(/\s+/g, "")}.com`,
        linkedin_url: null,
        primary_domain: `${query.toLowerCase().replace(/\s+/g, "")}.com`,
        short_description: "A mocked company for development without Tauri.",
        estimated_num_employees: 150,
      }
    ];
  }

  return invoke<ApolloCompany[]>("search_apollo_companies", { query });
}

export async function importApolloCompany(company: ApolloCompany): Promise<number> {
  if (!isTauriRuntime()) {
    return Math.floor(Math.random() * 1000);
  }
  return invoke<number>("import_apollo_company", { company });
}
