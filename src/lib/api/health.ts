import { apiClient } from "@/lib/api/client";

export type HealthResponse = {
  status: "ok";
  service: string;
  version: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>("/health/");
  return response.data;
}
