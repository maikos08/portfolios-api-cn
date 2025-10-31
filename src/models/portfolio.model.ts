export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export class PortfolioModel implements Portfolio {
  id: string;
  name: string;
  description?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;

  constructor(data: Partial<Portfolio>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description;
    this.skills = data.skills;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}
