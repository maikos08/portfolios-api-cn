export interface PortfolioDTO {
  id?: string;
  name: string;
  description?: string;
  skills?: string[];
}

export interface CreatePortfolioDTO {
  name: string;
  description?: string;
  skills?: string[];
}

export interface UpdatePortfolioDTO {
  name?: string;
  description?: string;
  skills?: string[];
}
